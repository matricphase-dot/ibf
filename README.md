# IBF – Innovator Bridge Foundry

The ultimate platform for founders to launch projects and for students to gain real-world experience. Built for speed, security, and real-time collaboration.

## Features
- **Glassmorphism UI**: Modern aesthetic built with Tailwind CSS.
- **Authentication Gate**: Fully protected routes using NextAuth.
- **Role-based Dashboards**: Custom views for Founders and Students.
- **Pagination**: Scalable cursor-based pagination for large datasets.
- **Real-time Chat**: Powered by Socket.io.
- **Email Notifications**: Setup with Nodemailer.
- **Security Headers & Analytics**: Production-ready.

## Prerequisites
- Node.js >= 18
- PostgreSQL Database

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file based on your `.env.local` or setup:
   ```env
   DATABASE_URL="postgres://..."
   NEXTAUTH_SECRET="your_strong_secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: Email Notifications
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="user"
   EMAIL_SERVER_PASSWORD="password"
   EMAIL_FROM="noreply@ibf.com"
   ```

3. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Run the Server**
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel.
2. Ensure you have the `vercel.json` included in your root repository to handle WebSocket rewrites.
3. If Socket.io requires an independent long-running server, it's recommended to deploy the custom Node server on Railway/Render and the Next.js frontend on Vercel.

**Build Scripts:**
- `"build": "next build"`
- `"start": "NODE_ENV=production node server.js"`
