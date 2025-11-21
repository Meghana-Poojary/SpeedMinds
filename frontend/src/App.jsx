// Root.jsx
import React, { useState } from 'react';
import HomePage from './components/HomePage.jsx';
import Logic from './components/Logic.jsx';

function App() {
  // State to track if the 'Get Started' button has been clicked
  const [start, setStart] = useState(false);

  // Function to change the state and display the App
  const handleStart = () => {
    setStart(true);
  };

  return (
    <div className="root-container">
      {start ? ( <Logic /> ) : ( <HomePage handleStart={handleStart} /> )}
    </div>
  );
}

export default App;