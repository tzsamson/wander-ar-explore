import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (location: { lat: number; lng: number; name: string }) => void;
  onClear: () => void;
  className?: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, className }) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Initialize services
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      // Need to create a dummy element for PlacesService
      const placesDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(placesDiv);
    }
  }, []);

  // Handle search query changes
  useEffect(() => {
    if (!query || !autocompleteService.current) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      autocompleteService.current?.getPlacePredictions(
        {
          input: query,
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setSearchResults([]);
            return;
          }
          setSearchResults(predictions);
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSelect = (placeId: string, description: string) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: placeId,
        fields: ['geometry', 'name', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          onSearch({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.name || description,
          });
          setQuery(place.name || description);
          setHasSearched(true);
          setIsActive(false);
          setSearchResults([]);
        }
      }
    );
  };

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    setSearchResults([]);
    onClear();
  };

  return (
    <div className={`relative z-10 ${className || ''}`}>
      <div className={`flex items-center bg-white rounded-full shadow-lg transition-all duration-300 ${isActive ? 'w-full' : ''}`}>
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search destination"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsActive(true)}
            className="h-12 pl-12 pr-10 rounded-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
          />
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={18}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleClear}
            >
              <X size={18} className="text-gray-400" />
            </Button>
          )}
        </div>
      </div>

      {isActive && searchResults.length > 0 && (
        <div className="absolute top-14 left-0 right-0 bg-white shadow-lg rounded-lg overflow-hidden max-h-72 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={result.place_id}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100"
              onClick={() => handleSearchSelect(result.place_id, result.description)}
            >
              <p className="text-sm font-medium">{result.structured_formatting.main_text}</p>
              <p className="text-xs text-gray-500 truncate">{result.structured_formatting.secondary_text}</p>
            </button>
          ))}
        </div>
      )}

      {hasSearched && !isActive && (
        <button
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full text-xs text-gray-500 shadow-md"
          onClick={() => setIsActive(true)}
        >
          Change destination
        </button>
      )}
    </div>
  );
};

export default SearchBar;
