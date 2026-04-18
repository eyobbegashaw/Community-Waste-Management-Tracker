import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './ReportPage.css';

const ReportPage = () => {
  const [step, setStep] = useState(1); // 1: photo, 2: details, 3: submit
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { t } = useLanguage();

  // Get user location on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userLocation);
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`
            );
            const data = await response.json();
            setAddress(data.display_name);
          } catch (error) {
            console.error('Error getting address:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Please enable location services.');
        }
      );
    }
  }, []);

  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setPhoto(file);
      setPhotoPreview(canvas.toDataURL('image/jpeg'));
      
      // Stop camera stream
      const stream = video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      
      setStep(2);
    }, 'image/jpeg');
  };

  const handleSubmit = async () => {
    if (!photo || !description || !location || !currentUser) {
      setError('Please complete all steps');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const reportData = {
        userId: currentUser.uid,
        userName: userProfile?.name || 'Anonymous',
        userPhone: userProfile?.phone || '',
        location: {
          address: address || 'Location pinned on map',
          lat: location.lat,
          lng: location.lng
        },
        description,
        status: 'new'
      };

      await reportService.createReport(reportData, photo);
      navigate('/', { state: { reportSubmitted: true } });
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <div className="report-header">
          <button className="back-button" onClick={() => navigate('/')}>← {t('back')}</button>
          <h1>{t('reportIssue')}</h1>
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1. 📸</span>
            <span className={step >= 2 ? 'active' : ''}>2. 📝</span>
            <span className={step >= 3 ? 'active' : ''}>3. ✅</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <div className="photo-step">
            <div className="photo-options">
              <button 
                className="photo-option"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="option-icon">📁</span>
                <span>{t('choosePhoto')}</span>
              </button>
              
              <button 
                className="photo-option"
                onClick={handleCameraCapture}
              >
                <span className="option-icon">📷</span>
                <span>{t('takePhoto')}</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handlePhotoCapture}
            />

            <video 
              ref={videoRef} 
              style={{ display: 'none' }} 
              autoPlay 
              playsInline
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {videoRef.current?.srcObject && (
              <div className="camera-preview">
                <video ref={videoRef} autoPlay playsInline />
                <button className="capture-button" onClick={capturePhoto}>
                  📸 {t('capture')}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="details-step">
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" />
                <button 
                  className="change-photo"
                  onClick={() => {
                    setStep(1);
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                >
                  {t('changePhoto')}
                </button>
              </div>
            )}

            <div className="location-info">
              <span className="info-icon">📍</span>
              <div className="location-details">
                <strong>{t('locationDetected')}</strong>
                <p>{address || `${location?.lat}, ${location?.lng}`}</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('describeIssue')}</label>
              <textarea
                id="description"
                placeholder={t('describeIssueHint')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                maxLength="500"
              />
              <span className="character-count">
                {description.length}/500
              </span>
            </div>

            <button 
              className="next-button"
              onClick={() => setStep(3)}
              disabled={!description.trim()}
            >
              {t('next')} →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="submit-step">
            <div className="summary">
              <div className="summary-item">
                <span className="summary-label">📸 {t('photo')}:</span>
                <img src={photoPreview} alt="Report" className="summary-thumbnail" />
              </div>
              
              <div className="summary-item">
                <span className="summary-label">📝 {t('description')}:</span>
                <p>{description}</p>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">📍 {t('location')}:</span>
                <p>{address || `${location?.lat}, ${location?.lng}`}</p>
              </div>
            </div>

            <div className="submit-actions">
              <button 
                className="back-button"
                onClick={() => setStep(2)}
              >
                ← {t('back')}
              </button>
              
              <button 
                className="submit-button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? t('submitting') : t('submitReport')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
