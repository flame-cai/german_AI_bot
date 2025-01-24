// src/components/Chat.js
import TextToSpeech from './TextToSpeech';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css';
import { useAuth } from './AuthContext'; 
import PronunciationPractice from './PronunciationPractice';
// import ErrorBoundary from './ErrorBoundary';

function mergePunctuations(arr) {
  const result = [];
  let tempWord = ['', ''];

  for (const [ge, en] of arr) {
    if ('.,!?'.includes(ge)) {
      tempWord[0] += ge;
      tempWord[1] += en;
    } else {
      if (tempWord[0]) {
        result.push(tempWord);
        tempWord = ['', ''];
      }
      tempWord = [ge, en];
    }
  }

  if (tempWord[0]) {
    result.push(tempWord);
  }

  return result;
}

const Chat = ({ selectedWeek }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messageEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState('U');
  const { token } = useAuth();
  const [lastSelectedWeek, setLastSelectedWeek] = useState(selectedWeek);
  const [practicePopupOpen, setPracticePopupOpen] = useState(false);
  const [currentCorrection, setCurrentCorrection] = useState('');
  const processedCorrectionsRef = useRef(new Set()); // Hold the correction text
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setMessages([{
        role: 'assistant',
        content: ["Hallo, ich bin Matteo, your practice companion. You can practice your German with me. If you're unsure of how to say something, say it in English and I will show you how to say it in German."]
      }]);
      setInitials(user.email.split('@')[0].split('.').filter(s => s)[0][0].toUpperCase() + user.email.split('@')[0].split('.').filter(s => s).pop()[0].toUpperCase());
    }
  }, [user]);

  useEffect(() => {
    if (selectedWeek !== null && selectedWeek !== lastSelectedWeek) {
      setLastSelectedWeek(selectedWeek);
      setMessages(prevMessages => [prevMessages[0]]); // Keep only the initial assistant message
    }
  }, [selectedWeek, lastSelectedWeek]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
  
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return;
  
    // Extract correction from the 'asr' field
    const correction = lastMessage.asr;
  
    // If asr is empty or not provided, do not trigger the popup
    if (!correction || correction.trim() === '') return;
  
    if (!processedCorrectionsRef.current.has(correction)) {
      processedCorrectionsRef.current.add(correction);
      setCurrentCorrection(correction);
      setPracticePopupOpen(true);
    }
  }, [messages]);

  // Reset corrections when week changes
  useEffect(() => {
    if (selectedWeek !== lastSelectedWeek) {
      processedCorrectionsRef.current.clear();
      setPracticePopupOpen(false);
      setCurrentCorrection('');
    }
  }, [selectedWeek, lastSelectedWeek]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/chat', {
        messages: [...messages, userMessage],
        week: selectedWeek
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessages(prevMessages => [...prevMessages, response.data]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const insertCharacter = (char) => {
    const inputElement = document.querySelector('.input-container input');
    const cursorPosition = inputElement.selectionStart;

    const newInputValue = input.slice(0, cursorPosition) + char + input.slice(cursorPosition);

    setInput(newInputValue);

    setTimeout(() => {
      inputElement.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      inputElement.focus();
    }, 0);
  };

  const renderMessage = (content) => {
    if (typeof content === 'string') {
      return <p>{content}</p>;
    }
  
    return content.map((part, idx) => {
      if (typeof part === 'string' && part.startsWith('[Correction]')) {
        const correction = part.replace('[Correction]', '').trim();
  
        // Render the correction directly in the chat with red styling
        return (
          <div key={idx} className="correction-container">
            {/* <p className="correction-title">Correction:</p> */}
            <p className="correction-content">{correction}</p>
          </div>
        );
      } else if (typeof part === 'string' && part.startsWith('[Response]')) {
        try {
          let wordTranslationsString = part
            .replace(/\\u([\dA-Fa-f]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)))
            .replace('[Response]', '')
            .trim()
            .replace(/\\n/g, '')
            .replace(/\(/g, '[')
            .replace(/\)/g, ']')
            .replace(/\\"/g, '')
            .replace(/\\/g, '')
            .replace(/,\s*\[/g, '--[')
            .replace(/,/g, '--')
            .replace(/----/g, ',--')
            .replace(/,--\s*--/g, ',--,')
            .replace(/--\]/g, ',]')
            .replace(/\]--n \[/g, ']--[')
            .slice(1, -1);
          let outerArray = wordTranslationsString.slice(2, -2).split(']--[');
          let splitArray = mergePunctuations(outerArray.map((element) => element.split('--')));
  
          return (
            <p key={idx} className="text-container">
              {splitArray.map(([word, translation], wIdx) => (
                <span key={wIdx} className="hoverable-word">
                  {word + ' '}
                  <span className="tooltiptext badge badge-light">{translation}</span>
                </span>
              ))}
              <TextToSpeech text={splitArray.map((subArray) => subArray[0]).join(' ')} />
            </p>
          );
        } catch (error) {
          console.error('Error parsing response:', error);
          return <p key={idx}>{part}</p>;
        }
      } else if (typeof part === 'string' && part.startsWith('[Translation]')) {
        return <p key={idx} className="translation">{part.replace('[Translation]', '').trim()}</p>;
      }
      return <p key={idx}>{part}</p>;
    });
  };  

  return (
    <div className="chat-container">
      <h1>German Conversation Companion</h1>
      <hr />
      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.role}-row`}>
            {msg.role === 'assistant' && (
              <div className="profile-picture-container">
                <div className='profile-picture items-center justify-center rounded-full font-bold h-7 w-7 bg-text-200 text-bg-100'>M</div>
              </div>
            )}
            <div className={`message ${msg.role}`}>
              {renderMessage(msg.content)}
            </div>
            {msg.role !== 'assistant' && (
              <div className="profile-picture-container">
                <div className='profile-picture items-center justify-center rounded-full font-bold h-7 w-7 bg-text-200 text-bg-100'>{initials}</div>
              </div>
            )}
          </div>
        ))}
                {/* Typing indicator */}
                {isTyping && (
    <div className="message-row assistant-row">
      <div className="profile-picture-container">
        <div className="profile-picture items-center justify-center rounded-full font-bold h-7 w-7 bg-text-200 text-bg-100">M</div>
      </div>
      <div className="message assistant">
        <div className="typing-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  )}

        <div ref={messageEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
        />
        <div className="umlaut-buttons">
          {['ä', 'ö', 'ü', 'ß'].map((char) => (
            <button key={char} onClick={() => insertCharacter(char)}>{char}</button>
          ))}
        </div>
      </div>
      <PronunciationPractice
        correction={currentCorrection}
        isOpen={practicePopupOpen}
        onClose={() => {
          setPracticePopupOpen(false);
          setCurrentCorrection('');
        }}
        token={token} 
      />
    </div>
  );
};

export default Chat;