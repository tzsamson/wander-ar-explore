
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      getCenter(): LatLng;
      getZoom(): number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      toJSON(): LatLngLiteral;
      toString(): string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapId?: string;
      styles?: MapTypeStyle[];
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers: MapTypeStyler[];
    }

    interface MapTypeStyler {
      [k: string]: any;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      icon?: string | Icon | Symbol;
      animation?: any;
    }

    interface Icon {
      url?: string;
      size?: Size;
      origin?: Point;
      anchor?: Point;
      scaledSize?: Size;
    }

    interface Symbol {
      path: string | number;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    class Circle {
      constructor(opts?: CircleOptions);
    }

    interface CircleOptions {
      map?: Map;
      center?: LatLng | LatLngLiteral;
      radius?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      strokeColor?: string;
    }

    class DirectionsService {
      constructor();
      route(request: DirectionsRequest, callback: (result: DirectionsResult, status: DirectionsStatus) => void): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setDirections(directions: DirectionsResult): void;
      setMap(map: Map | null): void;
    }

    interface DirectionsRendererOptions {
      map?: Map;
      suppressMarkers?: boolean;
      polylineOptions?: PolylineOptions;
    }

    interface PolylineOptions {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
    }

    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: LatLng | LatLngLiteral | string;
      travelMode: TravelMode;
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum DirectionsStatus {
      OK = 'OK',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      NOT_FOUND = 'NOT_FOUND'
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
      overview_path: LatLng[];
      overview_polyline: string;
      warnings: string[];
      bounds: LatLngBounds;
    }

    interface DirectionsLeg {
      steps: DirectionsStep[];
      distance: Distance;
      duration: Duration;
      start_location: LatLng;
      end_location: LatLng;
    }

    interface DirectionsStep {
      distance: Distance;
      duration: Duration;
      start_location: LatLng;
      end_location: LatLng;
      instructions: string;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      isEmpty(): boolean;
      toJSON(): { east: number; north: number; south: number; west: number };
      toString(): string;
    }

    namespace places {
      class AutocompleteService {
        constructor();
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[], status: PlacesServiceStatus) => void
        ): void;
      }

      class PlacesService {
        constructor(attributionAndMap: Element);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (result: PlaceResult, status: PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }

      interface AutocompletionRequest {
        input: string;
        types?: string[];
        bounds?: LatLngBounds;
        componentRestrictions?: ComponentRestrictions;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
      }

      interface ComponentRestrictions {
        country: string | string[];
      }

      interface PlaceResult {
        name?: string;
        formatted_address?: string;
        geometry?: {
          location: LatLng;
          viewport?: LatLngBounds;
        };
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        NOT_FOUND = 'NOT_FOUND'
      }
    }

    namespace drawing {
      class DrawingManager {
        constructor(options?: DrawingManagerOptions);
        setMap(map: Map | null): void;
      }

      interface DrawingManagerOptions {
        map?: Map;
        drawingMode?: OverlayType;
        drawingControl?: boolean;
        drawingControlOptions?: DrawingControlOptions;
      }

      enum OverlayType {
        MARKER = 'marker',
        POLYGON = 'polygon',
        POLYLINE = 'polyline',
        RECTANGLE = 'rectangle',
        CIRCLE = 'circle'
      }

      interface DrawingControlOptions {
        position?: number;
        drawingModes?: OverlayType[];
      }
    }

    namespace SymbolPath {
      const BACKWARD_CLOSED_ARROW: number;
      const CIRCLE: number;
    }

    const event: {
      addListener(
        instance: any,
        eventName: string,
        handler: (...args: any[]) => void
      ): MapsEventListener;
    };

    interface MapsEventListener {
      remove(): void;
    }

    const MapTypeId: {
      ROADMAP: string;
      SATELLITE: string;
      HYBRID: string;
      TERRAIN: string;
    };
  }
}
