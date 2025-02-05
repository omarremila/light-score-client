import React, { useState } from "react";
import { Sun, MapPin, Building2, Compass } from "lucide-react";
import torontoBackground from "../assets/toronto_background.mp4";

const BACKEND_URL = "https://light-score-production.up.railway.app/";

// Updated interface to include extra data
interface ScoreData {
  light_score: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  details?: {
    floor: number;
    direction: string;
    sun_position?: {
      elevation: number;
      azimuth: number;
    };
    building_data?: any[];
  };
}

interface FormData {
  streetName: string;
  streetNumber: string;
  postalCode: string;
  floor: number;
  direction: string;
}

interface Position {
  lat: number;
  lng: number;
}

interface CoordinateVisualizerProps {
  position: Position;
  address?: {
    streetNumber: string;
    streetName: string;
  };
  onLocationSelect?: (position: Position) => void;
}

const CoordinateVisualizer: React.FC<CoordinateVisualizerProps> = ({
  position,
  address,
  onLocationSelect,
}) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg overflow-hidden shadow-lg">
      <div className="absolute inset-0">
        <div className="grid grid-cols-8 grid-rows-8 h-full">
          {Array(64)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="border border-blue-200/30" />
            ))}
        </div>

        <div
          className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${((position.lng + 180) / 360) * 100}%`,
            top: `${((90 - position.lat) / 180) * 100}%`,
          }}
        >
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/50 rounded-full animate-ping" />
        </div>

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

const SunIndicator: React.FC<{ scoreData: ScoreData }> = ({ scoreData }) => {
  const score = scoreData?.light_score || 0;

  const getColor = () => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#84cc16";
    if (score >= 40) return "#eab308";
    if (score >= 20) return "#f97316";
    return "#ef4444";
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
          <div className="text-red-500 text-xl font-semibold">Invalid Data</div>
          <div className="text-gray-600 text-sm text-center">
            Unable to calculate light score.
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
          <Sun
            size={size}
            color={getColor()}
            className="animate-spin-slow relative z-10"
          />
        </div>
        <div className="text-4xl font-bold tracking-tight" style={{ color: getColor() }}>
          {score}%
        </div>
        <div className={`${bg} px-4 py-2 rounded-full text-sm font-medium`}>{text}</div>
        {scoreData?.details && (
          <div className="w-full text-sm text-gray-600 mt-4">
            <div className="space-y-2">
              <div>Floor: {scoreData.details.floor}</div>
              <div>Direction: {scoreData.details.direction}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const LightForm: React.FC = () => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Constants
  const directions = [
    { value: "N", label: "North" },
    { value: "S", label: "South" },
    { value: "E", label: "East" },
    { value: "W", label: "West" },
  ];

  // Event handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "floor" ? Number(value) || 0 : value,
    }));
    setError("");
  };

  const [formData, setFormData] = useState<FormData>({
    streetName: "",
    streetNumber: "",
    postalCode: "",
    floor: 0,
    direction: "",
  });

  // Using a default position (could be used as a fallback if backend coordinates aren’t returned)
  const [position] = useState<Position>({
    lat: 43.6532,
    lng: -79.3832,
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setScoreData(null);

    if (!formData.streetName || !formData.streetNumber || !formData.postalCode) {
      setError("Please fill in street name, number, and postal code");
      setIsLoading(false);
      return;
    }

    const url = new URL("light_score", BACKEND_URL);

    // Add the address components
    url.searchParams.append("city", "Toronto");
    url.searchParams.append("country", "Canada");
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "floor") {
        url.searchParams.append(key, String(value || 1));
      } else if (value) {
        url.searchParams.append(key, value);
      }
    });

    try {
      console.log("Request URL:", url.toString());
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response body:", errorText);

        // Parse the error response
        try {
          const errorData = JSON.parse(errorText);
          if (response.status === 422 && errorData.detail) {
            setError("Invalid address. Please check all fields are filled correctly.");
          } else if (response.status === 404) {
            setError("Address not found. Please check the address and try again.");
          } else {
            setError("Failed to calculate light score. Please try again.");
          }
        } catch {
          setError("Failed to calculate light score. Please try again.");
        }
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);
      setScoreData(data);
    } catch (error) {
      console.error("Error details:", error);
      setError("Failed to calculate light score. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Use the returned coordinates if available; otherwise fallback to the default position.
  const displayCoordinates = scoreData?.coordinates || position;

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="video-background">
  <source src={torontoBackground} type="video/mp4" />
</video>
    

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center space-y-8">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-lg max-w-2xl">
          <h1 className="toronto-title text-5xl">
          The 6ix Ray-O-Meter
          </h1>
          
          <p className="header-description">
            Discover the natural light potential of any Toronto address. Our
            advanced calculator analyzes building position, elevation, and orientation.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 w-full max-w-3xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                <MapPin size={20} />
                Address Details
              </div>
              <input
                name="streetNumber"
                placeholder="Street Number *"
                value={formData.streetNumber}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                name="streetName"
                placeholder="Street Name *"
                value={formData.streetName}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                name="postalCode"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="input-field"
              />
         

         <input
  name="floor"
  placeholder="Floor Number"
  type="number"
  value={formData.floor === 0 ? "" : formData.floor}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      floor: e.target.value === "" ? 0 : Number(e.target.value),
    }))
  }
  className="input-field"
/>

              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Direction</option>
                {directions.map((dir) => (
                  <option key={dir.value} value={dir.value}>
                    {dir.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <div className="input-field">
              {error}
            </div>
          )}
          <div className="input-field">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full max-w-xs px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full hover:scale-105 transform transition duration-300 disabled:opacity-50"
            >
              {isLoading ? "Calculating..." : "Get Light Score"}
            </button>
          </div>
        </div>

        {/* Results */}
        {scoreData && (
          <div className="space-y-6 w-full max-w-3xl">
            <SunIndicator scoreData={scoreData} />

            {/* Coordinates / Location Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 border border-white/30">
              <div className="text-lg text-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>
                    Location: {displayCoordinates.lat.toFixed(4)}°N, {displayCoordinates.lng.toFixed(4)}°E
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={20} />
                  <span>Floor: {scoreData.details?.floor}</span>
                </div>
                {scoreData.details?.direction && (
                  <div className="flex items-center gap-2">
                    <Compass size={20} />
                    <span>
                      Direction:{" "}
                      {directions.find((d) => d.value === scoreData.details?.direction)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sun Position Card */}
            {scoreData.details?.sun_position && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-6 border border-white/30">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 mb-4">
                  Sun Position
                </h3>
                <div className="flex items-center justify-around">
                  <div className="flex flex-col items-center">
                    {/* Rotate the Compass icon based on the azimuth value */}
                    <Compass
                      size={48}
                      style={{ transform: `rotate(${scoreData.details.sun_position.azimuth}deg)` }}
                      className="text-yellow-600"
                    />
                    <p className="mt-2 text-sm text-gray-700">
                      Azimuth: {scoreData.details.sun_position.azimuth.toFixed(1)}°
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-orange-500">
                      {scoreData.details.sun_position.elevation.toFixed(1)}°
                    </span>
                    <p className="mt-2 text-sm text-gray-700">Elevation</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
