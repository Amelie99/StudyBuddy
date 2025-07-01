import { cn } from '@/lib/utils';

const HochschuleLogo = ({ className, iconOnly = false }: { className?: string, iconOnly?: boolean }) => {
  return (
    <div className={cn("flex items-center justify-center font-bold text-primary", className)}>
        {iconOnly ? (
            <span className="text-2xl">HAW</span>
        ) : (
            <span className="text-xl tracking-tight">HAW Landshut</span>
        )}
    </div>
  );
};

export default HochschuleLogo;
