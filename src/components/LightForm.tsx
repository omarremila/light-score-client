import { useState } from "react";

const BACKEND_URL = 'https://light-score-production.up.railway.app/';

import { useState } from "react";

const BACKEND_URL = 'https://light-score-production.up.railway.app/';

export const LightForm = () => {
  /*Memory Boxes! Each useState('') creates a piece of state with an
   initial value of an empty string. country, city, postalCode, streetNumber, and floor are 
   the pieces of data we're tracking.*/
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [floor, setFloor] = useState('');

  // Event handlers for each input with explicit event type
  const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => setCountry(event.target.value);
  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => setCity(event.target.value);
  const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => setPostalCode(event.target.value);
  const handleStreetNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => setStreetNumber(event.target.value);
  const handleFloorChange = (event: React.ChangeEvent<HTMLInputElement>) => setFloor(event.target.value);

  const handleClick = async () => {
    const url = new URL('https://light-score-production.up.railway.app/light_score/');
    url.searchParams.append('country', country);
    url.searchParams.append('city', city);
    url.searchParams.append('postal_code', postalCode);
    url.searchParams.append('street_number', streetNumber);
    if (floor) url.searchParams.append('floor', floor);

    try {
      const response = await fetch(url, {
        credentials: 'include' // or 'same-origin', 'omit'
    });
        debugger;
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Response:', data);
        // If you have a state to store the light score:
        setLightScore(data.light_score); // Assuming you have a useState to hold this value
    } catch (error) {
        console.error('Error fetching the light score:', error);
    }
};


const [lightScore, setLightScore] = useState(null);

return (
    <div>
        Hello, This is my form
        <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        <input placeholder="Street Number" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} />
        <input placeholder="Floor (optional)" value={floor} onChange={(e) => setFloor(e.target.value)} />
        <button onClick={handleClick}>Get Light Score</button>
        {lightScore !== null && <p>Light Score: {lightScore}</p>}
    </div>
);

};
