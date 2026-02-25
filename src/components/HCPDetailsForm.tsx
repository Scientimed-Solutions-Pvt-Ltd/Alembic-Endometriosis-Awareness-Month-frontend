import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface HCPDetailsFormProps {
  onBack?: () => void;
  onSubmit?: (data: FormData) => void;
  isLoading?: boolean;
  error?: string;
}

interface FormData {
  hcpname: string;
  registrationNo: string;
  pCode: string;
  city: string;
  photo: string;
  mobile: string;
  email: string;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: CroppedAreaPixels): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
};

const HCPDetailsForm: React.FC<HCPDetailsFormProps> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState<FormData>({
    hcpname: '',
    registrationNo: '',
    pCode: '',
    city: '',
    photo: '',
    mobile: '',
    email: ''
  });
  const [nameError, setNameError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [pCodeError, setPCodeError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cityError, setCityError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific errors when user starts typing
    if (name === 'hcpname' && nameError) {
      setNameError('');
    }
    if (name === 'registrationNo' && registrationError) {
      setRegistrationError('');
    }
    if (name === 'pCode' && pCodeError) {
      setPCodeError('');
    }
    if (name === 'mobile' && mobileError) {
      setMobileError('');
    }
    if (name === 'email' && emailError) {
      setEmailError('');
    }
    if (name === 'city' && cityError) {
      setCityError('');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageToCrop(base64String);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setPhotoPreview(croppedImage);
        setFormData(prev => ({
          ...prev,
          photo: croppedImage
        }));
        setShowCropper(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset all errors
    setNameError('');
    setRegistrationError('');
    setPCodeError('');
    setMobileError('');
    setEmailError('');
    setCityError('');
    
    // Custom validation
    let hasError = false;
    
    if (!formData.hcpname.trim()) {
      setNameError('Please enter HCP name');
      hasError = true;
    }
    
    if (!formData.registrationNo.trim()) {
      setRegistrationError('Please enter registration number');
      hasError = true;
    }
    
    if (!formData.pCode.trim()) {
      setPCodeError('Please enter P. Code');
      hasError = true;
    }
    
    if (!formData.mobile.trim()) {
      setMobileError('Please enter mobile number');
      hasError = true;
    } else if (formData.mobile.length !== 10) {
      setMobileError('Mobile number must be 10 digits');
      hasError = true;
    }
    
    if (!formData.email.trim()) {
      setEmailError('Please enter email ID');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    
    if (!formData.city.trim()) {
      setCityError('Please enter city');
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const inputClasses = "w-full border-none rounded-xl py-2 px-4 text-lg bg-white focus:outline-none focus:shadow-lg focus:shadow-primary/30 transition-shadow placeholder-gray-800";

  return (
     <div className="rounded-2xl p-6 md:p-8 shadow-lg max-w-md formbg">
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 text-center">Enter HCP Details</h3>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="mb-6">
          {nameError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {nameError}
            </div>
          )}
          <input
            type="text"
            className={inputClasses}
            id="hcpname"
            name="hcpname"
            value={formData.hcpname}
            onChange={handleChange}
            placeholder="Enter HCP Name"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          {registrationError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {registrationError}
            </div>
          )}
          <input
            type="text"
            className={inputClasses}
            id="registrationNo"
            name="registrationNo"
            value={formData.registrationNo}
            onChange={handleChange}
            placeholder="Enter Registration No."
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          {pCodeError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {pCodeError}
            </div>
          )}
          <input
            type="text"
            className={inputClasses}
            id="pCode"
            name="pCode"
            value={formData.pCode}
            onChange={handleChange}
            placeholder="Enter P. Code"
            disabled={isLoading}
            required
          />
        </div>

            <div className="mb-6">
          {mobileError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {mobileError}
            </div>
          )}
          <input
            type="tel"
            className={inputClasses}
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter Mobile Number"
            disabled={isLoading}
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="mb-6">
          {emailError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {emailError}
            </div>
          )}
          <input
            type="email"
            className={inputClasses}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email ID"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          {cityError && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {cityError}
            </div>
          )}
          <input
            type="text"
            className={inputClasses}
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter City"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6 hidden">
          {/* Hidden file input for photo */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            id="photo"
            name="photo"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
          />
          
          {photoPreview ? (
            <div className="relative">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePhotoClick}
              className={`${inputClasses} flex items-center justify-between cursor-pointer text-gray-800`}
            >
              <span>Take or Upload Photo</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>

    

        <div className="flex justify-between items-center mt-6">
          <small className='text-base'>(All Fields are mandatory)</small>
          <button 
            type="submit" 
            className="prplbtn1 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Next'}
          </button>
        </div>
      </form>

      {/* Cropper Modal */}
      {showCropper && imageToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl p-4 w-[90%] max-w-md">
            <h4 className="text-lg font-bold text-purple-900 mb-4 text-center">Add Photo</h4>
            <div className="relative w-full h-64 bg-gray-200 rounded-xl overflow-hidden">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-600">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 py-2 px-4 grybtn1 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 py-2 px-4 prplbtn1 transition-colors"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HCPDetailsForm;
