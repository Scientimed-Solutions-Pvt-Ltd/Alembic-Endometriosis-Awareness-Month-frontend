import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import bgImage2 from '../assets/images/slider-bg1.png';
import bgImage3 from '../assets/images/slider-bg2.png';
import logoImage from '../assets/images/logo.png';
//import ladyImage from '../assets/images/AEAMAWR-lady.png';
import ribbonImage from '../assets/images/ribbon-bg.png';
import ribbonImage2 from '../assets/images/ribbon2.png';
import numberImage from '../assets/images/numberImage.png';
import map from '../assets/images/map.png';
import dashedCircleImage from '../assets/images/sld2img1.png';
import ramimg from '../assets/images/sld2img2.png';
import icon1 from '../assets/images/sld2ico1.png';
import icon2 from '../assets/images/sld2ico2.png';
import icon3 from '../assets/images/sld2ico3.png';
import { getUserData } from '../services/api';

// Slide 1 Component - Endometriosis Statistics
const Slide1: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br relative overflow-hidden" style={{ backgroundImage: `url(${bgImage2})`, backgroundSize: 'cover', backgroundPosition: 'bottom' }}>
    {/* Yellow Ribbon - Left Side */}
    <div className="absolute left-0 bottom-0 sld1rbndiv z-30">
      <img src={ribbonImage} alt="Awareness Ribbon" className="sld1rbn" />
    </div>

    {/* Content Container */}
    <div className="w-full relative z-20 h-full flex flex-col md:flex-row justify-end px-3 sm:px-6 md:px-12 lg:px-20 pt-2 sm:pt-4 md:pt-6 items-start">
      
      {/* Left Side - Woman Illustration (visible on all screens) */}
      {/* <div className="absolute left-0 bottom-0 z-10 md:relative md:flex md:w-1/3 md:justify-center md:items-center">
        <div className="relative">
          <img 
            src={ladyImage} 
            alt="Woman illustration" 
            className="w-[100px] sm:w-[140px] md:w-[280px] lg:w-[320px] h-auto ml-[20px] sm:ml-[40px] md:ml-[140px] lg:ml-[180px] mt-0 md:mt-[15px]" 
          />
        </div>
      </div> */}

      {/* Right Side - Text Content */}
      <div className="contentdiv">
        <h1 className="endoh1 font-light text-white leading-tight">
          Endometriosis is silent...
        </h1>
        <h2 className="endoh2 font-bold text-white mb-2 sm:mb-3 md:mb-6 leading-tight">
          yet echoes in pain and distress.
        </h2>
        
      
          <span className="bg-red-600 text-white px-1 sm:px-2 md:px-3 font-bold endoh3">
            Affects
          </span>
          <span className="text-white ml-1 sm:ml-2 font-bold endoh3">
            approximately
          </span>
        

        {/* Number Image and Text */}
        
          <img src={numberImage} alt="42 million" className="txtimgs1 w-auto mt-4" />
          <div className="font-bold wmntxt">
            women in <span className="font-bold endoh4">India!</span>
          </div>
       
        
        {/* India Map (visible on all screens) */}
        <div className="text-right float-right">
          <img src={map} alt="India Map" className="w-auto mapimg" />
        </div>
      </div>
    </div>

    {/* Citation */}
    <div className="absolute bottom-1 sm:bottom-12 md:bottom-12 lg:bottom-8 left-[50%] sm:left-[60%] md:left-[60%] lg:left-[60%] -translate-x-1/2 z-20 px-2 sm:px-4 text-left ref">
      <p className="text-white/70 text-[8px] sm:text-[10px] md:text-[12px]">
        *Patel M. Recent trends in medical management of endometriosis.<br />
        <em>J Obstet Gynaecol India.</em> 2024;74(6):479-83
      </p>
    </div>
  </div>
);

// Slide 2 Component - Awareness Matters
const Slide2: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br relative overflow-hidden" style={{ backgroundImage: `url(${bgImage3})`, backgroundSize: 'cover', backgroundPosition: 'bottom' }}>
    {/* Yellow Ribbon - Left Side */}
