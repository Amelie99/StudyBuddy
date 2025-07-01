import Image from 'next/image';
import { cn } from '@/lib/utils';

const HochschuleLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
        <Image
          src="/logo.png"
          alt="Hochschule Landshut Logo"
          layout="fill"
          objectFit="contain"
          priority
        />
    </div>
  );
};

export default HochschuleLogo;
