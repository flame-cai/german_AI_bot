// src/components/VocabVault.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; 

const VocabVault = ({selectedWeek}) => {
  const [words, setWords] = useState([]);
  const [wordQueue, setWordQueue] = useState([]);
  const { token } = useAuth();
  const [lastSelectedWeek, setLastSelectedWeek] = useState(selectedWeek);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender || selectedWeek !== lastSelectedWeek) {
      setIsFirstRender(false);
      setLastSelectedWeek(selectedWeek);
      fetchWords();
    }
  }, [selectedWeek, lastSelectedWeek]);

  const updateWordQueue = (newWords) => {
    setWordQueue((prevQueue) => {
      const updatedQueue = [...prevQueue, ...newWords.map(word => word.word)];
      if (updatedQueue.length > 6) {
        return updatedQueue.slice(-6); // Keep only the last 6 words in the queue
      }
      return updatedQueue;
    });
  };

  const fetchWords = async () => {
    try {
      const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/vocab',{week: selectedWeek, queue: wordQueue},{
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
      });
      setWords(response.data.words);
      updateWordQueue(response.data.words)
      console.log(selectedWeek)
    } catch (error) {
      console.error("Error fetching words:", error);
    }
  };

  return (
    <div class="chat-container">
      <h1>Vocab Vault</h1><hr/>
      <h4>Here are some new German words to learn:</h4><hr/><br/>
      <ul>
        {words.map((word, index) => (
          <li key={index}>
            <strong>{word.word}</strong>: {word.meaning}
          </li>
        ))}
      </ul>
      <br/><hr/><br/>
      <button onClick={fetchWords} class="btn btn-small btn-secondary">Generate New Words</button>
    </div>
  );
};

export default VocabVault;