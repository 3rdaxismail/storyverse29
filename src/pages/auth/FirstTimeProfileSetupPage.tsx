/**
 * FirstTimeProfileSetupPage - Post-signup profile creation
 * Uses Firebase Firestore and Storage
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../firebase/AuthContext';
import { db, storage } from '../../firebase/config';
import brandLogo from '../../assets/frame-brand-logo.svg';
import PhotoCropEditor from '../../components/character/PhotoCropEditor';
import '../auth/auth.css';

/**
 * Convert an image URL to base64 data URL
 * This ensures Google photos are saved permanently
 */
async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    // Create a canvas to convert the image
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Try to avoid CORS issues
    
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize to max 400x400 for profile photos
        const maxSize = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          console.log('[ProfileSetup] Converted Google photo to base64');
          resolve(base64);
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.warn('[ProfileSetup] Failed to load Google photo for conversion');
        resolve(null);
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('[ProfileSetup] Error converting image:', error);
    return null;
  }
}

export default function FirstTimeProfileSetupPage() {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-populate with Google data if available
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [googlePhotoBase64, setGooglePhotoBase64] = useState<string | null>(null);

  // On mount, convert Google photo to base64 if available
  useEffect(() => {
    const convertGooglePhoto = async () => {
      if (user?.photoURL && !avatarPreview) {
        console.log('[ProfileSetup] Converting Google photo to base64...');
        const base64 = await convertImageToBase64(user.photoURL);
        if (base64) {
          setGooglePhotoBase64(base64);
          setAvatarPreview(base64); // Show it as preview
          console.log('[ProfileSetup] Google photo converted and set as preview');
        }
      }
    };
    convertGooglePhoto();
  }, [user?.photoURL]);

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, avatar: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, avatar: 'Image must be smaller than 5MB' });
      return;
    }

    // Show crop editor
    setSelectedImageFile(file);
    setShowCropEditor(true);
    setErrors({ ...errors, avatar: '' });
  };

  const handleSaveCroppedImage = (croppedImageData: string) => {
    setAvatarPreview(croppedImageData);
    // Convert base64 to File for upload
    fetch(croppedImageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        setAvatarFile(file);
      });
    setShowCropEditor(false);
    setSelectedImageFile(null);
  };

  const handleCancelCrop = () => {
    setShowCropEditor(false);
    setSelectedImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || !user) return;

    setLoading(true);
    try {
      console.log('Starting profile setup...');
      console.log('User:', user?.uid);
      console.log('Display name:', displayName);
      console.log('Bio:', bio);
      
      let photoURL: string | null = null;

      // Priority 1: User uploaded and cropped a custom photo
      if (avatarFile && avatarPreview) {
        console.log('[ProfileSetup] Using custom cropped photo (base64)');
        photoURL = avatarPreview;
      } 
      // Priority 2: Google photo converted to base64
      else if (googlePhotoBase64) {
        console.log('[ProfileSetup] Using Google photo converted to base64');
        photoURL = googlePhotoBase64;
      }
      // Priority 3: Avatar preview exists (could be from Google conversion)
      else if (avatarPreview) {
        console.log('[ProfileSetup] Using avatar preview (base64)');
        photoURL = avatarPreview;
      }
      // Note: We no longer use user.photoURL directly as it can expire

      // Update Firestore user document
      console.log('Updating Firestore...');
      const updateData: any = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        profileCompleted: true
      };
      
      // Only set photoURL if we have one
      if (photoURL) {
        updateData.photoURL = photoURL;
      }
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      console.log('Firestore updated successfully');

      // Force refresh user profile in context to get the latest data
      console.log('Refreshing user profile...');
      await refreshUserProfile();
      
      // Additional delay to ensure context state is updated
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Profile refreshed');

      // Navigate to home
      console.log('Navigating to /home');
      navigate('/home', { replace: true });
      
    } catch (error) {
      console.error('Profile setup error:', error);
      setErrors({ displayName: 'Failed to save profile. Please try again.' });
      setLoading(false);
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={brandLogo} alt="Storyverse" className="auth-logo" />
        
        <h1 className="auth-title">Create your profile</h1>
        <p className="auth-description">
          Tell other writers what you love to write about
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Profile photo (optional)</label>
            
            {/* Premium Avatar Section - Matches Public Profile */}
            <div className="auth-avatar-wrapper">
              {/* Animated Gradient Ring */}
              <div className="auth-animated-ring"></div>
              
              {/* Avatar Container */}
              <div 
                className="auth-avatar-container" 
                onClick={handleAvatarSelect}
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="auth-avatar-image"
                  />
                ) : (
                  <div className="auth-avatar-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(165, 183, 133, 1)" stroke="none">
                      <circle cx="12" cy="8" r="5"/>
                      <path d="M3 21c0-4 4-7 9-7s9 3 9 7"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {errors.avatar && <div className="auth-error">{errors.avatar}</div>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="displayName" className="auth-label">Display name or pen name</label>
            <input
              id="displayName"
              type="text"
              className="auth-input"
              placeholder="How should we call you?"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors({ ...errors, displayName: '' });
              }}
              autoFocus
            />
            {errors.displayName && <div className="auth-error">{errors.displayName}</div>}
          </div>

          <div className="auth-form-group">
            <label htmlFor="bio" className="auth-label">Short bio (optional)</label>
            <textarea
              id="bio"
              className="auth-textarea"
              placeholder="I write about..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
            />
            <div className="auth-char-count">
              {bio.length}/160
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={!displayName.trim() || loading}
          >
            {loading ? 'Setting up...' : 'Complete setup'}
          </button>
        </form>
      </div>

      {/* Photo Crop Editor */}
      {showCropEditor && selectedImageFile && (
        <PhotoCropEditor
          imageFile={selectedImageFile}
          onSave={handleSaveCroppedImage}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
}
