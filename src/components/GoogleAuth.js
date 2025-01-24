// src/components/GoogleAuth.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { loadGoogleScript } from './loadGoogleScript';
import { useAuth } from './AuthContext';

const GoogleSignIn = ({ onLoginSuccess }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { setToken } = useAuth();

  useEffect(() => {
    const loadGoogleAndInitialize = async () => {
      await loadGoogleScript();
      setIsGoogleLoaded(true);
    };

    loadGoogleAndInitialize();
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      const handleCredentialResponse = async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);
        try {
          const backendResponse = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/login', {
            
          }, {
            headers: {
              'Authorization': `Bearer ${response.credential}`, // Include the token in the headers
            },
          });
          // console.log('Login success:', );
          localStorage.setItem('token', response.credential); // Save token to local storage
          setToken(response.credential)
          onLoginSuccess(backendResponse.data);
        } catch (error) {
          console.error('Login failed:', error);
        }
      };

      window.google.accounts.id.initialize({
        client_id: '1066118926351-dskshp8i64e3e4i5rr76h85rfbhh5cc0.apps.googleusercontent.com', // Replace with your actual client ID
        callback: handleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
    }
  }, [isGoogleLoaded, setToken, onLoginSuccess]);

  return <div id="googleSignInDiv"></div>;
};

export default GoogleSignIn;
