
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface MapProps {
  currentLocation: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onRouteUpdate?: (route: google.maps.DirectionsResult) => void;
  className?: string;
}

// Added this interface to declare the global initMap function
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

const Map: React.FC<MapProps> = ({ currentLocation, destination, onRouteUpdate, className }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      window.initMap();
      return;
    }

    const googleMapsScript = document.createElement('script');
    
    // Replace YOUR_API_KEY with an actual Google Maps API key
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCuQ4ijj8UEZrge9r0j9Feo5DTb1fb5WXQ&libraries=places&callback=initMap`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    // Define the callback function
    window.initMap = () => {
      if (!mapRef.current) return;
      
      const mapOptions = {
        zoom: 16,
        center: currentLocation || { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: "8e0a97af9386fef"
      };
      
      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      const newDirectionsService = new google.maps.DirectionsService();
      setDirectionsService(newDirectionsService);
      
      const newDirectionsRenderer = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#0F52BA",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      setDirectionsRenderer(newDirectionsRenderer);
      
      if (currentLocation) {
        const marker = new google.maps.Marker({
          position: currentLocation,
          map: newMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#0F52BA",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });
        setUserMarker(marker);
        
        // Add accuracy circle
        new google.maps.Circle({
          map: newMap,
          center: currentLocation,
          radius: 30, // Accuracy radius in meters
          fillColor: "#0F52BA",
          fillOpacity: 0.15,
          strokeWeight: 0,
        });
      }
    };
    
    document.head.appendChild(googleMapsScript);
    
    return () => {
      if (window.google && window.google.maps && document.head.contains(googleMapsScript)) {
        document.head.removeChild(googleMapsScript);
      }
      delete window.initMap;
    };
  }, [currentLocation]);

  // Update user location marker
  useEffect(() => {
    if (!map || !currentLocation || !userMarker) return;
    
    userMarker.setPosition(currentLocation);
    map.panTo(currentLocation);
  }, [map, currentLocation, userMarker]);

  // Calculate route when destination changes
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !currentLocation || !destination) return;
    
    const origin = new google.maps.LatLng(currentLocation.lat, currentLocation.lng);
    const dest = new google.maps.LatLng(destination.lat, destination.lng);
    
    directionsService.route(
      {
        origin: origin,
        destination: dest,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          
          if (onRouteUpdate && result) {
            onRouteUpdate(result);
          }
          
          // Add destination marker
          new google.maps.Marker({
            position: destination,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: "#FF8C00",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#FFFFFF",
            },
          });
        } else {
          toast({
            title: "Directions request failed",
            description: status,
            variant: "destructive",
          });
        }
      }
    );
  }, [directionsService, directionsRenderer, currentLocation, destination, map, onRouteUpdate, toast]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ opacity: map ? 1 : 0.4, transition: 'opacity 0.3s ease' }}
    />
  );
};

export default Map;
