import React, { useState, useRef } from 'react';
import ScreenLayout from '../ScreenLayout';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import PhotoCropEditor from '../../components/character/PhotoCropEditor';
import { useAuth } from '../../firebase/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { syncAuthorNameAcrossContent } from '../../firebase/services/syncAuthorName';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);

  // Update local state when userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImageFile(file);
    }
  };

  const handleSaveOptimizedImage = async (optimizedImageData: string) => {
    if (!user) return;

    setSaving(true);
    try {
      // Convert base64 to blob
      const response = await fetch(optimizedImageData);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profilePhotos/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: photoURL
      });

      // Refresh profile
      await refreshUserProfile();
      setSelectedImageFile(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCrop = () => {
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFieldChange = async (field: 'displayName' | 'bio', value: string) => {
    if (!user) return;

    // Update local state immediately for responsiveness
    if (field === 'displayName') {
      setDisplayName(value);
    } else {
      setBio(value);
    }

    // Debounced save to Firestore (auto-save)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [field]: value
      });
      
      // If display name changed, sync it across all stories and poems
      if (field === 'displayName' && value.trim()) {
        console.log('[ProfilePage] Display name changed, syncing across content...');
        syncAuthorNameAcrossContent(user.uid, value).then((result) => {
          console.log('[ProfilePage] ✅ Author name synced:', result);
        }).catch((error) => {
          console.error('[ProfilePage] ❌ Failed to sync author name:', error);
        });
      }
      
      await refreshUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <ScreenLayout>
      <div className={styles.container}>
        <div className={styles.content}>
          <Card>
            <div className={styles.profileCard}>
              {/* Profile Avatar */}
              <div className={styles.avatarSection}>
                <button 
                  className={styles.avatarButton}
                  onClick={handleAvatarClick}
                  aria-label="Upload profile picture"
                >
                  <div className={styles.avatarWrapper}>
                    <div className={styles.avatarRing} />
                    <div className={styles.avatarContainer}>
                      {userProfile?.photoURL ? (
                        <img 
                          src={userProfile.photoURL} 
                          alt="Profile" 
                          className={styles.avatarPhoto}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="22" r="10" fill="rgba(165, 183, 133, 1)" />
                            <path d="M12 52C12 42 19 36 30 36C41 36 48 42 48 52" fill="rgba(165, 183, 133, 1)"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                <button 
                  className={styles.uploadText}
                  onClick={handleAvatarClick}
                  disabled={saving}
                >
                  {saving ? 'Uploading...' : 'Upload Photo'}
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>

              {/* Writer Identity */}
              <div className={styles.identity}>
                <input
                  type="text"
                  className={styles.displayName}
                  placeholder="Your Pen Name"
                  value={displayName}
                  onChange={(e) => handleFieldChange('displayName', e.target.value)}
                />
              </div>

              {/* Writer Bio */}
              <div className={styles.bioCard}>
                <textarea
                  className={styles.bioInput}
                  placeholder="What themes, genres, or ideas excite you as a writer?"
                  value={bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
      <BottomNavigation />
      
      {/* Photo Crop Editor */}
      {selectedImageFile && (
        <PhotoCropEditor
          imageFile={selectedImageFile}
          onSave={handleSaveOptimizedImage}
          onCancel={handleCancelCrop}
        />
      )}
    </ScreenLayout>
  );
}
