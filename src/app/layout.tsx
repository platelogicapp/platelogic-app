import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PlateLogic - Food Waste Tracking for Restaurants',
  description: 'Stop guessing how much food you waste. Start saving with PlateLogic.',
  keywords: 'food waste, restaurant, tracking, sustainability, cost savings',
  authors: [{ name: 'PlateLogic' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
