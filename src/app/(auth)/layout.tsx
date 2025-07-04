
import React from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.imgur.com/D267ZyT.jpeg"
          alt="Hochschule Landshut campus background"
          fill
          sizes="100vw"
          className="object-cover"
          data-ai-hint="university modern"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
