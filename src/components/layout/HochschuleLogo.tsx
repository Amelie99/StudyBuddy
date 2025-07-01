import Image from 'next/image';
import { cn } from '@/lib/utils';

const HochschuleLogo = ({ iconOnly = false, className }: { iconOnly?: boolean; className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-full aspect-square flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Hochschule Landshut Logo Icon"
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
      {!iconOnly && (
        <span className="font-semibold text-base text-sidebar-foreground whitespace-nowrap">
          HAW Landshut
        </span>
      )}
    </div>
  );
};

export default HochschuleLogo;
