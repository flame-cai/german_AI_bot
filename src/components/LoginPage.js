// src/components/LoginPage.js
import React, { useState, useEffect } from 'react';
import GoogleSignIn from './GoogleAuth';
import '../App.css'; // Import CSS for styling

const LoginPage = ({ onLoginSuccess }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasReloaded, setHasReloaded] = useState(false); // Track if page has been reloaded

  useEffect(() => {
    if (window.performance.navigation.type === 1) {
      setHasReloaded(true);
    }
  }, []);

  useEffect(() => {
    // Check if Google API is loaded
    const checkGoogleApiLoaded = () => {
      if (window.gapi && window.gapi.accounts.id) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleApiLoaded, 100); // Check again after 100ms
      }
    };

    checkGoogleApiLoaded();

    // Reload the page only if it hasn't been reloaded before
    if (!hasReloaded) {
      const timer = setTimeout(() => {
        if (!isLoaded) {
          window.location.reload();
        }
      }, 1000); // Adjust delay as needed

      return () => clearTimeout(timer);
    }
  }, [isLoaded, hasReloaded]);
  return (
    <div className="login-container">
      <div className="image-container">
     
        <img src=" ./flame_img.jpeg" alt="Logo 1" className="logo-image" />
        {/* <div className="vertical-line"></div>
        <img src="./CAI_logo.jpg" alt="Logo 2" className="logo-image" /> */}
      </div>
      <h1>Welcome to the AI German Practice Application</h1>
      {/* <h4><i>Built by CAI</i></h4> */}
      <p>Please log in to continue</p>
      <div className="google-signin-button">
      <div style={{ display: 'inline-block' }}>
        <GoogleSignIn onLoginSuccess={onLoginSuccess} />
      </div>
      </div>
    </div>
  );
};

export default LoginPage;