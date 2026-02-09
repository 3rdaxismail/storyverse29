/**
 * ChapterLocations - Location selector for chapter-level assignments
 * Displays selected locations and allows adding from story-level location pool
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChapterLocations.module.css';

interface Location {
  id: string;
  name: string;
  type: 'INT' | 'EXT';
}

interface ChapterLocationsProps {
  selectedLocationIds: string[];
  availableLocations: Location[];
  onAddLocation: (locationId: string) => void;
  onRemoveLocation: (locationId: string) => void;
  onCreateNewLocation: (name: string, type: 'INT' | 'EXT') => void;
}

export default function ChapterLocations({
  selectedLocationIds,
  availableLocations,
  onAddLocation,
  onRemoveLocation,
  onCreateNewLocation
}: ChapterLocationsProps) {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [locationType, setLocationType] = useState<'INT' | 'EXT'>('INT');
  const [locationName, setLocationName] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get selected location objects
  const selectedLocations = availableLocations.filter(loc =>
    selectedLocationIds.includes(loc.id)
  );

  // Get unselected locations for selection
  const unselectedLocations = availableLocations.filter(loc =>
    !selectedLocationIds.includes(loc.id)
  );

  const resetForm = useCallback(() => {
    setLocationName('');
    setLocationType('INT');
    setSelectedToAdd([]);
  }, []);

  // Close card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsCardOpen(false);
        resetForm();
      }
    };

    if (isCardOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCardOpen, resetForm]);

  const handleAddClick = () => {
    setIsCardOpen(true);
  };

  const handleCancel = () => {
    setIsCardOpen(false);
    resetForm();
  };

  const handleToggleSelection = (locationId: string) => {
    setSelectedToAdd(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleAddSelectedLocations = () => {
    console.log('[ChapterLocations] Add Selected Locations clicked:', selectedToAdd);
    
    if (selectedToAdd.length === 0) {
      console.log('[ChapterLocations] ❌ No locations selected, aborting');
      return;
    }

    // Add all selected locations to chapter
    selectedToAdd.forEach(locationId => {
      onAddLocation(locationId);
    });

    setIsCardOpen(false);
    resetForm();
    console.log('[ChapterLocations] ✅ Selected locations added, card closed');
  };

  const handleCreateAndAddLocation = () => {
    console.log('[ChapterLocations] Create & Add Location clicked');
    
    if (!locationName.trim()) {
      console.log('[ChapterLocations] ❌ Location name is empty, aborting');
      return;
    }

    // Check if location already exists
    const existingLocation = availableLocations.find(
      loc => loc.name.toLowerCase() === locationName.trim().toLowerCase() && loc.type === locationType
    );

    if (existingLocation) {
      console.log('[ChapterLocations] Location exists, adding existing:', existingLocation.id);
      // Add existing location to chapter
      onAddLocation(existingLocation.id);
    } else {
      console.log('[ChapterLocations] Creating new location:', { name: locationName.trim(), type: locationType });
      // Create new location and add to chapter
      onCreateNewLocation(locationName.trim(), locationType);
    }

    setIsCardOpen(false);
    resetForm();
    console.log('[ChapterLocations] ✅ Create & Add complete, card closed');
  };

  return (
    <div className={styles.chapterLocations}>
      <div className={styles.locationList}>
        {selectedLocations.map((location) => (
          <div key={location.id} className={styles.locationChip}>
            <span className={styles.locationText}>
              {location.type} {location.name}
            </span>
            <button
              className={styles.removeButton}
              onClick={() => onRemoveLocation(location.id)}
              aria-label={`Remove ${location.name}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add Location Button */}
        <div className={styles.addButtonWrapper} ref={cardRef}>
          <button
            className={styles.addButton}
            onClick={handleAddClick}
            aria-label="Add location to chapter"
          >
            +
          </button>

          {/* Floating Add Location Card */}
          {isCardOpen && (
            <div className={styles.floatingCard}>
              <h6 className={styles.cardTitle}>Add Location</h6>

              {/* Existing Locations Quick Select */}
              {unselectedLocations.length > 0 && (
                <div className={styles.quickSelect}>
                  <div className={styles.quickSelectLabel}>Select existing locations:</div>
                  <div className={styles.quickSelectList}>
                    {unselectedLocations.map((location) => (
                      <button
                        key={location.id}
                        className={`${styles.quickSelectChip} ${selectedToAdd.includes(location.id) ? styles.quickSelectChipSelected : ''}`}
                        onClick={() => handleToggleSelection(location.id)}
                      >
                        {location.type} {location.name}
                      </button>
                    ))}
                  </div>
                  <button
                    className={styles.addSelectedButton}
                    onClick={handleAddSelectedLocations}
                    disabled={selectedToAdd.length === 0}
                  >
                    Add Selected Locations ({selectedToAdd.length})
                  </button>
                  <div className={styles.divider}>or create new</div>
                </div>
              )}

              {/* Location Type */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location Type</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="locationType"
                      value="INT"
                      checked={locationType === 'INT'}
                      onChange={(e) => setLocationType(e.target.value as 'INT' | 'EXT')}
                      className={styles.radioInput}
                    />
                    <span>INT (Interior)</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="locationType"
                      value="EXT"
                      checked={locationType === 'EXT'}
                      onChange={(e) => setLocationType(e.target.value as 'INT' | 'EXT')}
                      className={styles.radioInput}
                    />
                    <span>EXT (Exterior)</span>
                  </label>
                </div>
              </div>

              {/* Location Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="locationName">
                  Location Name
                </label>
                <input
                  id="locationName"
                  type="text"
                  className={styles.textInput}
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Coffee Shop, City Street"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateAndAddLocation();
                    }
                  }}
                />
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className={styles.createLocationButton}
                  onClick={handleCreateAndAddLocation}
                  disabled={!locationName.trim()}
                >
                  Create & Add Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
