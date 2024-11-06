import { useState, useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Sun } from 'lucide-react';
import { defineConfig, loadEnv } from 'vite';

const BACKEND_URL =  import.meta.env.VITE_BACKEND_URL;
const GOOGLE_MAPS_API_KEY =  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '70%',
  height: '300px'
};

const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832
};

const styles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .animate-spin-slow {
    animation: spin 60s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SunIndicator = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return '#FFD700';
    if (score >= 60) return '#FFA500';
    if (score >= 40) return '#FF8C00';
    if (score >= 20) return '#FF4500';
    return '#CD5C5C';
  };

  if (score <= 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-red-50 rounded-lg shadow-md">
        <div className="text-red-600 text-lg font-semibold">
          Invalid Date Range
        </div>
        <div className="text-gray-600 text-sm text-center">
          Please select dates that are:
          <ul className="list-disc list-inside mt-2">
            <li>Within the past 5 years</li>
            <li>At least a few days apart</li>
          </ul>
        </div>
      </div>
    );
  }

  const size = Math.max(30, (score / 100) * 60);

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg shadow-md">
      <div 
        className="transition-all duration-500 ease-in-out"
        style={{
          animation: 'pulse 2s infinite',
          filter: `drop-shadow(0 0 ${score/10}px ${getColor()})`
        }}
      >
        <Sun 
          size={size} 
          color={getColor()} 
          className="animate-spin-slow"
        />
      </div>
      <div className="text-2xl font-bold" style={{ color: getColor() }}>
        {score}%
      </div>
      <div className="text-gray-600 text-sm">
        {score >= 80 && "Excellent Light"}
        {score >= 60 && score < 80 && "Good Light"}
        {score >= 40 && score < 60 && "Moderate Light"}
        {score >= 20 && score < 40 && "Low Light"}
        {score < 20 && "Poor Light"}
      </div>
    </div>
  );
};

export const LightForm = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [position, setPosition] = useState(defaultCenter);
  const [zoom, setZoom] = useState(13);
  const [lightScore, setLightScore] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const updateMap = useCallback(async () => {
    let searchString = '';
    let newZoom = 4;

    if (country) searchString = country;
    if (city) {
      searchString = `${city}, ${country}`;
      newZoom = 10;
    }
    if (streetName) {
      searchString = `${streetName}, ${city}, ${country}`;
      newZoom = 14;
    }
    if (streetNumber) {
      searchString = `${streetNumber} ${streetName}, ${city}, ${country}`;
      newZoom = 16;
    }

    if (searchString && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const result = await geocoder.geocode({ address: searchString });
        if (result.results[0]) {
          const { lat, lng } = result.results[0].geometry.location;
          setPosition({ lat: lat(), lng: lng() });
          setZoom(newZoom);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  }, [country, city, streetName, streetNumber]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateMap();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [updateMap]);

  const handleClick = async () => {
    const url = new URL(`${BACKEND_URL}/light_score/`);
    url.searchParams.append('country', country);
    url.searchParams.append('city', city);
    url.searchParams.append('postal_code', postalCode);
    url.searchParams.append('street_name', streetName);
    url.searchParams.append('street_number', streetNumber);
    if (floor) url.searchParams.append('floor', floor);
    if (startDate) url.searchParams.append('start_date', startDate);
    if (endDate) url.searchParams.append('end_date', endDate);

    try {
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`Response status: ${response.status}`);

      const data = await response.json();
      if (Number(data.light_score) <= 0) {
        setLightScore(0);
      } else {
        setLightScore(data.light_score);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="container">
      <style>{styles}</style>
      <h2 className="text-center mb-4">Light Score Calculator</h2>
      
      <div className="form-container mb-4">
        <input 
          className="form-control" 
          placeholder="Country" 
          value={country} 
          onChange={(e) => setCountry(e.target.value)} 
        />
        <input 
          className="form-control" 
          placeholder="City" 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          disabled={!country}
        />
        <input 
          className="form-control" 
          placeholder="Street Name" 
          value={streetName} 
          onChange={(e) => setStreetName(e.target.value)}
          disabled={!city}
        />
        <input 
          className="form-control" 
          placeholder="Street Number" 
          value={streetNumber} 
          onChange={(e) => setStreetNumber(e.target.value)}
          disabled={!streetName}
        />
        <input 
          className="form-control" 
          placeholder="Postal Code" 
          value={postalCode} 
          onChange={(e) => setPostalCode(e.target.value)} 
        />
        <input 
          className="form-control" 
          placeholder="Floor (optional)" 
          value={floor} 
          onChange={(e) => setFloor(e.target.value)} 
        />
        <input 
          className="form-control" 
          type="date" 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <input 
          className="form-control" 
          type="date" 
          onChange={(e) => setEndDate(e.target.value)} 
        />
        <button className="btn btn-primary" onClick={handleClick}>Get Light Score</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position}
          zoom={zoom}
        >
          <Marker position={position} />
        </GoogleMap>

        {lightScore !== null && (
          <div className="flex flex-col justify-center">
            <SunIndicator score={lightScore} />
            <div className="mt-4 text-sm text-gray-600">
              <p>Location: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
