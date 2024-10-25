// Importing useState from React to manage component state
import { useState } from "react";

// Define the backend URL where the light score API is hosted
const BACKEND_URL = 'http://localhost:8000';
// Styling for the progress bar
// Enhanced styling for the progress bar
const styles = {
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0', // Lighter background color
    borderRadius: '20px',
    overflow: 'hidden',
    marginTop: '10px',
    height: '30px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow for a 3D effect
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(to right, #4caf50, #81c784)', // Gradient for the bar
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    lineHeight: '30px',  // Centers the text vertically
    transition: 'width 0.5s ease',  // Smooth width transition
    borderRadius: '20px 0 0 20px',  // Rounded corners on the left
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)', // Inner shadow for depth
  }
};

export const LightForm = () => {
  // Define state variables to hold the form inputs (country, city, postalCode, streetNumber, floor)
  // useState('') initializes each variable with an empty string
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [lat, setLat] = useState(null);  // State for latitude
  const [lng, setLng] = useState(null);  // State for longitude
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  // Define a state variable to store the fetched light score result
  const [lightScore, setLightScore] = useState(null);

  // Event handler for the 'Country' input field, updates the country state
  const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    setCountry(event.target.value);

  // Event handler for the 'City' input field, updates the city state
  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    setCity(event.target.value);

  // Event handler for the 'Postal Code' input field, updates the postalCode state
  const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    setPostalCode(event.target.value);

  // Event handler for the 'Street Number' input field, updates the streetNumber state
  const handleStreetNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    setStreetNumber(event.target.value);

  // Event handler for the 'Floor' input field, updates the floor state
  const handleFloorChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    setFloor(event.target.value);

  // Function to handle the 'Get Light Score' button click
  // It constructs the API URL with query parameters and makes a GET request
  const handleClick = async () => {
    // Create a URL object for the backend API, with the `/light_score/` endpoint
    const url = new URL(`${BACKEND_URL}/light_score/`);

    // Append form data as query parameters to the URL
    url.searchParams.append('country', country);
    url.searchParams.append('city', city);
    url.searchParams.append('postal_code', postalCode);
    url.searchParams.append('street_number', streetNumber);
    // Append floor only if it's provided (since it's optional)
    if (floor) url.searchParams.append('floor', floor);
      // Append startDate and endDate if they are provided
    if (startDate) url.searchParams.append('start_date', startDate);
    if (endDate) url.searchParams.append('end_date', endDate);


    try {
      // Send a GET request to the backend API
      const response = await fetch(url, {
        credentials: 'include' // This includes cookies with the request if necessary (adjust if needed)
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      // Parse the response as JSON and log the data
      const data = await response.json();
      console.log('Response:', data);

      // Update the lightScore state with the fetched light score from the response
      setLightScore(data.light_score);
      setLat(data.lat);   // Update latitude
      setLng(data.lng);   // Update longitude
      
    } catch (error) {
      // Handle any errors that occur during the fetch process
      console.error('Error fetching the light score:', error);
    }
  };

  // JSX to render the form and light score result (if available)
  return (
    <div>
      <h2>Light Score Form</h2>

      {/* Input fields for collecting user input, each field is connected to its state */}
      <input placeholder="Country" value={country} onChange={handleCountryChange} />
      <input placeholder="City" value={city} onChange={handleCityChange} />
      <input placeholder="Postal Code" value={postalCode} onChange={handlePostalCodeChange} />
      <input placeholder="Street Number" value={streetNumber} onChange={handleStreetNumberChange} />
      <input placeholder="Floor (optional)" value={floor} onChange={handleFloorChange} />
      <input type="date" placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />

      {/* Button to trigger the handleClick function to fetch the light score */}
      <button onClick={handleClick}>Get Light Score</button>

        {/* Display light score and progress bar if data is available */}
      {lightScore !== null && (
        <div>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBar, width: `${lightScore}%` }}>
              {lightScore}%
            </div>
          </div>
          <p>Latitude: {lat}</p>
          <p>Longitude: {lng}</p>
        </div>
      )}
      
    </div>
  );
};
