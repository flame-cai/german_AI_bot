// src/components/App.js
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css';
import Chat from './components/Chat';
import MeaningMatcher from './components/MeaningMatcher';
import VocabVault from './components/VocabVault';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/protectedRoute';
import { AuthProvider } from './components/AuthContext';
import PrivacyPopup from './components/PrivacyPopup';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const logoutTimerRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleLoginSuccess = (userData) => {
    const { token, expiresIn } = userData;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data // Store JWT token

    // Optionally, store expiry time if you plan to handle auto logout based on token expiry
    const expiryTime = new Date().getTime() + expiresIn * 6 * 60 * 60 * 1000; // Convert to milliseconds, this is 6 hrs
    // localStorage.setItem('expiryTime', expiryTime);
    resetLogoutTimer();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    clearTimeout(logoutTimerRef.current);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // localStorage.removeItem('expiryTime');
  };

  const resetLogoutTimer = () => {
    clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      alert('You have been logged out due to inactivity.');
      handleLogout();
    }, 30 * 60 * 1000); // 30 minutes
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    window.addEventListener('mousemove', resetLogoutTimer);
    window.addEventListener('keydown', resetLogoutTimer);

    return () => {
      window.removeEventListener('mousemove', resetLogoutTimer);
      window.removeEventListener('keydown', resetLogoutTimer);
      clearTimeout(logoutTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (user) {
      resetLogoutTimer();
    }
  }, [user]);

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const togglePopup = () => {
    setIsPopupOpen((prevState) => !prevState);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected Option:', option);
  };

  // useEffect(() => {
  // const handleTabClose = (event) => {
  //   // Clear only specific items
  //   localStorage.removeItem('user');
  //   localStorage.removeItem('token');
    
  // };

  //   window.addEventListener('beforeunload', handleTabClose);

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener('beforeunload', handleTabClose);
  //   };
  // }, []);
  
  return (
    // <AuthProvider>
    <Router>
      <div className="App d-flex">
        {user && (
        <nav className={`sidebar d-flex flex-column align-items-center ${isSidebarOpen ? 'open' : 'collapsed'}`}>
          <div className="toggle-bump" onClick={toggleSidebar}>
            <i className={`fa ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </div>
        {isSidebarOpen && (
          <>
            <div className="logo my-3">
              <img src="flame_img.jpeg" alt="FLAME Logo" className="img-fluid" />
            </div>
            <hr className="w-75" />
            <ul className="nav flex-column w-100 text-center">
              <li className="nav-item">
                <Link to="/conversation-companion" className="nav-link">Conversation Companion</Link>
              </li>
              <li className="nav-item">
                <Link to="/meaning-matcher" className="nav-link">Meaning Matcher</Link>
              </li>
              <li className="nav-item">
                <Link to="/vocab-vault" className="nav-link">Vocab Vault</Link>
              </li>
            </ul>
            <hr className="w-75" />
            <div className="week-selector my-3">
              <label htmlFor="week-select" className="week-label">Select Week:</label>
              <select id="week-select" onChange={handleWeekChange} value={selectedWeek} className="week-dropdown">
                <option value="week1">Week 1</option>
                <option value="week2">Week 2</option>
                {/* Add more weeks as needed */}
              </select>
            </div>
            <div className="popup-button-container mt-auto">
                <button className="popup-button" onClick={togglePopup}>
                  Privacy Settings
                </button>
              </div>
            </>
        )}
          </nav>
        )}
        <div className="content d-flex flex-column flex-grow-1">
          {user && (
            <div className="logout-container">
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          )}
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/conversation-companion" element={<ProtectedRoute user={user}><Chat selectedWeek={selectedWeek} /></ProtectedRoute>} />
                <Route path="/meaning-matcher" element={<ProtectedRoute user={user}><MeaningMatcher selectedWeek={selectedWeek}/></ProtectedRoute>} />
                <Route path="/vocab-vault" element={<ProtectedRoute user={user}><VocabVault selectedWeek={selectedWeek}/></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/conversation-companion" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
      {isPopupOpen && (
        <PrivacyPopup
          onClose={togglePopup}
          // options={['Option 1', 'Option 2', 'Option 3']}
          // onSelect={handleOptionSelect}
        />
      )}
    </Router>
    // </AuthProvider>
  );
}
export default App;