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
          src="https://i.imgur.com/TWlczaF.jpeg"
          alt="Hochschule Landshut campus background"
          fill
          className="object-cover"
          data-ai-hint="university campus"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
