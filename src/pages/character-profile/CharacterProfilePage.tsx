/**
 * CharacterProfilePage - Full character profile editor
 * Reuses Story Editor header and footer
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import HeaderBar from '../../components/header/HeaderBar';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import ConfirmationToast from '../../components/common/ConfirmationToast';
import Toast from '../../components/common/Toast';
import SectionCard from '../../components/character/SectionCard';
import TraitDotScale from '../../components/character/TraitDotScale';
import TraitSpectrum from '../../components/character/TraitSpectrum';
import TraitTogglePair from '../../components/character/TraitTogglePair';
import PhotoCropEditor from '../../components/character/PhotoCropEditor';
import storageManager from '../../engine/storage/StorageManager';
import CharacterProfileIconSvg from '../../assets/CharacterProfileIcon.svg';
import DeleteIconSvg from '../../assets/delete.svg';
import './CharacterProfilePage.css';

interface CharacterProfile {
  id: string;
  name: string;
  nickname: string;
  age: string;
  gender: string;
  role: string;
  species: string;
  imageUrl?: string;
  
  // Physical Presence (0-5 dots)
  height: number;
  strength: number;
  dexterity: number;
  health: number;
  energy: number;
  appearance: number;
  style: number;
  hygiene: number;
  
  // Psychological Profile (0-10 spectrum)
  calmAnxious: number;
  confidentDoubtful: number;
  patientRestless: number;
  rationalEmotional: number;
  optimisticCynical: number;
  
  // Inner Disposition
  introExtro: 'left' | 'right' | 'neutral';
  idealisticPragmatic: 'left' | 'right' | 'neutral';
  thoughtfulImpulsive: 'left' | 'right' | 'neutral';
  agreeableContrarian: 'left' | 'right' | 'neutral';
  pacifistConfrontational: 'left' | 'right' | 'neutral';
  optionalTraits: string[];
  
  // Emotional Landscape (0-5 dots)
  happiness: number;
  anxiety: number;
  passion: number;
  humor: number;
  spirituality: number;
  
  // Social Presence
  charisma: number;
  empathy: number;
  generosity: number;
  socialPower: number;
  honestDeceptive: 'left' | 'right' | 'neutral';
  politeRude: 'left' | 'right' | 'neutral';
  leaderFollower: 'left' | 'right' | 'neutral';
  forgivingVindictive: 'left' | 'right' | 'neutral';
  gullibleGuarded: 'left' | 'right' | 'neutral';
  playfulIntimidating: 'left' | 'right' | 'neutral';
  
  // Core Beliefs (0-5 dots)
  higherPower: number;
  fateDestiny: number;
  goodEvil: number;
  love: number;
  luck: number;
  meaning: number;
  
  // Values & Priorities (0-5 dots)
  family: number;
  friends: number;
  romance: number;
  home: number;
  healthValue: number;
  justice: number;
  truth: number;
  power: number;
  fame: number;
  wealth: number;
  othersOpinions: number;
  
  // Writer Notes
  notes: string;
}

const DEFAULT_PROFILE: Omit<CharacterProfile, 'id' | 'name'> = {
  nickname: '',
  age: '',
  gender: '',
  role: '',
  species: '',
  height: 0,
  strength: 0,
  dexterity: 0,
  health: 0,
  energy: 0,
  appearance: 0,
  style: 0,
  hygiene: 0,
  calmAnxious: 5,
  confidentDoubtful: 5,
  patientRestless: 5,
  rationalEmotional: 5,
  optimisticCynical: 5,
  introExtro: 'neutral',
  idealisticPragmatic: 'neutral',
  thoughtfulImpulsive: 'neutral',
  agreeableContrarian: 'neutral',
  pacifistConfrontational: 'neutral',
  optionalTraits: [],
  happiness: 0,
  anxiety: 0,
  passion: 0,
  humor: 0,
  spirituality: 0,
  charisma: 0,
  empathy: 0,
  generosity: 0,
  socialPower: 0,
  honestDeceptive: 'neutral',
  politeRude: 'neutral',
  leaderFollower: 'neutral',
  forgivingVindictive: 'neutral',
  gullibleGuarded: 'neutral',
  playfulIntimidating: 'neutral',
  higherPower: 0,
  fateDestiny: 0,
  goodEvil: 0,
  love: 0,
  luck: 0,
  meaning: 0,
  family: 0,
  friends: 0,
  romance: 0,
  home: 0,
  healthValue: 0,
  justice: 0,
  truth: 0,
  power: 0,
  fame: 0,
  wealth: 0,
  othersOpinions: 0,
  notes: ''
};

export default function CharacterProfilePage() {
  const { characterId, storyId: urlStoryId } = useParams<{ characterId: string; storyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  
  // Get storyId from URL params, navigation state, or localStorage fallback
  const storyId = urlStoryId || 
    (location.state as { storyId?: string })?.storyId || 
    localStorage.getItem('lastStoryId') || 
    '1';
  
  // Get the return path from navigation state, default to home
  const returnTo = (location.state as { returnTo?: string })?.returnTo || '/home';
  
  const [profile, setProfile] = useState<CharacterProfile>(() => {
    // Try to load existing profile, or create new one
    console.log('[CharacterProfilePage] Initializing profile for characterId:', characterId);
    if (characterId) {
      const loadedProfile = storageManager.loadCharacterProfile(storyId, characterId);
      if (loadedProfile) {
        console.log('[CharacterProfilePage] Loaded existing profile, imageUrl:', loadedProfile.imageUrl ? 'Present' : 'None');
        return loadedProfile;
      }
    }
    console.log('[CharacterProfilePage] Creating new profile');
    return {
      ...DEFAULT_PROFILE,
      id: characterId || `temp-${Math.random()}`,
      name: ''
    };
  });
  
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCharacterConfirm, setShowDeleteCharacterConfirm] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Debug: Monitor imageUrl changes
  useEffect(() => {
    console.log('[CharacterProfilePage] Profile imageUrl changed:', profile.imageUrl ? 'Present' : 'None');
  }, [profile.imageUrl]);
  
  // Debug: Monitor name changes
  useEffect(() => {
    console.log('[CharacterProfilePage] Profile name changed:', profile.name);
  }, [profile.name]);

  // Helper to save character to both localStorage and Firestore
  const saveCharacterProfile = async (updatedProfile: CharacterProfile) => {
    // Save to localStorage
    storageManager.saveCharacterProfile(storyId, updatedProfile.id, updatedProfile);
    
    // Save to Firestore
    try {
      // Load all characters, update the current one, and save back
      const { loadCharacters, saveCharacters } = await import('../../firebase/services/storiesService');
      const allCharacters = await loadCharacters(storyId);
      
      // Convert CharacterProfile to Character format for Firestore
      // Remove undefined values - Firestore doesn't accept them
      const firestoreCharacter: any = {
        characterId: updatedProfile.id,
        name: updatedProfile.name || '',
        initials: (updatedProfile.name || '').substring(0, 2).toUpperCase(),
        order: allCharacters.length
      };
      
      // Only add avatar if it exists
      if (updatedProfile.imageUrl) {
        firestoreCharacter.avatar = updatedProfile.imageUrl;
      }
      
      const characterIndex = allCharacters.findIndex(c => c.characterId === updatedProfile.id);
      
      if (characterIndex >= 0) {
        // Update existing character
        allCharacters[characterIndex] = firestoreCharacter;
      } else {
        // Add new character
        allCharacters.push(firestoreCharacter);
      }
      
      await saveCharacters(storyId, allCharacters);
      console.log('[CharacterProfilePage] ✅ Character saved to Firestore');
    } catch (error) {
      console.error('[CharacterProfilePage] ❌ Failed to save to Firestore:', error);
    }
    
    setSaveMessage('Character saved');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const updateProfile = <K extends keyof CharacterProfile>(
    key: K,
    value: CharacterProfile[K]
  ) => {
    setProfile(prev => {
      const updated = { ...prev, [key]: value };
      // Save the updated profile immediately (not stale state)
      setTimeout(() => {
        console.log('[CharacterProfilePage] Saving profile update:', key, '=', typeof value === 'string' ? value : '[non-string]');
        saveCharacterProfile(updated);
      }, 300); // Debounce for 300ms
      return updated;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
    }
    // Reset input to allow re-selecting same file
    event.target.value = '';
  };

  const handleSaveOptimizedImage = (optimizedImageData: string) => {
    console.log('[CharacterProfilePage] Saving optimized image, length:', optimizedImageData.length);
    setProfile(prev => {
      const updated = { ...prev, imageUrl: optimizedImageData };
      // Save immediately with the updated profile
      setTimeout(() => {
        console.log('[CharacterProfilePage] Saving profile with new avatar');
        saveCharacterProfile(updated);
      }, 100);
      return updated;
    });
    setSelectedImageFile(null);
  };

  const handleCancelCrop = () => {
    setSelectedImageFile(null);
  };

  const handleDeletePhoto = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeletePhoto = () => {
    console.log('[CharacterProfilePage] Deleting avatar');
    setProfile(prev => {
      const updated = { ...prev, imageUrl: undefined };
      // Save immediately with the updated profile
      setTimeout(() => {
        console.log('[CharacterProfilePage] Saving profile with deleted avatar');
        saveCharacterProfile(updated);
      }, 100);
      return updated;
    });
    setShowDeleteConfirm(false);
  };

  const cancelDeletePhoto = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteCharacter = () => {
    if (!characterId) return;
    setShowDeleteCharacterConfirm(true);
  };

  const confirmDeleteCharacter = () => {
    if (!characterId) return;
    
    try {
      storageManager.deleteCharacterProfile(storyId, characterId);
      setShowDeleteCharacterConfirm(false);
      navigate(returnTo);
    } catch (error) {
      console.error('Failed to delete character:', error);
      setShowDeleteCharacterConfirm(false);
      setErrorMessage('Failed to delete character. Please try again.');
      setShowErrorToast(true);
    }
  };

  const cancelDeleteCharacter = () => {
    setShowDeleteCharacterConfirm(false);
  };

  const handleBack = () => {
    navigate(returnTo);
  };

  return (
    <div className="character-profile-page">
      {/* HEADER - Always show Storyverse logo */}
      <HeaderBar />

      {/* Action Buttons - Back and Delete */}
      <div className="character-actions">
        <button 
          className="back-button"
          onClick={handleBack}
          aria-label="Back to story editor"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back to Story Editor
        </button>
        <button 
          className="delete-character-button"
          onClick={handleDeleteCharacter}
          aria-label="Delete character"
        >
          <img src={DeleteIconSvg} alt="" width="14" height="14" />
          Delete Character
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <main className="character-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="character-image-card">
            {profile.imageUrl ? (
              <img 
                src={profile.imageUrl} 
                alt={profile.name} 
                className="character-image"
                onClick={() => document.getElementById('character-image-upload')?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('character-image-upload')?.click();
                  }
                }}
                aria-label="Change character photo"
              />
            ) : (
              <img 
                src={CharacterProfileIconSvg} 
                alt="Character profile placeholder" 
                className="character-placeholder-icon" 
              />
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="character-image-upload"
          />
          
          {profile.imageUrl ? (
            <>
              <button 
                className="avatar-action-button delete-button"
                onClick={handleDeletePhoto}
              >
                Delete photo
              </button>
              
              {showDeleteConfirm && (
                <div className="delete-confirm-overlay" onClick={cancelDeletePhoto}>
                  <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
                    <h3>Delete Photo?</h3>
                    <p>This will permanently remove the character's photo.</p>
                    <div className="confirm-actions">
                      <button 
                        className="cancel-button"
                        onClick={cancelDeletePhoto}
                      >
                        Cancel
                      </button>
                      <button 
                        className="confirm-delete-button"
                        onClick={confirmDeletePhoto}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button 
              className="avatar-action-button upload-button"
              onClick={() => document.getElementById('character-image-upload')?.click()}
            >
              Upload photo
            </button>
          )}
          
          <div className="identity-fields">
            <div className="field">
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                placeholder="What is this character's name?"
              />
            </div>
            <div className="field">
              <input
                type="text"
                value={profile.nickname}
                onChange={(e) => updateProfile('nickname', e.target.value)}
                placeholder="Does this character go by any other names?"
              />
            </div>
            <div className="field">
              <input
                type="text"
                value={profile.age}
                onChange={(e) => updateProfile('age', e.target.value)}
                placeholder="How old is this character?"
              />
            </div>
            <div className="field">
              <input
                type="text"
                value={profile.gender}
                onChange={(e) => updateProfile('gender', e.target.value)}
                placeholder="How does this character identify?"
              />
            </div>
            <div className="field">
              <input
                type="text"
                value={profile.role}
                onChange={(e) => updateProfile('role', e.target.value)}
                placeholder="What is this character's role or occupation?"
              />
            </div>
            <div className="field">
              <input
                type="text"
                value={profile.species}
                onChange={(e) => updateProfile('species', e.target.value)}
                placeholder="What is this character's background or origin?"
              />
            </div>
          </div>
        </section>

        {/* Writer Notes */}
        <SectionCard title="Writer Notes">
          <textarea
            className="writer-notes"
            value={profile.notes}
            onChange={(e) => updateProfile('notes', e.target.value)}
            placeholder="What do you want to remember about this character?"
            rows={6}
            readOnly={!isOnline}
            style={!isOnline ? { cursor: 'not-allowed', opacity: 0.6 } : undefined}
          />
          <div className="footer-note">Linked to this story only</div>
        </SectionCard>

        {/* Physical Presence */}
        <SectionCard title="Physical Presence">
          <TraitDotScale label="Height" value={profile.height} onChange={(v) => updateProfile('height', v)} />
          <TraitDotScale label="Strength" value={profile.strength} onChange={(v) => updateProfile('strength', v)} />
          <TraitDotScale label="Dexterity" value={profile.dexterity} onChange={(v) => updateProfile('dexterity', v)} />
          <TraitDotScale label="Health" value={profile.health} onChange={(v) => updateProfile('health', v)} />
          <TraitDotScale label="Energy" value={profile.energy} onChange={(v) => updateProfile('energy', v)} />
          <TraitDotScale label="Appearance" value={profile.appearance} onChange={(v) => updateProfile('appearance', v)} />
          <TraitDotScale label="Style" value={profile.style} onChange={(v) => updateProfile('style', v)} />
          <TraitDotScale label="Hygiene" value={profile.hygiene} onChange={(v) => updateProfile('hygiene', v)} />
        </SectionCard>

        {/* Psychological Profile */}
        <SectionCard title="Psychological Profile">
          <TraitSpectrum 
            leftLabel="Calm" 
            rightLabel="Anxious" 
            value={profile.calmAnxious} 
            onChange={(v) => updateProfile('calmAnxious', v)} 
          />
          <TraitSpectrum 
            leftLabel="Confident" 
            rightLabel="Self-doubting" 
            value={profile.confidentDoubtful} 
            onChange={(v) => updateProfile('confidentDoubtful', v)} 
          />
          <TraitSpectrum 
            leftLabel="Patient" 
            rightLabel="Restless" 
            value={profile.patientRestless} 
            onChange={(v) => updateProfile('patientRestless', v)} 
          />
          <TraitSpectrum 
            leftLabel="Rational" 
            rightLabel="Emotional" 
            value={profile.rationalEmotional} 
            onChange={(v) => updateProfile('rationalEmotional', v)} 
          />
          <TraitSpectrum 
            leftLabel="Optimistic" 
            rightLabel="Cynical" 
            value={profile.optimisticCynical} 
            onChange={(v) => updateProfile('optimisticCynical', v)} 
          />
        </SectionCard>

        {/* Inner Disposition */}
        <SectionCard title="Inner Disposition">
          <div style={{ marginBottom: '16px' }}>
            <TraitTogglePair 
              leftLabel="Introverted" 
              rightLabel="Extroverted" 
              value={profile.introExtro} 
              onChange={(v) => updateProfile('introExtro', v)} 
            />
            <TraitTogglePair 
              leftLabel="Idealistic" 
              rightLabel="Pragmatic" 
              value={profile.idealisticPragmatic} 
              onChange={(v) => updateProfile('idealisticPragmatic', v)} 
            />
            <TraitTogglePair 
              leftLabel="Thoughtful" 
              rightLabel="Impulsive" 
              value={profile.thoughtfulImpulsive} 
              onChange={(v) => updateProfile('thoughtfulImpulsive', v)} 
            />
            <TraitTogglePair 
              leftLabel="Agreeable" 
              rightLabel="Contrarian" 
              value={profile.agreeableContrarian} 
              onChange={(v) => updateProfile('agreeableContrarian', v)} 
            />
            <TraitTogglePair 
              leftLabel="Pacifist" 
              rightLabel="Confrontational" 
              value={profile.pacifistConfrontational} 
              onChange={(v) => updateProfile('pacifistConfrontational', v)} 
            />
          </div>
          <div className="trait-checkboxes">
            <div className="checkbox-question">Select all traits that apply</div>
            <div className="checkbox-wrapper">
              {['Ambitious', 'Decisive', 'Stubborn', 'Perfectionist', 'Possessive', 'Jealous'].map(trait => (
                <label key={trait} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={profile.optionalTraits.includes(trait)}
                    onChange={(e) => {
                      const newTraits = e.target.checked
                        ? [...profile.optionalTraits, trait]
                        : profile.optionalTraits.filter(t => t !== trait);
                      updateProfile('optionalTraits', newTraits);
                    }}
                  />
                  <span>{trait}</span>
                </label>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Emotional Landscape */}
        <SectionCard title="Emotional Landscape">
          <TraitDotScale label="Happiness" value={profile.happiness} onChange={(v) => updateProfile('happiness', v)} />
          <TraitDotScale label="Anxiety" value={profile.anxiety} onChange={(v) => updateProfile('anxiety', v)} />
          <TraitDotScale label="Passion" value={profile.passion} onChange={(v) => updateProfile('passion', v)} />
          <TraitDotScale label="Humor" value={profile.humor} onChange={(v) => updateProfile('humor', v)} />
          <TraitDotScale label="Spirituality" value={profile.spirituality} onChange={(v) => updateProfile('spirituality', v)} />
        </SectionCard>

        {/* Social Presence */}
        <SectionCard title="Social Presence">
          <TraitDotScale label="Charisma" value={profile.charisma} onChange={(v) => updateProfile('charisma', v)} />
          <TraitDotScale label="Empathy" value={profile.empathy} onChange={(v) => updateProfile('empathy', v)} />
          <TraitDotScale label="Generosity" value={profile.generosity} onChange={(v) => updateProfile('generosity', v)} />
          <TraitDotScale label="Social Power" value={profile.socialPower} onChange={(v) => updateProfile('socialPower', v)} />
          <div style={{ marginTop: '16px' }}>
            <TraitTogglePair 
              leftLabel="Honest" 
              rightLabel="Deceptive" 
              value={profile.honestDeceptive} 
              onChange={(v) => updateProfile('honestDeceptive', v)} 
            />
            <TraitTogglePair 
              leftLabel="Polite" 
              rightLabel="Rude" 
              value={profile.politeRude} 
              onChange={(v) => updateProfile('politeRude', v)} 
            />
            <TraitTogglePair 
              leftLabel="Leader" 
              rightLabel="Follower" 
              value={profile.leaderFollower} 
              onChange={(v) => updateProfile('leaderFollower', v)} 
            />
            <TraitTogglePair 
              leftLabel="Forgiving" 
              rightLabel="Vindictive" 
              value={profile.forgivingVindictive} 
              onChange={(v) => updateProfile('forgivingVindictive', v)} 
            />
            <TraitTogglePair 
              leftLabel="Gullible" 
              rightLabel="Guarded" 
              value={profile.gullibleGuarded} 
              onChange={(v) => updateProfile('gullibleGuarded', v)} 
            />
            <TraitTogglePair 
              leftLabel="Playful" 
              rightLabel="Intimidating" 
              value={profile.playfulIntimidating} 
              onChange={(v) => updateProfile('playfulIntimidating', v)} 
            />
          </div>
        </SectionCard>

        {/* Core Beliefs */}
        <SectionCard title="Core Beliefs">
          <TraitDotScale label="Higher power" value={profile.higherPower} onChange={(v) => updateProfile('higherPower', v)} />
          <TraitDotScale label="Fate / destiny" value={profile.fateDestiny} onChange={(v) => updateProfile('fateDestiny', v)} />
          <TraitDotScale label="Good & evil" value={profile.goodEvil} onChange={(v) => updateProfile('goodEvil', v)} />
          <TraitDotScale label="Love" value={profile.love} onChange={(v) => updateProfile('love', v)} />
          <TraitDotScale label="Luck" value={profile.luck} onChange={(v) => updateProfile('luck', v)} />
          <TraitDotScale label="Meaning" value={profile.meaning} onChange={(v) => updateProfile('meaning', v)} />
        </SectionCard>

        {/* Values & Priorities */}
        <SectionCard title="Values & Priorities">
          <TraitDotScale label="Family" value={profile.family} onChange={(v) => updateProfile('family', v)} />
          <TraitDotScale label="Friends" value={profile.friends} onChange={(v) => updateProfile('friends', v)} />
          <TraitDotScale label="Love" value={profile.romance} onChange={(v) => updateProfile('romance', v)} />
          <TraitDotScale label="Home" value={profile.home} onChange={(v) => updateProfile('home', v)} />
          <TraitDotScale label="Health" value={profile.healthValue} onChange={(v) => updateProfile('healthValue', v)} />
          <TraitDotScale label="Justice" value={profile.justice} onChange={(v) => updateProfile('justice', v)} />
          <TraitDotScale label="Truth" value={profile.truth} onChange={(v) => updateProfile('truth', v)} />
          <TraitDotScale label="Power" value={profile.power} onChange={(v) => updateProfile('power', v)} />
          <TraitDotScale label="Fame" value={profile.fame} onChange={(v) => updateProfile('fame', v)} />
          <TraitDotScale label="Wealth" value={profile.wealth} onChange={(v) => updateProfile('wealth', v)} />
          <TraitDotScale label="Others' opinions" value={profile.othersOpinions} onChange={(v) => updateProfile('othersOpinions', v)} />
        </SectionCard>

        {/* Save Message */}
        {saveMessage && (
          <div className="save-message">{saveMessage}</div>
        )}
      </main>

      {/* FOOTER */}
      <BottomNavigation activeTab="write" />

      {/* PHOTO CROP EDITOR */}
      {selectedImageFile && (
        <PhotoCropEditor
          imageFile={selectedImageFile}
          onSave={handleSaveOptimizedImage}
          onCancel={handleCancelCrop}
        />
      )}

      {/* DELETE CHARACTER CONFIRMATION */}
      <ConfirmationToast
        show={showDeleteCharacterConfirm}
        title={`Delete "${profile.name || 'this character'}"?`}
        message="This will permanently remove this character and all their profile data. This cannot be undone."
        onConfirm={confirmDeleteCharacter}
        onCancel={cancelDeleteCharacter}
        confirmText="OK"
        cancelText="Cancel"
      />

      {/* ERROR TOAST */}
      <Toast
        show={showErrorToast}
        message={errorMessage}
        type="error"
        onClose={() => setShowErrorToast(false)}
        duration={4000}
      />
    </div>
  );
}
