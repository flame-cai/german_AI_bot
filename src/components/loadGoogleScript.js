// src/loadGoogleScript.js
export const loadGoogleScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector('script#google-login')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-login';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};
