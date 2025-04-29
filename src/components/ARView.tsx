import React, { useState, useEffect, useRef } from 'react';
import ARDirectionMarker from './ARDirectionMarker';
import { calculateArPosition, calculateBearing, calculateDistance, isPointInView } from '../utils/mapUtils';
import { useToast } from '@/components/ui/use-toast';

interface ARViewProps {
  currentLocation: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  route: google.maps.DirectionsResult | null;
  heading: number | null;
}

const ARView: React.FC<ARViewProps> = ({ currentLocation, destination, route, heading }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [nextWaypoint, setNextWaypoint] = useState<{
    lat: number;
    lng: number;
    instruction: string;
  } | null>(null);
  const { toast } = useToast();

  // Start camera stream
  useEffect(() => {
    if (!videoRef.current) return;

    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setIsCameraReady(true);
            }
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera Error",
          description: "Could not access the camera. Please check permissions.",
          variant: "destructive",
        });
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Extract next waypoint from route
  useEffect(() => {
    if (!route || !route.routes || route.routes.length === 0) {
      setNextWaypoint(null);
      return;
    }

    // Extract next step from directions
    const steps = route.routes[0].legs[0].steps;
    if (steps && steps.length > 0) {
      const step = steps[0];
      setNextWaypoint({
        lat: step.start_location.lat(),
        lng: step.start_location.lng(),
        instruction: step.instructions.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML
      });
    }
  }, [route]);

  // Calculate AR elements position
  const getArPositions = () => {
    if (!currentLocation || !heading) {
      return [];
    }

    const positions = [];

    // Add destination marker
    if (destination) {
      const bearing = calculateBearing(
        currentLocation.lat,
        currentLocation.lng,
        destination.lat,
        destination.lng
      );
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        destination.lat,
        destination.lng
      );
      const inView = isPointInView(heading, bearing);
      const position = calculateArPosition(bearing, heading, distance);
      
      positions.push({
        key: "destination",
        position,
        distance,
        isInView: inView,
        instruction: "Destination"
      });
    }

    // Add next waypoint marker
    if (nextWaypoint) {
      const bearing = calculateBearing(
        currentLocation.lat,
        currentLocation.lng,
        nextWaypoint.lat,
        nextWaypoint.lng
      );
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        nextWaypoint.lat,
        nextWaypoint.lng
      );
      const inView = isPointInView(heading, bearing);
      const position = calculateArPosition(bearing, heading, distance);
      
      positions.push({
        key: "waypoint",
        position,
        distance,
        isInView: inView,
        instruction: nextWaypoint.instruction
      });
    }

    return positions;
  };

  const arPositions = getArPositions();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video 
        ref={videoRef}
        className="absolute w-full h-full object-cover"
        playsInline
        muted
        style={{ opacity: isCameraReady ? 1 : 0 }}
      />
      
      {!isCameraReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <div className="text-lg">Loading camera...</div>
          </div>
        </div>
      )}
      
      <div className="ar-overlay">
        {arPositions.map((item) => (
          <ARDirectionMarker
            key={item.key}
            position={item.position}
            distance={item.distance}
            instruction={item.instruction}
            isInView={item.isInView}
          />
        ))}
      </div>
    </div>
  );
};

export default ARView;
