import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import thanksBg from '../assets/images/thanks-bg.png';
import { getPledgeCount } from '../services/api';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const [pledgeCount, setPledgeCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);

  // Format count to 4 digits
  const formatCount = (count: number): string[] => {
    return count.toString().padStart(5, '0').split('');
  };

  // Fetch pledge count from API
  useEffect(() => {
    const fetchPledgeCount = async () => {
      try {
        const response = await getPledgeCount();
        if (response.success) {
          setTargetCount(response.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch pledge count:', error);
        // Set default count if API fails
        setTargetCount(0);
      }
    };

    fetchPledgeCount();
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (targetCount === 0) return;

    const duration = 2000; // Animation duration in ms
    const steps = 60; // Number of steps
    const increment = targetCount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setPledgeCount(targetCount);
        clearInterval(timer);
      } else {
        setPledgeCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetCount]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${thanksBg})` }}
      />
      
      {/* Gradient Header Overlay */}
      {/* <div className="absolute top-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600" /> */}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* <Header onMenuClick={toggleMenu} />
        <SideMenu isOpen={isMenuOpen} onClose={closeMenu} /> */}
        
        <main className="flex-1 flex items-center justify-center text-center">
          <div className="w-[90%] md:w-[80%] flex flex-col gap-2 md:gap-4 lg:gap-6 justify-center items-center py-4 lg:py-8 text-center">
            {/* Live Count Title */}
            <h2 className="hdng1 text-3xl lg:text-4xl xl:text-5xl">
              Live count of pledges taken by<br/>the HCPs across India
            </h2>

            {/* Counter Display */}
            <div className="flex items-center justify-center gap-2 my-2 lg:my-4">
              {formatCount(pledgeCount).map((digit, index) => (
                <div 
                  key={index}
                  className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg flex items-center justify-center shadow-md counterbg">
                  <span className="text-2xl md:text-3xl lg:text-4xl">{digit}</span>
                </div>
              ))}
            </div>

            {/* Thank You Message */}
            {/* <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-relaxed">
              Thank you
            </h1> */}
            
            <p className="thanktext text-xl lg:text-2xl xl:text-3xl">
              Thank you for your participation in <br />
              <b><i>"I Support Yellow March" Campaign</i></b>
            <br />
             <span>Endometriosis Awareness Month</span>
            </p>
            
            {/* Home Button */}
            <button
              onClick={() => navigate('/hcp-details')}
              className="px-8 py-3 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ backgroundColor: '#8f3c84' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7a3370'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8f3c84'}
            >
              Home
            </button>
          </div>
          
          <footer className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-10">
            <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-600" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              ALC/UNI/20262/1001807
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ThankYou;