<div className="absolute left-0 bottom-0 sld1rbndiv z-30">
      <img src={ribbonImage2} alt="Awareness Ribbon" className="sld1rbn" />
    </div>

    {/* Content Container */}
    <div className="relative z-20 h-full flex flex-col items-center justify-start pt-4 md:pt-8 px-6 md:px-12 mt-xs">
      
      {/* Title */}
      <div className="text-center mb-2 md:mb-4">
        <h1 className="sld2hd1 font-bold text-white mb-1 leading-tight">
          Many women live with symptoms for years <br className='hidden lg:block' /><span className="text-[40px] font-bold text-yellow-400 leading-tight">
          without a diagnosis.<sup className="text-[24px] text-white font-light">1</sup>
        </span>
        </h1>
       
      </div>

      <div className='sldcontainer'>
        <div className='sld2images'>
 <img src={dashedCircleImage} alt="Raising Awareness matters" className="crclimg" />
   <img src={ramimg} alt="Raising Awareness matters" className="ramimg" />
      </div>
       <div className='sld2content'>
<h1>Reduces diagnostic delay <img src={icon1} alt="icon" /></h1>
<h1>Prevents disease progression <img src={icon2} alt="icon" /></h1>
<h1>Promotes better health <img src={icon3} alt="icon" /></h1>
       </div>
      </div>

     

      {/* Citations */}
      <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-[50%] sm:left-[60%] md:left-[60%] lg:left-[60%] -translate-x-1/2 z-20 px-2 sm:px-4 text-left ref">
      <p className="text-white/70 text-[8px] sm:text-[10px] md:text-[12px]">
          1. Wilson-mooney C. The impact of endometriosis. <em>Nursing.</em> 2025;55(8):25-30.<br />
          2. Sena K. Raising endometriosis awareness: A critical aspect of maternal health. <em>J Women's Health Care.</em> 2025;13(10):754.<br />
          3. World Health Organization. [2023]. Endometriosis.
        </p>
      </div>

      {/* Right side text */}
      {/* <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <p className="text-white/60 text-[10px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          All the images used in this material are for illustration purposes only
        </p>
      </div> */}
    </div>
  </div>
);

// Slides array with components
const slides = [
  { id: 1, Component: Slide1 },
  { id: 2, Component: Slide2 },
];

const InfoSlider: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Get user data
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUserName(userData.name);
    }
  }, []);

  // const goToSlide = (index: number) => {
  //   setCurrentSlide(index);
  // };

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        // style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Gradient Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onMenuClick={toggleMenu} userName={userName} />
        
        {/* Logo in center of header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pt-4 md:pt-0 hidden sm:block">
          <img src={logoImage} alt="Logo" className="endologo" />
        </div>

         <div className="top-0 left-0 right-0 h-auto bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600 block sm:hidden">
          <img src={logoImage} alt="Logo" className="endologo2" />
        </div>
        
        <SideMenu isOpen={isMenuOpen} onClose={closeMenu} userName={userName} />
        
        <main className="flex-1 flex flex-col relative">
          {/* Carousel Container */}
          <div className="flex-1 relative overflow-hidden">
            {/* Slides */}
            <div className="absolute inset-0">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="absolute inset-0"
                  style={{ 
                    transform: `translateX(${(index - currentSlide) * 100}%)`,
                    transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <slide.Component />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-30 bg-white/0 hover:bg-white/40 text-white p-2 md:p-2 rounded-full transition-all duration-300 prevbtn"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-30 bg-white/0 hover:bg-white/40 text-white p-2 md:p-2 rounded-full transition-all duration-300 nextbtn"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-8 md:bottom-4 lg:bottom-4 right-4 md:right-8 z-30 flex flex-col items-end gap-4">
              {/* Dot Indicators */}
              {/* <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-8 h-3 bg-white'
                        : 'w-3 h-3 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div> */}
              
              {/* Next Button */}
              <button
                onClick={() => navigate('/take-pledge')}
                className="prplbtn2 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 mt-6"
              >
                Next 
              </button>
            </div>
          </div>

           <footer className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-10">
            <p className="text-[8px] sm:text-[10px] md:text-xs text-white/90 drop-shadow-md" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              All the images used in this material are for illustration purposes only
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default InfoSlider;
