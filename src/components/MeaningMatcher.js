//src/components/MeaningMatcher.js
import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { useAuth } from './AuthContext'; 

const RECORDING_DURATION = 3000;
const MeaningMatcher = ({ selectedWeek }) => {
  const [gameState, setGameState] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [wordQueue, setWordQueue] = useState([]);
  const { token } = useAuth();
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('selectedWeekMM:', selectedWeek);
    initializeGame();
  }, [selectedWeek]);

  useEffect(() => {
    // Focus on the input field after the result is updated
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [result]);

  const initializeGame = async () => {
    try {
      const response = await axios.get('https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/initialize', {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
          'week' : `${selectedWeek}`
        },
      });
      setGameState(response.data);
      setResult(null);
      setInput('');
      setConsecutiveCorrect(0);
      setWordQueue([]);
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  };

  const updateWordQueue = (newWord) => {
    setWordQueue((prevQueue) => {
      const updatedQueue = [...prevQueue, newWord];
      if (updatedQueue.length > 5) {
        updatedQueue.shift(); // Remove the oldest word if the queue exceeds 5
      }
      return updatedQueue;
    });
  };

  const checkMeaning = async () => {
    try {
      updateWordQueue(gameState.word);
      console.log(gameState)
      const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/check_meaning', { input_text: input, week: selectedWeek, word: gameState.word, meaning: gameState.meaning, consecutive_correct: consecutiveCorrect, score: gameState.score, queue: wordQueue }, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
      });
      setResult(response.data);

      if (response.data.result === 'correct') {
        let newScore = gameState.score + 10;
        let newConsecutiveCorrect = consecutiveCorrect + 1;

        if (newConsecutiveCorrect % 3 === 0) {
          newScore += 5;
        }

        setGameState(prevState => ({ ...prevState, score: newScore }));
        setConsecutiveCorrect(newConsecutiveCorrect);
      } else {
        setGameState(prevState => ({ ...prevState, score: gameState.score - 5 }));
        setConsecutiveCorrect(0);
      }
    } catch (error) {
      console.error("Error checking meaning:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !result) {
      checkMeaning();
    }
  };

  const getNewWord = async () => {
    try {
      const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/new_word',{week: selectedWeek, score: gameState.score}, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
      });
      setGameState(response.data);
      setResult(null);
      setInput('');
      inputRef.current.focus();
    } catch (error) {
      console.error("Error getting new word:", error);
    }
  };

  // const recordAndTranscribe = async () => {
  //   try {
  //     const audioBlob = await recordAudio();
      
  //     // Add size check
  //     const fileSizeInMB = audioBlob.size / (1024 * 1024);
  //     if (fileSizeInMB > 10) { // Adjust size limit as needed
  //       throw new Error(`Audio file too large: ${fileSizeInMB.toFixed(2)}MB`);
  //     }

  //     const formData = new FormData();
  //     formData.append('file', audioBlob, 'audio.webm'); // Add explicit filename

  //     // Log request details
  //     console.log('Sending audio file:', {
  //       size: `${fileSizeInMB.toFixed(2)}MB`,
  //       type: audioBlob.type
  //     });

  //     const response = await axios.post(
  //       'https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/whisper',
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'multipart/form-data',
  //         },
  //         // Add timeout and retry config
  //         timeout: 30000, // 30 second timeout
  //         retry: 3,
  //         retryDelay: 1000,
  //         // Add progress monitoring
  //         onUploadProgress: (progressEvent) => {
  //           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //           console.log(`Upload Progress: ${percentCompleted}%`);
  //         }
  //       }
  //     );

  //     if (!response.data || !response.data.transcription) {
  //       console.log(response);
  //       throw new Error('Invalid response format from transcription service');
  //     }

  //     setInput(response.data.transcription);
  //     inputRef.current.focus();
  //   } catch (error) {
  //     console.error('Error details:', {
  //       message: error.message,
  //       code: error.code,
  //       response: error.response?.data,
  //       status: error.response?.status
  //     });

  //     // User-friendly error messages
  //     let errorMessage = 'Failed to transcribe audio. ';
  //     if (error.code === 'ERR_NETWORK') {
  //       errorMessage += 'Please check your internet connection and try again.';
  //     } else if (error.response?.status === 413) {
  //       errorMessage += 'Audio file is too large.';
  //     } else if (error.response?.status === 401) {
  //       errorMessage += 'Authentication failed. Please try logging in again.';
  //     }

  //     alert(errorMessage);
  //   }
  // };

  // const recordAudio = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ 
  //       audio: true,
  //       // Add specific audio constraints
  //       audioConstraints: {
  //         sampleRate: 16000,
  //         channelCount: 1,
  //         echoCancellation: true,
  //         noiseSuppression: true
  //       }
  //     }
  //   );

  //     const mediaRecorder = new MediaRecorder(stream, {
  //       mimeType: 'audio/webm;codecs=opus'
  //     });
      
  //     const audioChunks = [];

  //     return new Promise((resolve, reject) => {
  //       mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
        
  //       mediaRecorder.onerror = (event) => {
  //         reject(new Error(`MediaRecorder error: ${event.error.name}`));
  //       };

  //       mediaRecorder.onstop = () => {
  //         const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  //         // Stop all tracks to release the microphone
  //         stream.getTracks().forEach(track => track.stop());
  //         resolve(audioBlob);
  //       };

  //       mediaRecorder.start();
  //       setTimeout(() => mediaRecorder.stop(), RECORDING_DURATION);
  //     });
  //   } catch (err) {
  //     console.error('Audio recording error:', err);
  //     if (err.name === 'NotAllowedError') {
  //       alert('Microphone access was denied. Please allow microphone access to use this feature.');
  //     } else if (err.name === 'NotFoundError') {
  //       alert('No microphone found. Please ensure you have a working microphone connected.');
  //     } else {
  //       alert('Failed to record audio: ' + err.message);
  //     }
  //     throw err;
  //   }
  // };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div class="chat-container">
      <h1>Meaning Matcher</h1><hr/>
      <p className='score'><b>Score:</b> {gameState.score}</p><hr/>
      <p>Enter the meaning of the word <strong>{gameState.word}</strong> in German:</p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={result !== null}
        ref={inputRef}
      />
      <br/>
      {/* <button onClick={recordAndTranscribe} className="btn btn-small btn-primary mt-3">
        Speak Meaning
      </button> */}
      {result && (
        <div>
          <br/>
          <p class={result.result === 'correct' ? "alert alert-success" : "alert alert-danger"}>{result.result === 'correct' ? ' Correct! 10 points will be added.' : 'Incorrect! 5 points will be deducted.'}</p>
          {result.result !== 'correct' && (
            <p class="alert alert-info">The correct meaning is "{result.correct_meaning}".</p>
          )}
          {consecutiveCorrect % 3 === 0 && consecutiveCorrect !== 0 && (
            <div>
              <p class="alert alert-success">Bonus! 5 points for 3 consecutive correct answers!</p>
              <Confetti />
            </div>
          )}
          <button onClick={getNewWord} class="btn btn-small btn-secondary">New Word</button>
        </div>
      )}
    </div>
  );
};

export default MeaningMatcher;
