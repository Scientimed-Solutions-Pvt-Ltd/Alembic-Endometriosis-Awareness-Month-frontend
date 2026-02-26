import React from 'react';
import alembicLogo from '../assets/images/alembic-logo.png';
import logoImage from '../assets/images/logo.png';

interface HeaderProps {
  onMenuClick?: () => void;
  userName?: string;
  showMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, userName, showMenu = true }) => {
  return (
    <>
      <header className="relative z-10">
        {/* Center Logo - Desktop/Large Tablet (absolute positioned, visible from lg:1024px+) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pt-0 hidden lg:block">
          <img src={logoImage} alt="Logo" className="endologo h-10 lg:h-12 xl:h-16 2xl:h-20 xl:mt-[10px]" />
        </div>
        
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between py-1 lg:py-2 xl:py-4">
            <div>
              <img 
                src={alembicLogo} 
                alt="Alembic Logo" 
                className="h-8 lg:h-10 xl:h-14 w-auto mt-1 lg:mt-2"
              />
            </div>
            <div className="flex items-center gap-4">
              {userName && (
                <div className="text-white text-sm md:text-base font-medium">
                  {userName}
                </div>
              )}
              {showMenu && onMenuClick && (
                <button 
                  className="p-0 border-0 bg-transparent cursor-pointer transition-transform duration-300 hover:scale-110"
                  onClick={onMenuClick}
                  aria-label="Menu"
                >
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 40 40" 
                    fill="none"
                  >
                    <line x1="8" y1="12" x2="32" y2="12" stroke="white" strokeWidth="2"/>
                    <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeWidth="2"/>
                    <line x1="8" y1="28" x2="32" y2="28" stroke="white" strokeWidth="2"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Center Logo - Mobile/Tablet (below header, visible below lg:1024px) */}
      <div className="w-full h-auto bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600 block lg:hidden">
        <img src={logoImage} alt="Logo" className="endologo2" />
      </div>
    </>
  );
};

export default Header;
