import React, { useState, useEffect } from "react";
import { Sun, MapPin, Calendar, Building2, Mail, Compass } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CoordinateVisualizer = ({ position }) => {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        {/* Grid lines */}
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {Array(64).fill(null).map((_, i) => (
            <div key={i} className="border border-blue-200/30" />
          ))}
        </div>
        
        {/* Coordinate marker */}
        <div 
          className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${((position.lng + 180) / 360) * 100}%`,
            top: `${((90 - position.lat) / 180) * 100}%`
          }}
        >
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/50 rounded-full animate-ping" />
        </div>

        {/* Coordinate labels */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-sm text-gray-600">
          <span>-180°</span>
          <span>0°</span>
          <span>180°</span>
        </div>
        <div className="absolute top-4 bottom-4 left-4 flex flex-col justify-between text-sm text-gray-600">
          <span>90°N</span>
          <span>0°</span>
          <span>90°S</span>
        </div>
      </div>
    </div>
  );
};


const SunIndicator = ({ scoreData }) => {
  const score = scoreData?.light_score || 0;
  
  const getColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#84cc16';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score >= 80) return { text: "Excellent Light", bg: "bg-green-100" };
    if (score >= 60) return { text: "Good Light", bg: "bg-lime-100" };
    if (score >= 40) return { text: "Moderate Light", bg: "bg-yellow-100" };
    if (score >= 20) return { text: "Low Light", bg: "bg-orange-100" };
    return { text: "Poor Light", bg: "bg-red-100" };
  };

  if (score <= 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500 text-xl font-semibold">
            Invalid Data
          </div>
          <div className="text-gray-600 text-sm text-center">
            Unable to calculate light score. Please check your inputs.
          </div>
        </div>
      </div>
    );
  }

  const { text, bg } = getLabel();
  const size = Math.max(40, (score / 100) * 80);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-30"
            style={{ backgroundColor: getColor() }}
          />
          <Sun size={size} color={getColor()} className="animate-spin-slow relative z-10" />
        </div>
        <div className="text-4xl font-bold tracking-tight" style={{ color: getColor() }}>
          {score}%
        </div>
        <div className={`${bg} px-4 py-2 rounded-full text-sm font-medium`}>
          {text}
        </div>
        {scoreData?.details && (
          <div className="w-full text-sm text-gray-600">
            <div className="space-y-2">
              <div>Base Score: {scoreData.details.base_score}%</div>
              <div>Floor Bonus: +{scoreData.details.floor_bonus}%</div>
              <div>Direction: {scoreData.details.direction}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const LightForm = () => {
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    postalCode: '',
    streetName: '',
    streetNumber: '',
    floor: '',
    startDate: '',
    endDate: '',
    direction: ''
  });
  const [position, setPosition] = useState({ lat: 43.6532, lng: -79.3832 });
  const [scoreData, setScoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const directions = [
    { value: 'N', label: 'North' },
    { value: 'S', label: 'South' },
    { value: 'E', label: 'East' },
    { value: 'W', label: 'West' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  useEffect(() => {
    const { country, city, streetName, streetNumber } = formData;
    if (country || city || streetName || streetNumber) {
      setPosition(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.1,
        lng: prev.lng + (Math.random() - 0.5) * 0.1
      }));
    }
  }, [formData.country, formData.city, formData.streetName, formData.streetNumber]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    // Validate required fields
    if (!formData.country || !formData.city || !formData.streetName || !formData.streetNumber) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    const url = new URL(`${BACKEND_URL}/light_score/`);
    Object.entries(formData).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setScoreData(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to calculate light score. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Light Score Calculator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin size={16} />
                Location Details
              </div>
              <input
                name="country"
                placeholder="Country *"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="city"
                placeholder="City *"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!formData.country}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Address Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 size={16} />
                Address Details
              </div>
              <input
                name="streetName"
                placeholder="Street Name *"
                value={formData.streetName}
                onChange={handleInputChange}
                disabled={!formData.city}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <input
                name="streetNumber"
                placeholder="Street Number *"
                value={formData.streetNumber}
                onChange={handleInputChange}
                disabled={!formData.streetName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={16} />
                Additional Info
              </div>
              <input
                name="postalCode"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="floor"
                  placeholder="Floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Direction</option>
                  {directions.map(dir => (
                    <option key={dir.value} value={dir.value}>
                      {dir.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar size={16} />
                Date Range
              </div>
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="w-full max-w-xs px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Calculating..." : "Get Light Score"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <CoordinateVisualizer position={position} />
        </div>

        {scoreData && (
          <div className="space-y-4">
            <SunIndicator scoreData={scoreData} />
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Location: {position.lat.toFixed(4)}°N, {position.lng.toFixed(4)}°E</span>
                </div>
                {formData.floor && (
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>Floor: {formData.floor}</span>
                  </div>
                )}
                {formData.direction && (
                  <div className="flex items-center gap-2">
                    <Compass size={16} />
                    <span>Direction: {directions.find(d => d.value === formData.direction)?.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};