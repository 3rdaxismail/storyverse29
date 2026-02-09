/**
 * LocationSection - Compact text-based location chips
 * Small pill-style chips showing INT/EXT + location name
 * Expandable/collapsible with chevron control
 */
import { useState, useRef, useEffect } from 'react';
import styles from './LocationSection.module.css';

export interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT';
  description?: string;
  image?: string;
  createdAt: number;
}

interface LocationSectionProps {
  locations?: Location[];
  onAddLocation?: (location: Location) => void;
  onUpdateLocation?: (locationId: string, updates: Partial<Location>) => void;
  onDeleteLocation?: (locationId: string) => void;
}

type CardMode = 'add' | 'actions' | 'rename' | 'confirm-delete' | null;

export default function LocationSection({
  locations = [],
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation
}: LocationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardMode, setCardMode] = useState<CardMode>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationType, setLocationType] = useState<'INT' | 'EXT'>('INT');
  const [locationName, setLocationName] = useState('');
  const locationListRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check if content actually overflows in collapsed state
  useEffect(() => {
    const checkOverflow = () => {
      if (locationListRef.current && !isExpanded) {
        // Check if scrollHeight exceeds the collapsed max-height (24px)
        const isOverflowing = locationListRef.current.scrollHeight > 24;
        setHasOverflow(isOverflowing);
      }
    };

    checkOverflow();
    // Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [locations, isExpanded]);

  const handleAddClick = () => {
    setLocationType('INT');
    setLocationName('');
    setCardMode('add');
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setCardMode('actions');
  };

  const handleRenameClick = () => {
    if (selectedLocation) {
      setLocationType(selectedLocation.type || 'INT');
      setLocationName(selectedLocation.name);
      setCardMode('rename');
    }
  };

  const handleRemoveClick = () => {
    if (selectedLocation) {
      setCardMode('confirm-delete');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedLocation) {
      onDeleteLocation?.(selectedLocation.id);
      closeCard();
    }
  };

  const closeCard = () => {
    setCardMode(null);
    setSelectedLocation(null);
    setLocationType('INT');
    setLocationName('');
  };

  const handleAddLocation = () => {
    const trimmedName = locationName.trim();
    
    // Validation
    if (!trimmedName) {
      return; // Input will show validation via required field
    }

    // Check for duplicates (case-insensitive)
    const duplicate = locations.find(
      loc => loc.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      return; // Can add visual feedback later if needed
    }

    const newLocation: Location = {
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      type: locationType,
      createdAt: Date.now()
    };

    onAddLocation?.(newLocation);
    closeCard();
  };

  const handleSaveRename = () => {
    if (!selectedLocation) return;

    const trimmedName = locationName.trim();
    
    // Validation
    if (!trimmedName) {
      return; // Input validation handles this
    }

    // Check for duplicates (case-insensitive), excluding current location
    const duplicate = locations.find(
      loc => loc.id !== selectedLocation.id && 
             loc.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      return; // Can add visual feedback later
    }

    onUpdateLocation?.(selectedLocation.id, {
      name: trimmedName,
      type: locationType
    });
    closeCard();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className={styles.locationSection}>
      {/* Header with expand/collapse control */}
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Locations</h3>
        {locations.length > 0 && (
          <button
            className={`${styles.expandButton} ${hasOverflow ? styles.hasContent : styles.noContent}`}
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse locations' : 'Expand locations'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={isExpanded ? styles.chevronUp : styles.chevronDown}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Location chips */}
      <div 
        ref={locationListRef}
        className={`${styles.locationList} ${isExpanded ? styles.expanded : styles.collapsed}`}
      >
        {/* Add Location Button - FIRST POSITION */}
        <button
          className={styles.addChip}
          onClick={handleAddClick}
          aria-label="Add location"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Reverse order: newest first */}
        {[...locations].reverse().map((location) => (
          <button
            key={location.id}
            className={styles.locationChip}
            onClick={() => handleLocationClick(location)}
            aria-label={`Select ${location.name}`}
          >
            <span className={styles.locationType}>{location.type || 'INT'}</span>
            <span className={styles.locationName}>{location.name}</span>
          </button>
        ))}
      </div>

      {/* Floating Cards */}
      {cardMode && (
        <>
          <div className={styles.overlay} onClick={closeCard} />
          
          {/* Action Card - Choose rename or remove */}
          {cardMode === 'actions' && selectedLocation && (
            <div className={styles.floatingCard}>
              <h4 className={styles.cardTitle}>Location options</h4>
              
              <div className={styles.actionList}>
                <button
                  className={styles.actionButton}
                  onClick={handleRenameClick}
                >
                  Rename location
                </button>
                <button
                  className={styles.actionButton}
                  onClick={handleRemoveClick}
                >
                  Remove location
                </button>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.cancelButton}
                  onClick={closeCard}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add Location Card */}
          {cardMode === 'add' && (
            <div className={styles.floatingCard}>
            <h4 className={styles.cardTitle}>Add Location</h4>
            
            {/* Location Type */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Location Type *</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="INT"
                    checked={locationType === 'INT'}
                    onChange={(e) => setLocationType(e.target.value as 'INT' | 'EXT')}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>INT</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="EXT"
                    checked={locationType === 'EXT'}
                    onChange={(e) => setLocationType(e.target.value as 'INT' | 'EXT')}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>EXT</span>
                </label>
              </div>
            </div>

            {/* Location Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Location Name *</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., TRAIN – NIGHT"
                className={styles.textInput}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className={styles.cardActions}>
              <button
                className={styles.cancelButton}
                onClick={closeCard}
              >
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleAddLocation}
              >
                Add Location
              </button>
            </div>
          </div>
          )}

          {/* Rename Location Card */}
          {cardMode === 'rename' && selectedLocation && (
            <div className={styles.floatingCard}>
              <h4 className={styles.cardTitle}>Rename Location</h4>
              
              {/* Location Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Location Type *</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="INT"
                      checked={locationType === 'INT'}
                      onChange={(e) => setLocationType(e.target.value as 'INT' | 'EXT')}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>INT</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="EXT"
                      checked={locationType === 'EXT'}
                      onChange={(e) => setLocationType(e.target.value as 'INT' | 'EXT')}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>EXT</span>
                  </label>
                </div>
              </div>

              {/* Location Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Location Name *</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., TRAIN – NIGHT"
                  className={styles.textInput}
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <button
                  className={styles.cancelButton}
                  onClick={closeCard}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleSaveRename}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Confirm Delete Card */}
          {cardMode === 'confirm-delete' && selectedLocation && (
            <div className={styles.floatingCard}>
              <h4 className={styles.cardTitle}>Remove Location</h4>
              
              <p className={styles.confirmMessage}>
                Remove "{selectedLocation.name}" from the story?
              </p>

              <div className={styles.cardActions}>
                <button
                  className={styles.cancelButton}
                  onClick={closeCard}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleConfirmDelete}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
