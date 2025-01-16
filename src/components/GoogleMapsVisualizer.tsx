import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface CoordinateVisualizerProps {
  position: {
    lat: number;
    lng: number;
  };
  address?: {
    streetNumber: string;
    streetName: string;
  };
  onLocationSelect?: (position: { lat: number; lng: number }) => void;
}

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const GoogleMapsVisualizer: React.FC<CoordinateVisualizerProps> = ({
  position,
  address,
  onLocationSelect
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const defaultCenter = {
    lat: 43.6532,
    lng: -79.3832 // Toronto coordinates
  };

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && address?.streetNumber && address?.streetName) {
      const geocoder = new window.google.maps.Geocoder();
      const fullAddress = `${address.streetNumber} ${address.streetName}, Toronto, ON, Canada`;
      
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newPosition = {
            lat: location.lat(),
            lng: location.lng()
          };
          
          if (onLocationSelect) {
            onLocationSelect(newPosition);
          }

          map.panTo(newPosition);
          map.setZoom(17);
        }
      });
    }
  }, [address, map, onLocationSelect]);

  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={position}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#7c93a3" }]
            },
            {
              featureType: "landscape",
              elementType: "geometry.fill",
              stylers: [{ color: "#e6e9ec" }]
            },
            {
              featureType: "water",
              elementType: "geometry.fill",
              stylers: [{ color: "#a3c7df" }]
            }
          ]
        }}
      >
        <Marker 
          position={position}
          animation={2} // Use numeric value instead of google.maps.Animation.DROP
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapsVisualizer;