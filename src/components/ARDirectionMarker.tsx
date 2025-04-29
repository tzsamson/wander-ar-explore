
import React from 'react';
import { Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

interface ARDirectionMarkerProps {
  position: {
    x: number; // -1 to 1 (where 0 is center)
    y: number; // -1 to 1 (where 0 is center)
    scale: number;
  };
  distance: number;
  instruction?: string;
  isInView: boolean;
}

const ARDirectionMarker: React.FC<ARDirectionMarkerProps> = ({ 
  position, 
  distance,
  instruction,
  isInView 
}) => {
  // Calculate screen position from normalized coordinates
  const screenX = `${50 + position.x * 50}%`;
  const screenY = `${50 + position.y * 50}%`;
  
  if (!isInView) return null;

  return (
    <motion.div
      className="absolute pointer-events-auto"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1,
        scale: position.scale,
        x: screenX,
        y: screenY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ left: 0, top: 0 }}
    >
      <div className="flex flex-col items-center">
        <motion.div 
          animate={{ y: [0, -5, 0] }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="bg-navigation-highlight text-navigation-light p-3 rounded-full shadow-lg"
        >
          <Navigation size={24} strokeWidth={2.5} className="text-white" />
        </motion.div>
        
        {distance && (
          <div className="bg-black/60 text-white px-3 py-1 rounded-full mt-2 text-sm font-medium">
            {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}
          </div>
        )}
        
        {instruction && (
          <div className="bg-navigation-primary/90 text-white px-4 py-2 rounded-lg mt-2 max-w-[200px] text-center shadow-md">
            {instruction}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ARDirectionMarker;
