import { useMemo, useState } from 'react';
import { buildAIContextPayload } from '../services/ai/contextBuilder';
import type { AIContextChip, AIContextOption, AIContextPayload } from '../types/AIContext';

interface EntityItem {
  id: string;
  label: string;
}

interface UseContextSelectionParams {
  storyId: string;
  currentSceneId?: string;
  currentActId?: string;
  scenes: EntityItem[];
  characters: EntityItem[];
  locations: EntityItem[];
}

const TOGGLE_OPTIONS: AIContextOption[] = [
  { id: 'current-scene', label: 'Current Scene', type: 'toggle', group: 'Core' },
  { id: 'entire-act', label: 'Entire Act', type: 'toggle', group: 'Core' },
  { id: 'story-bible', label: 'Story Bible', type: 'toggle', group: 'Knowledge' },
  { id: 'characters', label: 'Characters', type: 'toggle', group: 'Knowledge' },
  { id: 'locations', label: 'Locations', type: 'toggle', group: 'Knowledge' },
  { id: 'timeline', label: 'Timeline', type: 'toggle', group: 'Knowledge' },
  { id: 'research-notes', label: 'Research Notes', type: 'toggle', group: 'Knowledge' },
  { id: 'themes', label: 'Themes', type: 'toggle', group: 'Knowledge' },
  { id: 'symbols', label: 'Symbols', type: 'toggle', group: 'Knowledge' },
  { id: 'motifs', label: 'Motifs', type: 'toggle', group: 'Knowledge' },
  { id: 'previous-scene', label: 'Previous Scene', type: 'toggle', group: 'Continuity' },
  { id: 'next-scene', label: 'Next Scene', type: 'toggle', group: 'Continuity' },
  { id: 'continuity-notes', label: 'Continuity Notes', type: 'toggle', group: 'Continuity' },
  { id: 'open-questions', label: 'Open Questions', type: 'toggle', group: 'Continuity' },
  { id: 'scene-metadata', label: 'Scene Metadata', type: 'toggle', group: 'Continuity' },
];

export function useContextSelection(params: UseContextSelectionParams) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToggleIds, setSelectedToggleIds] = useState<Set<string>>(new Set(['current-scene']));
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(new Set());
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());

  const sceneOptions = useMemo<AIContextOption[]>(
    () => params.scenes.map((scene) => ({ id: `scene:${scene.id}`, label: scene.label, type: 'scene', group: 'Specific Scenes' })),
    [params.scenes]
  );

  const characterOptions = useMemo<AIContextOption[]>(
    () => params.characters.map((character) => ({ id: `character:${character.id}`, label: character.label, type: 'character', group: 'Specific Characters' })),
    [params.characters]
  );

  const locationOptions = useMemo<AIContextOption[]>(
    () => params.locations.map((location) => ({ id: `location:${location.id}`, label: location.label, type: 'location', group: 'Specific Locations' })),
    [params.locations]
  );

  const allOptions = useMemo(
    () => [...TOGGLE_OPTIONS, ...sceneOptions, ...characterOptions, ...locationOptions],
    [sceneOptions, characterOptions, locationOptions]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;
    const search = searchQuery.toLowerCase();
    return allOptions.filter((option) => option.label.toLowerCase().includes(search) || option.group.toLowerCase().includes(search));
  }, [allOptions, searchQuery]);

  const isSelected = (optionId: string): boolean => {
    if (optionId.startsWith('scene:')) return selectedSceneIds.has(optionId.slice(6));
    if (optionId.startsWith('character:')) return selectedCharacterIds.has(optionId.slice(10));
    if (optionId.startsWith('location:')) return selectedLocationIds.has(optionId.slice(9));
    return selectedToggleIds.has(optionId);
  };

  const toggleOption = (optionId: string) => {
    if (optionId.startsWith('scene:')) {
      const id = optionId.slice(6);
      setSelectedSceneIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    if (optionId.startsWith('character:')) {
      const id = optionId.slice(10);
      setSelectedCharacterIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    if (optionId.startsWith('location:')) {
      const id = optionId.slice(9);
      setSelectedLocationIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    setSelectedToggleIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  };

  const contextChips = useMemo<AIContextChip[]>(() => {
    const chips: AIContextChip[] = [];

    TOGGLE_OPTIONS.forEach((option) => {
      if (selectedToggleIds.has(option.id)) {
        chips.push({ id: option.id, label: option.label });
      }
    });

    params.scenes.forEach((scene) => {
      if (selectedSceneIds.has(scene.id)) {
        chips.push({ id: `scene:${scene.id}`, label: scene.label });
      }
    });

    params.characters.forEach((character) => {
      if (selectedCharacterIds.has(character.id)) {
        chips.push({ id: `character:${character.id}`, label: character.label });
      }
    });

    params.locations.forEach((location) => {
      if (selectedLocationIds.has(location.id)) {
        chips.push({ id: `location:${location.id}`, label: location.label });
      }
    });

    return chips;
  }, [params.scenes, params.characters, params.locations, selectedToggleIds, selectedSceneIds, selectedCharacterIds, selectedLocationIds]);

  const removeChip = (chipId: string) => {
    if (chipId.startsWith('scene:')) {
      setSelectedSceneIds((prev) => {
        const next = new Set(prev);
        next.delete(chipId.slice(6));
        return next;
      });
      return;
    }

    if (chipId.startsWith('character:')) {
      setSelectedCharacterIds((prev) => {
        const next = new Set(prev);
        next.delete(chipId.slice(10));
        return next;
      });
      return;
    }

    if (chipId.startsWith('location:')) {
      setSelectedLocationIds((prev) => {
        const next = new Set(prev);
        next.delete(chipId.slice(9));
        return next;
      });
      return;
    }

    setSelectedToggleIds((prev) => {
      const next = new Set(prev);
      next.delete(chipId);
      return next;
    });
  };

  const buildContext = (): AIContextPayload => {
    return buildAIContextPayload({
      storyId: params.storyId,
      currentSceneId: params.currentSceneId,
      currentActId: params.currentActId,
      allSceneIds: params.scenes.map((scene) => scene.id),
      allCharacterIds: params.characters.map((character) => character.id),
      allLocationIds: params.locations.map((location) => location.id),
      selectedSceneIds: [...selectedSceneIds],
      selectedCharacterIds: [...selectedCharacterIds],
      selectedLocationIds: [...selectedLocationIds],
      includeCurrentScene: selectedToggleIds.has('current-scene'),
      includeEntireAct: selectedToggleIds.has('entire-act'),
      includeStoryBible: selectedToggleIds.has('story-bible'),
      includeCharacters: selectedToggleIds.has('characters'),
      includeLocations: selectedToggleIds.has('locations'),
      includeTimeline: selectedToggleIds.has('timeline'),
      includeResearchNotes: selectedToggleIds.has('research-notes'),
      includeThemes: selectedToggleIds.has('themes'),
      includeSymbols: selectedToggleIds.has('symbols'),
      includeMotifs: selectedToggleIds.has('motifs'),
      includePreviousScene: selectedToggleIds.has('previous-scene'),
      includeNextScene: selectedToggleIds.has('next-scene'),
      includeContinuityNotes: selectedToggleIds.has('continuity-notes'),
      includeOpenQuestions: selectedToggleIds.has('open-questions'),
      includeSceneMetadata: selectedToggleIds.has('scene-metadata'),
    });
  };

  return {
    isPickerOpen,
    setIsPickerOpen,
    searchQuery,
    setSearchQuery,
    filteredOptions,
    isSelected,
    toggleOption,
    contextChips,
    removeChip,
    buildContext,
  };
}
