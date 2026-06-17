const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const compression = require("compression");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Gzip/Brotli compression for all responses (biggest perf win)
const compress = compression({ level: 6 });

// Cache resolved NEXTAUTH_URL per host to avoid recalculating every request
let cachedHost = "";

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join general room
    socket.on("join-general", () => {
      socket.join("general");
      console.log(`User ${socket.id} joined general chat`);
    });

    // Join private project room
    socket.on("join-direct", (projectId) => {
      socket.join(`direct:${projectId}`);
      console.log(`User ${socket.id} joined direct chat for project: ${projectId}`);
    });

    // Handle general messages
    socket.on("send-general-message", (message) => {
      io.to("general").emit("new-general-message", message);
    });

    // Handle direct messages
    socket.on("send-direct-message", ({ projectId, message }) => {
      io.to(`direct:${projectId}`).emit("new-direct-message", message);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  function handler(req, res) {
    // Apply gzip compression to all responses
    compress(req, res, () => {
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      if (host && host !== cachedHost) {
        cachedHost = host;
        let protocol = req.headers["x-forwarded-proto"] || "http";
        // Tunnel services (localtunnel, ngrok, etc.) use HTTPS externally
        // but may not set x-forwarded-proto. Detect non-localhost hosts
        // and default to https to prevent CSRF/cookie mismatches.
        const hostname = host.split(":")[0];
        if (hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.startsWith("192.168.")) {
          protocol = "https";
        }
        process.env.NEXTAUTH_URL = `${protocol}://${host}`;
      }
      handle(req, res);
    });
  }

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
