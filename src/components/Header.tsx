import React from 'react';
import alembicLogo from '../assets/images/alembic-logo.png';

interface HeaderProps {
  onMenuClick?: () => void;
  userName?: string;
  showMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, userName, showMenu = true }) => {
  return (
    <header className="relative z-10">
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between py-1 sm:py-4">
          <div>
            <img 
              src={alembicLogo} 
              alt="Alembic Logo" 
              className="h-10 md:h-14 w-auto mt-2"
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
  );
};

export default Header;
