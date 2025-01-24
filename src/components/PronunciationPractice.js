import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import TextToSpeech from './TextToSpeech';

const PronunciationPractice = ({ correction, isOpen, onClose, token }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset states when the popup is reopened
  useEffect(() => {
    if (!isOpen) return;
    setFeedback('');
    setShowSuccess(false);
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null);
    }
  }, [isOpen]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks);
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('correction', correction);
        formData.append('cancelled', '0');

        try {
          const response = await axios.post(
            'https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/whisper',
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const match = response.data.match;
          if (match === 1) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false); //tickmark
              onClose('success'); //remove tickmark
            }, 750); //time
          } else {
            setFeedback('Try again');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          setFeedback('Error processing audio. Please try again.');
        }
      });

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setFeedback('Error accessing microphone. Please check permissions.');
    }
  }, [correction, token, onClose]);

  const handleClose = async () => {
    const formData = new FormData();
    formData.append('correction', correction);
    formData.append('cancelled', '1');

    try {
      await axios.post(
        'https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/whisper',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } catch (error) {
      console.error('Error sending cancelled status:', error);
    }

    onClose('cancelled');
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  }, [mediaRecorder]);

  if (!isOpen) {
    return null; // Only render if isOpen is true
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          width: '300px',
          position: 'relative',
          textAlign: 'center',
        }}
      >
{/* Close Button */}
{!showSuccess && (
  <button
    onClick={handleClose}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#FF6B6B',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
  >
    <X size={18} />
  </button>
)}
        {/* Instruction Text */}
        <p
          style={{
            marginBottom: '10px',
            color: '#333',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Try pronouncing this:
        </p>
        {/* Correction Text */}
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#E0F7FA',
            borderRadius: '5px',
            color: '#00796B',
            fontSize: '16px',
          }}
        >
          <p>{correction}&nbsp;&nbsp;<TextToSpeech text={correction} /></p>
        </div>

        {/* Success Tick */}
        {showSuccess && (
          <div style={{ color: '#4CAF50', marginBottom: '10px' }}>
            <CheckCircle size={32} />
          </div>
        )}

        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            // backgroundColor: isRecording ? '#FF6B6B' : '#4CAF50',
            backgroundColor: isRecording ? '#FDB414' : '#08466F',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            margin: 'auto',
          }}
        >
          {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {/* Feedback */}
        {feedback && (
          <p
            style={{
              marginTop: '20px',
              fontWeight: '500',
              color: feedback === 'Try again' ? '#FF6B6B' : '#4CAF50',
            }}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};

export default PronunciationPractice;