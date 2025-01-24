import '../App.css';
import React, {useState} from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; 

const PrivacyPopup = ({ onClose }) => {
    const [privacy, setSelectedOption] = useState("1");
    const { token } = useAuth();
  
    const handleSubmit = async () => {
      if (!privacy) {
        alert('Please select an option before submitting.');
        return;
      }
  
      try {
        const response = await axios.post(
          'https://asia-south1-ppt-tts.cloudfunctions.net/ge-lang-backend/privacy',
          {
            privacy: privacy, // The selected radio option
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in the request header
            },
          }
        );
  
        if (response.status === 200) {
          alert('Option submitted successfully!');
        } else {
          alert('Submission failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during submission:', error);
        alert('An error occurred. Please try again.');
      }
  
      onClose(); // Close the popup after submission
    };
  
    return (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={onClose}>
              &times;
            </button>
            <h2>Consent Form</h2>
            <div className="scrollable-content">
              <h3>Title: Teaching Artificial Intelligence in non-STEM settings: a case study</h3>
              <h4>Introduction:</h4>
              <p>
                You have been invited to participate in a research study conducted by Kaushik Gopalan
                from FLAME University. The broad goal of the study is to analyze ways in which the
                students interact with the AI interface and use the learnings from the case study to
                further improve the tools used to teach AI to non-STEM students.
              </p>
              <h4>Purpose of the Study:</h4>
              <p>
                The purpose of this study is to demonstrate novel methods to help non-STEM students
                learn about essential skills while using Generative AI technologies. Specifically, we
                introduce tools which help non-STEM students develop prompt engineering and information
                verification skills.
              </p>
              <h4>Procedures:</h4>
              <p>
                If you consent, we will save the prompts you provided and the AI's responses and use it
                for research purposes. However, your identity or email will NOT be saved and all the
                data will be completely anonymous.
              </p>
              <h4>Duration of Participation:</h4>
              <p>
                The study consists of the hands-on activity that you just completed in class. You will
                only need a few minutes to read this form and decide if you would like to allow the use
                of your activity for research purposes.
              </p>
              <h4>Participation and Withdrawal:</h4>
              <p>
                Participation in this study is entirely voluntary, and you are free to choose whether or
                not to participate. You may withdraw from the study at any time without any
                consequences or loss of benefits to which you are otherwise entitled. There is no
                compensation for participation, and no grades or academic evaluations are associated
                with any of the activities in this study. The investigator may choose to withdraw you
                from the study if circumstances arise that warrant such action.
              </p>
              <h4>Consent of Participation:</h4>
              <ul>
                <li>I have received sufficient information about this research project.</li>
                <li>I understand the procedures described above.</li>
                <li>My questions have been answered to my satisfaction.</li>
              </ul>
            </div>
            <form>
              <div className="radio-option">
                <label>
                  <input
                    type="radio"
                    name="privacy-option"
                    value="1"
                    checked={privacy === "1"}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  /> &nbsp;
                  I agree to participate in this research project, by permitting to the use of my data for research purposes AND I state that I am at least 18 years of age.
                </label>
              </div>
              <div className="radio-option">
                <label>
                  <input
                    type="radio"
                    name="privacy-option"
                    value="0"
                    checked={privacy === "0"}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  /> &nbsp;
                   I do not agree to participate in this research project, by NOT permitting to the use of my data for research purposes OR I am under 18 years of age.
                </label>
              </div>
            </form>
            <button className="submit-button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      );
    };
    
    export default PrivacyPopup;
  