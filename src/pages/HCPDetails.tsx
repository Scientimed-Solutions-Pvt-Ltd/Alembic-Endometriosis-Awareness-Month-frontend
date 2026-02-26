import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HCPDetailsForm from '../components/HCPDetailsForm';
import SideMenu from '../components/SideMenu';
import eamLogo from '../assets/images/EAM-logo.png';
import bgImage from '../assets/images/bg01.png';
import { getUserData, addDoctor, updateDoctor, saveDoctorData, getDoctorsByFieldTeam } from '../services/api';

const HCPDetails: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingDoctors, setExistingDoctors] = useState<any[]>([]);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSubmit = async (data: any, existingDoctorId?: number) => {
    setIsLoading(true);
    setError('');

    try {
      let response;
      
      // If existingDoctorId is provided, update the doctor, otherwise create new
      if (existingDoctorId) {
        response = await updateDoctor(
          existingDoctorId,
          data.hcpname,
          data.city,
          data.mobile || undefined,
          data.pCode || undefined
        );
        console.log('Doctor updated successfully:', response.data);
      } else {
        response = await addDoctor(
          data.hcpname,
          data.city,
          data.mobile || undefined,
          data.pCode || undefined
        );
        console.log('Doctor created successfully:', response.data);
      }

      if (response.success) {
        // Save doctor data to localStorage
        saveDoctorData(response.data);
        console.log('Doctor data saved to localStorage');
        // Navigate to info slider page on success
        navigate('/info-slider');
      } else {
        setError(response.message || 'Failed to save HCP details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit HCP details');
      console.error('HCP submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is logged in and fetch existing doctors
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      // Redirect to home if not logged in
      navigate('/');
    } else {
      // Set the MR name from user data
      setUserName(userData.name);
      
      // Fetch existing doctors for this field team
      const fetchDoctors = async () => {
        try {
          const response = await getDoctorsByFieldTeam(userData.id);
          if (response.success && response.data) {
            setExistingDoctors(response.data);
            console.log('Existing doctors loaded:', response.data);
          }
        } catch (err) {
          console.error('Failed to fetch existing doctors:', err);
          // Don't show error to user, just log it
        }
      };
      
      fetchDoctors();
    }
  }, [navigate]);

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
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Gradient Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-14 lg:h-16 xl:h-20 2xl:h-24 bg-gradient-to-r from-amber-500 via-rose-500 via-60% to-purple-600" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onMenuClick={toggleMenu} userName={userName} showMenu={true} />
        <SideMenu isOpen={isMenuOpen} onClose={closeMenu} userName={userName} />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 px-4 md:px-8 lg:px-16 py-0 lg:py-1 xl:py-4">
            <div className="h-full flex items-center">
              <div className="w-full">
                <div className="p-1 lg:p-2 xl:p-6">
                  <img src={eamLogo} alt="EAM Logo" className="mb-1 lg:mb-2 eam-logo max-h-12 lg:max-h-16 xl:max-h-24" />
                  <div className="mt-1 lg:mt-2 xl:mt-4">
                    <HCPDetailsForm 
                      onBack={handleBack} 
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      error={error}
                      existingDoctors={existingDoctors}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="absolute bottom-2 right-4 md:bottom-4 md:right-6 z-10">
            <p className="text-xs text-white/90 text-right drop-shadow-md">
              All the images used in this material are for illustration purposes only
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default HCPDetails;
