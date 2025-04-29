import React, { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import Map from '@/components/Map';
import ARView from '@/components/ARView';
import SearchBar from '@/components/SearchBar';
import NavigationControls from '@/components/NavigationControls';
import { useToast } from '@/components/ui/use-toast';
import { getGoogleMapsDirectionsUrl } from '@/utils/mapUtils';
import { Button } from '@/components/ui/button';
import { ExternalLink, Navigation } from 'lucide-react';

const Index = () => {
  // State
  const [arMode, setArMode] = useState(false);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  }>({ alpha: null, beta: null, gamma: null });
  
  // Hooks
  const { coordinates, heading, error } = useGeolocation({
    watchPosition: true,
    enableHighAccuracy: true,
  });
  const { toast } = useToast();
  const hasShownArIntro = useRef(false);

  // Check for permissions and show errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Location Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show AR mode introduction
  useEffect(() => {
    if (arMode && !hasShownArIntro.current && coordinates) {
      toast({
        title: "AR Navigation Mode",
        description: "Point your camera in different directions to see AR waypoints.",
        duration: 5000,
      });
      hasShownArIntro.current = true;
    }
  }, [arMode, coordinates, toast]);

  // Request and track device orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      });
    };

    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS 13+ requires permission
      document.addEventListener('click', async () => {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (err) {
          console.error('Error requesting device orientation permission:', err);
        }
      }, { once: true });
    } else {
      // Non iOS or older iOS
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Convert coordinates to Google Maps format
  const currentLocation = coordinates 
    ? { lat: coordinates.latitude, lng: coordinates.longitude }
    : null;
    
  // Handle search results
  const handleSearch = (location: { lat: number; lng: number; name: string }) => {
    setDestination(location);
    toast({
      title: "Destination Set",
      description: `Navigating to ${location.name}`,
    });
  };
  
  // Clear search
  const handleClearSearch = () => {
    setDestination(null);
    setRoute(null);
  };
  
  // Recenter map
  const handleRecenter = () => {
    if (!currentLocation) {
      toast({
        title: "Location Unavailable",
        description: "Unable to determine your current location.",
        variant: "destructive",
      });
      return;
    }
  };
  
  // Toggle AR mode
  const toggleArMode = () => {
    if (!arMode && !coordinates) {
      toast({
        title: "Location Required",
        description: "Please enable location services to use AR navigation.",
        variant: "destructive",
      });
      return;
    }
    
    setArMode(!arMode);
  };

  const getHeadingSource = () => {
    // Use device compass if available, otherwise use geolocation heading
    if (deviceOrientation.alpha !== null) {
      return deviceOrientation.alpha;
    }
    return heading;
  };

  const openInGoogleMaps = () => {
    if (!currentLocation || !destination) return;
    
    const url = getGoogleMapsDirectionsUrl(currentLocation, destination);
    window.open(url, '_blank');
  };
  
  return (
    <div className="relative w-full h-screen">
      {/* Main Content */}
      <div className="relative w-full h-full">
        {arMode ? (
          <ARView 
            currentLocation={currentLocation}
            destination={destination}
            route={route}
            heading={getHeadingSource()}
          />
        ) : (
          <Map 
            currentLocation={currentLocation}
            destination={destination}
            onRouteUpdate={setRoute}
            className="w-full h-full"
          />
        )}
      </div>
      
      {/* Search Bar */}
      <div className="absolute top-5 left-5 right-5">
        <SearchBar 
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-8 right-5">
        <NavigationControls
          arMode={arMode}
          onToggleArMode={toggleArMode}
          onRecenter={handleRecenter}
        />
      </div>
      
      {/* Bottom Info Bar */}
      {destination && route && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm rounded-t-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Destination</div>
              <div className="font-semibold truncate pr-4">{destination.name}</div>
              {route.routes && route.routes[0] && (
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <Navigation size={14} className="mr-1" />
                  <span>
                    {route.routes[0].legs[0].distance?.text} • {route.routes[0].legs[0].duration?.text}
                  </span>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={openInGoogleMaps}
            >
              <ExternalLink size={14} />
              Google Maps
            </Button>
          </div>
        </div>
      )}
      
      {/* Intro Message */}
      {!destination && !arMode && (
        <div className="absolute bottom-28 left-0 right-0 flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg max-w-xs text-center">
            <h3 className="font-medium mb-1">WanderAR Explorer</h3>
            <p className="text-sm text-gray-600">Search for a destination to start AR navigation</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
