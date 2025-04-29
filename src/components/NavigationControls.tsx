
import React from 'react';
import { Map as MapIcon, Compass, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationControlsProps {
  arMode: boolean;
  onToggleArMode: () => void;
  onRecenter: () => void;
  className?: string;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  arMode,
  onToggleArMode,
  onRecenter,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "w-12 h-12 rounded-full shadow-lg bg-white border border-gray-200",
          arMode && "bg-navigation-primary text-white hover:bg-navigation-primary/90"
        )}
        onClick={onToggleArMode}
      >
        {arMode ? (
          <MapIcon size={20} strokeWidth={2} />
        ) : (
          <Compass size={20} strokeWidth={2} />
        )}
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-white border border-gray-200"
        onClick={onRecenter}
      >
        <RotateCcw size={18} strokeWidth={2} />
      </Button>
    </div>
  );
};

export default NavigationControls;
