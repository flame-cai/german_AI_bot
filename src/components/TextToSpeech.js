import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterances, setUtterances] = useState([]);
  const [voiceLoaded, setVoiceLoaded] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const splitText = (text) => {
      const maxChunkLength = 100; // Adjust this value based on how much text should be spoken at a time
      let chunks = [];
      let currentChunk = '';

      text.split(' ').forEach(word => {
        if ((currentChunk + word).length < maxChunkLength) {
          currentChunk += word + ' ';
        } else {
          chunks.push(currentChunk.trim());
          currentChunk = word + ' ';
        }
      });

      chunks.push(currentChunk.trim());
      return chunks;
    };

    const setVoiceAndCreateUtterances = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const selectedVoice = voices.find(voice => voice.name === 'Google Deutsch') || voices.find(voice => voice.name === 'Anna');
        if (selectedVoice) {
          const textChunks = splitText(text);
          const utterancesArray = textChunks.map(chunk => {
            const u = new SpeechSynthesisUtterance(chunk);
            u.voice = selectedVoice;
            u.rate = 0.85;
            u.lang = 'fr-FR';
            return u;
          });
          setUtterances(utterancesArray);
          setVoiceLoaded(true);
          console.log(voices);
        }
      } else {
        console.log('No voices available yet');
      }
    };

    // Set voice once voices are loaded
    setVoiceAndCreateUtterances();

    // Add event listener for voiceschanged event
    synth.onvoiceschanged = setVoiceAndCreateUtterances;

    // Fallback using setTimeout to handle cases where the event might not fire
    const fallbackTimeout = setTimeout(setVoiceAndCreateUtterances, 1000);

    return () => {
      synth.cancel();
      clearTimeout(fallbackTimeout);
    };
  }, [text]);

  const handleSpeechToggle = () => {
    const synth = window.speechSynthesis;

    if (!isSpeaking) {
      if (voiceLoaded && utterances.length > 0) {
        utterances.forEach(utterance => {
          synth.speak(utterance);
        });
        setIsSpeaking(true);
      } else {
        console.log('Voice not loaded yet');
      }
    } else {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {voiceLoaded && (
        <button className="icon-btn" onClick={handleSpeechToggle} disabled={!voiceLoaded}>
          <i className="fa-solid fa-volume-high"></i>
        </button>
      )}
    </>
  );
};

export default TextToSpeech;