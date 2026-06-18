import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Projects | IBF – Innovator Bridge Foundry",
  description: "Browse and discover exciting startup projects looking for student talent on the Innovator Bridge Foundry.",
  openGraph: {
    title: "Explore Projects | IBF",
    description: "Connect with founders and build real-world experience.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
