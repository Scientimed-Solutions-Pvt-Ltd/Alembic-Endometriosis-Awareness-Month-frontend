import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import RibbonProgress from '../components/RibbonProgress';
import logoImage from '../assets/images/logo.png';
import clickGif from '../assets/images/click.gif';
import { getUserData, getDoctorData, acceptTerms, saveDoctorData, takePledge, getPledgeCount } from '../services/api';

// Extend Window interface for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

const TakePledge: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ribbonProgress, setRibbonProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const [pledgeCompleted, setPledgeCompleted] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAcceptingTerms, setIsAcceptingTerms] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  
  // Pledge count states
  const [_currentPledgeCount, setCurrentPledgeCount] = useState(0);
  const TARGET_PLEDGE_COUNT = 10000; // Target: 10,000 doctors
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const navigate = useNavigate();
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Target words/phrases to detect from "I support yellow march"
  // Support partial matches (50% or more words) and variations of "march"
  const targetPhraseWords = ['i', 'support', 'yellow', 'march'];
  const marchVariations = ['march', 'mark', 'mar', 'mare', 'mars', 'marsh'];

  /**
   * Calculate ribbon progress percentage
   * - If count <= 200: Show minimum 25% fill
   * - If count > 200: Show actual percentage (count / 10,000) * 100
   */
  const calculateRibbonPercentage = (count: number): number => {
    if (count <= 200) {
      return 25; // Minimum 25% when count is 200 or less
    }
    // Calculate actual percentage for counts > 200
    return Math.min((count / TARGET_PLEDGE_COUNT) * 100, 100);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Get user data and check terms acceptance
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUserName(userData.name);
    }

    // Check if doctor has already accepted terms
    const doctorData = getDoctorData();
    console.log('TakePledge page loaded. Doctor data:', doctorData);
    
    if (doctorData) {
      setDoctorName(doctorData.dr_name);
      setRegistrationNo(doctorData.registration_no || 'N/A');
      
      if (doctorData.terms_accepted) {
        // Terms already accepted, don't show popup
        console.log('Terms already accepted, hiding popup');
        setShowConsent(false);
      } else {
        console.log('Terms not accepted, showing popup');
      }
    } else {
      console.log('No doctor data found');
    }
    
    // Don't fetch pledge count on page load - only show ribbon after pledge is taken
  }, []);

  /**
   * Handle accepting terms and conditions
   */
  const handleAcceptTerms = async () => {
    setIsAcceptingTerms(true);

    try {
      const doctorData = getDoctorData();
      
      if (!doctorData) {
        console.error('No doctor data found');
        alert('Doctor information not found. Please fill HCP details first.');
        setShowConsent(false);
        setIsAcceptingTerms(false);
        return;
      }

      console.log('Calling acceptTerms API for doctor ID:', doctorData.id);

      // Call API to accept terms
      const response = await acceptTerms(doctorData.id);

      console.log('Accept terms response:', response);

      if (response.success) {
        // Update doctor data in localStorage
        saveDoctorData(response.data);
        console.log('Terms accepted successfully, updated data:', response.data);
        // Hide consent popup
        setShowConsent(false);
      } else {
        console.error('API returned success: false');
        alert('Failed to save terms acceptance');
      }
    } catch (err) {
      console.error('Failed to accept terms:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      // Still hide the popup even if API fails
      setShowConsent(false);
    } finally {
      setIsAcceptingTerms(false);
    }
  };

  /**
   * Checks if transcript matches at least 50% of target phrase words
   * Also accepts variations of "march"
   * @param text - The transcript text to check
   * @returns boolean indicating if a match was found
   */
  const checkForTargetWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    let matchCount = 0;
    
    // Check for "i"
    if (words.includes('i')) matchCount++;
    
    // Check for "support"
    if (words.includes('support')) matchCount++;
    
    // Check for "yellow"
    if (words.includes('yellow')) matchCount++;
    
    // Check for "march" or its variations
    const hasMarchVariation = marchVariations.some(variation => 
      words.some(word => word.includes(variation) || variation.includes(word))
    );
    if (hasMarchVariation) matchCount++;
    
    // Need at least 50% match (2 out of 4 words)
    const requiredMatches = Math.ceil(targetPhraseWords.length * 0.5);
    return matchCount >= requiredMatches;
  };

  /**
   * Handles successful speech detection
   * Stops recognition and saves pledge to database
   */
  const handleSuccessfulDetection = async () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Update visual states
    setIsListening(false);
    setIsAnimating(true);
    
    // Save pledge first to get updated count
    const completePledge = async () => {
      try {
        const doctorData = getDoctorData();
        if (doctorData) {
          console.log('Saving pledge to database for doctor:', doctorData.id);
          const response = await takePledge(doctorData.id);
          if (response.success) {
            saveDoctorData(response.data);
            console.log('Pledge saved successfully!');
          }
        }
        
        // Fetch updated pledge count
        const countResponse = await getPledgeCount();
        if (countResponse.success) {
          const newCount = countResponse.data.count;
          setCurrentPledgeCount(newCount);
          
          // Calculate target percentage based on count
          // If count <= 200: minimum 25%, otherwise actual percentage
          const targetPercentage = calculateRibbonPercentage(newCount);
          console.log(`New pledge count: ${newCount}/${TARGET_PLEDGE_COUNT} (${targetPercentage.toFixed(2)}%)`);
          
          // Animate ribbon to the actual percentage
          animateToPercentage(targetPercentage);
        }
      } catch (error) {
        console.error('Error saving pledge:', error);
        setPledgeCompleted(true);
      }
    };
    
    // Function to animate ribbon to target percentage
    const animateToPercentage = (targetPercentage: number) => {
      const animationDuration = 2000; // Total animation time in ms
      const startProgress = 0; // Always start from 0 since ribbon is empty initially
      let startTime: number | null = null;
      
      // Ease-out cubic for smooth deceleration
      const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
      
      const animateProgress = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const linearProgress = Math.min(elapsed / animationDuration, 1);
        
        // Apply easing and interpolate from 0 to target percentage
        const easedProgress = easeOutCubic(linearProgress);
        const currentProgress = startProgress + (targetPercentage - startProgress) * easedProgress;
        setRibbonProgress(currentProgress);
        
        if (linearProgress < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          // Animation complete
          setRibbonProgress(targetPercentage);
          setPledgeCompleted(true);
        }
      };
      
      requestAnimationFrame(animateProgress);
    };
    
    // Start the process
    await completePledge();
    
    console.log('Speech detected! Pledge completed!');
  };

  /**
   * Initializes and starts speech recognition
   */
  const startSpeechRecognition = () => {
    // Check browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setIsSupported(false);
      return;
    }

    // Create new recognition instance
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    // Configure recognition settings
    recognition.continuous = true; // Keep listening until stopped
    recognition.interimResults = true; // Get results while speaking
    recognition.lang = 'en-US'; // Set language to English

    // Handle speech recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started');
    };

    // Handle speech recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const combinedTranscript = finalTranscript || interimTranscript;
      console.log('Transcript:', combinedTranscript);

      // Check if any target word is detected
      if (checkForTargetWords(combinedTranscript)) {
        console.log('Target word detected in:', combinedTranscript);
        handleSuccessfulDetection();
      }
    };

    // Handle speech recognition errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone permissions and try again.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again and speak clearly.');
          break;
        case 'audio-capture':
          setError('No microphone found. Please connect a microphone and try again.');
          break;
        case 'network':
          setError('Network error occurred. Please check your connection.');
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    // Handle speech recognition end
    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Only reset if not navigating
      if (!isAnimating) {
        setIsListening(false);
      }
    };

    // Request microphone permission and start recognition
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
    }
  };

  /**
   * Stops speech recognition manually
   */
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  /**
   * Handles pledge button click - starts speech recognition
   */
  const handlePledgeClick = () => {
    if (isListening) {
      // If already listening, stop recognition
      stopSpeechRecognition();
    } else {
      // Start speech recognition
      setError(null);
      startSpeechRecognition();
    }
  };

  // Cleanup speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Consent Popup */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white w-[95%] sm:w-[92%] md:w-[85%] lg:w-[80%] xl:w-[75%] max-w-5xl mx-2 sm:mx-4 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Popup Header */}
           
            
            {/* Popup Content */}
            <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-6 max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] overflow-y-auto">
              <p className="text-black text-[18px] text-center">
                <b>CONSENT:</b> I hereby agree, declare and confirm my Personal Identifiable Information (PII) and / or Sensitive Personal
