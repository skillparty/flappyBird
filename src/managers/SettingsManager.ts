import StorageManager from './StorageManager';
import ErrorHandler from './ErrorHandler';

interface GameSettings {
  audioEnabled: boolean;
  audioVolume: number;
  selectedCharacter: string;
  showParticles: boolean;
  enableParallax: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export default class SettingsManager {
  private static instance: SettingsManager;
  private settings: GameSettings;
  private onSettingsChange?: (settings: GameSettings) => void;

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Load settings from storage
   */
  private loadSettings(): GameSettings {
    try {
      return {
        audioEnabled: StorageManager.getAudioEnabled(),
        audioVolume: StorageManager.getAudioVolume(),
        selectedCharacter: StorageManager.getSelectedCharacter(),
        showParticles: this.getBooleanSetting('showParticles', true),
        enableParallax: this.getBooleanSetting('enableParallax', true),
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'load-settings');
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): GameSettings {
    return {
      audioEnabled: true,
      audioVolume: 0.7,
      selectedCharacter: 'bird',
      showParticles: true,
      enableParallax: true,
      highContrast: false,
      reducedMotion: false
    };
  }

  /**
   * Get boolean setting from storage
   */
  private getBooleanSetting(key: string, defaultValue: boolean): boolean {
    try {
      const stored = localStorage.getItem(`flappyBird_${key}`);
      return stored !== null ? stored === 'true' : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Set boolean setting in storage
   */
  private setBooleanSetting(key: string, value: boolean): void {
    try {
      localStorage.setItem(`flappyBird_${key}`, value.toString());
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, `set-${key}`);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Update audio enabled setting
   */
  setAudioEnabled(enabled: boolean): void {
    try {
      this.settings.audioEnabled = enabled;
      StorageManager.setAudioEnabled(enabled);
      this.notifySettingsChange();
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-audio-enabled');
    }
  }

  /**
   * Update audio volume setting
   */
  setAudioVolume(volume: number): void {
    try {
      this.settings.audioVolume = Math.max(0, Math.min(1, volume));
      StorageManager.setAudioVolume(this.settings.audioVolume);
      this.notifySettingsChange();
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-audio-volume');
    }
  }

  /**
   * Update selected character
   */
  setSelectedCharacter(characterId: string): void {
    try {
      this.settings.selectedCharacter = characterId;
      StorageManager.setSelectedCharacter(characterId);
      this.notifySettingsChange();
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-selected-character');
    }
  }

  /**
   * Update particle effects setting
   */
  setShowParticles(enabled: boolean): void {
    try {
      this.settings.showParticles = enabled;
      this.setBooleanSetting('showParticles', enabled);
      this.notifySettingsChange();
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-show-particles');
    }
  }

  /**
   * Update parallax background setting
   */
  setEnableParallax(enabled: boolean): void {
    try {
      this.settings.enableParallax = enabled;
      this.setBooleanSetting('enableParallax', enabled);
      this.notifySettingsChange();
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-enable-parallax');
    }
  }

  /**
   * Toggle audio enabled
   */
  toggleAudio(): boolean {
    const newState = !this.settings.audioEnabled;
    this.setAudioEnabled(newState);
    return newState;
  }

  /**
   * Toggle particle effects
   */
  toggleParticles(): boolean {
    const newState = !this.settings.showParticles;
    this.setShowParticles(newState);
    return newState;
  }

  /**
   * Toggle parallax background
   */
  toggleParallax(): boolean {
    const newState = !this.settings.enableParallax;
    this.setEnableParallax(newState);
    return newState;
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults(): void {
    try {
      const defaults = this.getDefaultSettings();
      
      this.setAudioEnabled(defaults.audioEnabled);
      this.setAudioVolume(defaults.audioVolume);
      this.setSelectedCharacter(defaults.selectedCharacter);
      this.setShowParticles(defaults.showParticles);
      this.setEnableParallax(defaults.enableParallax);
      
      console.log('Settings reset to defaults');
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'reset-settings');
    }
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    try {
      return JSON.stringify(this.settings, null, 2);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'export-settings');
      return '{}';
    }
  }

  /**
   * Import settings from JSON
   */
  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson) as Partial<GameSettings>;
      
      if (typeof importedSettings.audioEnabled === 'boolean') {
        this.setAudioEnabled(importedSettings.audioEnabled);
      }
      
      if (typeof importedSettings.audioVolume === 'number') {
        this.setAudioVolume(importedSettings.audioVolume);
      }
      
      if (typeof importedSettings.selectedCharacter === 'string') {
        this.setSelectedCharacter(importedSettings.selectedCharacter);
      }
      
      if (typeof importedSettings.showParticles === 'boolean') {
        this.setShowParticles(importedSettings.showParticles);
      }
      
      if (typeof importedSettings.enableParallax === 'boolean') {
        this.setEnableParallax(importedSettings.enableParallax);
      }
      
      console.log('Settings imported successfully');
      return true;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'import-settings');
      return false;
    }
  }

  /**
   * Set settings change callback
   */
  setOnSettingsChange(callback: (settings: GameSettings) => void): void {
    this.onSettingsChange = callback;
  }

  /**
   * Notify settings change
   */
  private notifySettingsChange(): void {
    try {
      if (this.onSettingsChange) {
        this.onSettingsChange(this.getSettings());
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'settings-change-notification');
    }
  }

  /**
   * Apply accessibility preferences
   */
  applyAccessibilityPreferences(): void {
    try {
      // Update high contrast preference
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      if (highContrast !== this.settings.highContrast) {
        this.settings.highContrast = highContrast;
        this.notifySettingsChange();
      }
      
      // Update reduced motion preference
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion !== this.settings.reducedMotion) {
        this.settings.reducedMotion = reducedMotion;
        
        // Automatically disable particles and parallax if reduced motion is preferred
        if (reducedMotion) {
          this.setShowParticles(false);
          this.setEnableParallax(false);
        }
        
        this.notifySettingsChange();
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'apply-accessibility-preferences');
    }
  }

  /**
   * Get setting by key
   */
  getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key];
  }

  /**
   * Check if feature should be enabled based on settings and performance
   */
  shouldEnableFeature(feature: 'particles' | 'parallax' | 'audio'): boolean {
    try {
      switch (feature) {
        case 'particles':
          return this.settings.showParticles && !this.settings.reducedMotion;
        case 'parallax':
          return this.settings.enableParallax && !this.settings.reducedMotion;
        case 'audio':
          return this.settings.audioEnabled;
        default:
          return true;
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'should-enable-feature');
      return false;
    }
  }
}