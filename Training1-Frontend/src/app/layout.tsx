import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Training1 - Interactive LMS Platform',
  description: 'Interactive LMS with walkthroughs, live games, compliance learning paths, and built-in authoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}