import { useState } from "react";

export const LightForm = () => {
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [floor, setFloor] = useState('');

    // Event handlers for each input
    const handleCountryChange = (event) => setCountry(event.target.value);
    const handleCityChange = (event) => setCity(event.target.value);
    const handlePostalCodeChange = (event) => setPostalCode(event.target.value);
    const handleStreetNumberChange = (event) => setStreetNumber(event.target.value);
    const handleFloorChange = (event) => setFloor(event.target.value);

    // Function to handle click event
    const handleClick = async () => {
        const url = new URL('https://light-score-production.up.railway.app/light_score/');
        url.searchParams.append('country', country);
        url.searchParams.append('city', city);
        url.searchParams.append('postal_code', postalCode);
        url.searchParams.append('street_number', streetNumber);
        if (floor) url.searchParams.append('floor', floor);

        try {
            const response = await fetch(url.toString());
            const data = await response.json();
            console.log('Response:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            Hello This is my form
            <input placeholder="Country" value={country} onChange={handleCountryChange} />
            <input placeholder="City" value={city} onChange={handleCityChange} />
            <input placeholder="Postal Code" value={postalCode} onChange={handlePostalCodeChange} />
            <input placeholder="Street Number" value={streetNumber} onChange={handleStreetNumberChange} />
            <input placeholder="Floor (optional)" value={floor} onChange={handleFloorChange} />
            <button onClick={handleClick}>Get Light Score</button>
        </div>
    );
};
