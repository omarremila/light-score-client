import { useState } from "react";

const BACKEND_URL = 'https://light-score-production.up.railway.app/';

export const LightForm = () => {
  // State for form inputs
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [floor, setFloor] = useState('');

  // State for light score result
  const [lightScore, setLightScore] = useState(null);

  // Event handlers for input fields
  const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => setCountry(event.target.value);
  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => setCity(event.target.value);
  const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => setPostalCode(event.target.value);
  const handleStreetNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => setStreetNumber(event.target.value);
  const handleFloorChange = (event: React.ChangeEvent<HTMLInputElement>) => setFloor(event.target.value);

  // Handle the click event to fetch the light score
  const handleClick = async () => {
    const url = new URL(`${BACKEND_URL}/light_score/`);
    url.searchParams.append('country', country);
    url.searchParams.append('city', city);
    url.searchParams.append('postal_code', postalCode);
    url.searchParams.append('street_number', streetNumber);
    if (floor) url.searchParams.append('floor', floor);

    try {
      const response = await fetch(url, {
        credentials: 'include' // You can adjust this based on your backend settings
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      setLightScore(data.light_score);
    } catch (error) {
      console.error('Error fetching the light score:', error);
    }
  };

  return (
    <div>
      <h2>Light Score Form</h2>
      <input placeholder="Country" value={country} onChange={handleCountryChange} />
      <input placeholder="City" value={city} onChange={handleCityChange} />
      <input placeholder="Postal Code" value={postalCode} onChange={handlePostalCodeChange} />
      <input placeholder="Street Number" value={streetNumber} onChange={handleStreetNumberChange} />
      <input placeholder="Floor (optional)" value={floor} onChange={handleFloorChange} />
      <button onClick={handleClick}>Get Light Score</button>
      {lightScore !== null && <p>Light Score: {lightScore}</p>}
    </div>
  );
};