Data and Information (SPDI) to be used, stored by Alembic Pharmaceuticals Limited and I do hereby provide my
unconditional consent and authorize Alembic to act upon, use, store, transfer the information (PII and/or SPDI) to
third party for various purposes including but not limited to marketing activities, creating record in Asia Book of
Records for Endometriosis Awareness Month. I understand, agree, declare, confirm and acknowledge that the
portal /platform used by Alembic may have servers residing outside of India and/ or managed by third party
technology providers who will have access to the PII and / or SPDI and I hereby expressly consent to my information
being stored/used through such portal/platform by Alembic and / or third party.
              </p>
              
            </div>
            
            {/* Popup Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-center">
              <button
                onClick={handleAcceptTerms}
                disabled={isAcceptingTerms}
                className="prplbtn1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isAcceptingTerms ? 'Processing...' : 'I Agree'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content - Only visible after consent */}
      <div className={showConsent ? 'visible' : 'visible'}>
        {/* Gradient Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
        <Header onMenuClick={toggleMenu} userName={userName} />
        <SideMenu isOpen={isMenuOpen} onClose={closeMenu} userName={userName} />
      {/* Logo in center of header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pt-4 md:pt-0 hidden sm:block">
          <img src={logoImage} alt="Logo" className="endologo" />
        </div>

         <div className="top-0 left-0 right-0 h-auto bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600 block sm:hidden">
          <img src={logoImage} alt="Logo" className="endologo2" />
        </div>
        
        {/* Doctor Info - Right side below header */}
        <div className="absolute top-28 md:top-28 right-2 sm:right-4 md:right-6 z-20 text-right">
          <p className="text-[14px] sm:text-[15px] md:text-[15px] text-gray-900 font-medium">Doctor Name: <span className="font-normal">{doctorName || 'N/A'}</span> <br className='block sm:hidden' />&nbsp;&nbsp;&nbsp; Registration No.: <span className="font-normal">{registrationNo || 'N/A'}</span></p>
        </div>
        
       <main className="flex-1 flex items-center justify-center text-center">
  <div className="w-[80%] flex flex-col md:flex-row gap-4 justify-center items-center py-16 text-center">
              

                {/* Text Content */}
               <div className="w-full md:w-[62%] text-center">
                  {/* Show speech UI or Continue button after pledge */}
                  {!pledgeCompleted && !isAnimating ? (
                    <>
                      {/* Show pledge content only before success */}
                      <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed mb-6 text-center">
                        Alembic Pharmaceuticals Limited is attempting for creating record in Asia Book of Records for 'Maximum no of Healthcare Professionals (HCPs), pledging to raise awareness of Endometriosis with a goal of improving quality of life of affected women.
                      </p>
                      
                      <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed mb-8 text-center">
                        By taking this pledge they would be part of creating record in Asia Book of Records for- 'Maximum no of Healthcare Professionals (HCPs), pledging to raise awareness of Endometriosis with a goal of improving quality of life of affected women
                      </p>
                      
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900 leading-tight mb-8 text-center">
                        {isListening ? 'Listening... Say the pledge!' : 'Click here and say'}
                      </p>
                      
                      {/* Recording Indicator - Shows when listening */}
                      {isListening && (
                        <div className="flex flex-col items-center justify-center mb-6">
                          {/* Pulsing Mic Animation */}
                          <div className="relative flex items-center justify-center">
                            {/* Outer pulse rings */}
                            <div className="absolute w-24 h-24 bg-red-400 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute w-20 h-20 bg-red-500 rounded-full animate-ping opacity-30 animation-delay-200"></div>
                            {/* Inner mic circle */}
                            <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg z-10">
                              {/* Mic Icon */}
                              <svg 
                                className="w-8 h-8 text-white animate-pulse" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Error Message Display */}
                      {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                          {error}
                        </div>
                      )}
                      
                      {/* Browser Support Warning */}
                      {!isSupported && (
                        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-700 text-sm">
                          Speech recognition not supported. Please use Chrome, Edge, or Safari.
                        </div>
                      )}
                      
                      <button
                        onClick={handlePledgeClick}
                        disabled={!isSupported}
                        className={`relative inline-flex items-center gap-2 rounded-full shadow-lg duration-300 mb-8 pldgbtn ${
                          isListening 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'hover:shadow-xl hover:-translate-y-1'
                        } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isListening ? 'Stop Listening' : '"I Support Yellow March"'}
                        {!isListening && (
                          <span className="clickgif">
                            <img src={clickGif} alt="Click Animation" />
                          </span>
                        )}
                      </button>
                      
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900 leading-relaxed mb-8 text-center">
                        {isListening ? 'Say "I Support Yellow March"' : 'to take pledge'}
                      </p>
                    </>
                  ) : (
                    /* Just Continue button - Shown after pledge is detected */
                    <div className="flex flex-col items-center justify-center animate-fade-in">
                      <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed mb-6 text-center">
                        Alembic Pharmaceuticals Limited is attempting for creating record in Asia Book of Records for 'Maximum no of Healthcare Professionals (HCPs), pledging to raise awareness of Endometriosis with a goal of improving quality of life of affected women.
                      </p>
                      
                      <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed mb-8 text-center">
                        By taking this pledge they would be part of creating record in Asia Book of Records for- 'Maximum no of Healthcare Professionals (HCPs), pledging to raise awareness of Endometriosis with a goal of improving quality of life of affected women
                      </p>
                      <button
                        onClick={() => navigate('/thank-you')}
                        className="prplbtn1 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>

                  {/* Gray Awareness Ribbon with Progress */}
                 <div className="w-full md:w-[25%] text-center">
                   <RibbonProgress
                     percentage={ribbonProgress}
                     transitionDuration={100}
                     className={`m-auto transition-transform duration-700 ease-out ${
                       isAnimating 
                         ? 'scale-105' 
                         : 'scale-100'
                     }`}
                   />
                </div>
              </div>
            
          
          <footer className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-10">
            <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-600" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              All the images used in this material are for illustration purposes only
            </p>
          </footer>
          
          {/* Disclaimer - Bottom Left */}
          <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-2 sm:left-4 md:left-6 z-10 max-w-[100%] sm:max-w-[100%] md:max-w-[100%]">
            <p className="text-[10px] text-gray-800 leading-tight">
             <b>Disclaimer:</b> Mention by this campaign, Alembic attempting for creating record in Asia Book of Records for Endometriosis Awareness Month
            </p>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default TakePledge;