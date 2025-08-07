import ErrorHandler from './ErrorHandler';

export default class StorageManager {
  private static readonly KEYS = {
    HIGH_SCORE: 'flappyBird_highScore',
    SELECTED_CHARACTER: 'flappyBird_selectedCharacter',
    AUDIO_ENABLED: 'flappyBird_audioEnabled',
    AUDIO_VOLUME: 'flappyBird_audioVolume',
    GAMES_PLAYED: 'flappyBird_gamesPlayed',
    TOTAL_SCORE: 'flappyBird_totalScore',
    SETTINGS: 'flappyBird_settings'
  };

  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get high score from storage
   */
  static getHighScore(): number {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, using default high score');
        return 0;
      }

      const stored = localStorage.getItem(this.KEYS.HIGH_SCORE);
      const highScore = stored ? parseInt(stored, 10) : 0;
      
      // Validate the score
      return isNaN(highScore) || highScore < 0 ? 0 : highScore;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-high-score');
      return 0;
    }
  }

  /**
   * Set high score in storage
   */
  static setHighScore(score: number): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot save high score');
        return;
      }

      // Validate score
      if (isNaN(score) || score < 0) {
        console.warn('Invalid score provided:', score);
        return;
      }

      localStorage.setItem(this.KEYS.HIGH_SCORE, score.toString());
      console.log(`High score saved: ${score}`);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-high-score');
    }
  }

  /**
   * Get selected character from storage
   */
  static getSelectedCharacter(): string {
    try {
      if (!this.isStorageAvailable()) {
        return 'bird'; // Default character
      }

      const stored = localStorage.getItem(this.KEYS.SELECTED_CHARACTER);
      return stored || 'bird';
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-selected-character');
      return 'bird';
    }
  }

  /**
   * Set selected character in storage
   */
  static setSelectedCharacter(characterId: string): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot save character selection');
        return;
      }

      if (!characterId || typeof characterId !== 'string') {
        console.warn('Invalid character ID provided:', characterId);
        return;
      }

      localStorage.setItem(this.KEYS.SELECTED_CHARACTER, characterId);
      console.log(`Selected character saved: ${characterId}`);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-selected-character');
    }
  }

  /**
   * Get audio enabled setting
   */
  static getAudioEnabled(): boolean {
    try {
      if (!this.isStorageAvailable()) {
        return true; // Default to enabled
      }

      const stored = localStorage.getItem(this.KEYS.AUDIO_ENABLED);
      return stored !== null ? stored === 'true' : true;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-audio-enabled');
      return true;
    }
  }

  /**
   * Set audio enabled setting
   */
  static setAudioEnabled(enabled: boolean): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot save audio setting');
        return;
      }

      localStorage.setItem(this.KEYS.AUDIO_ENABLED, enabled.toString());
      console.log(`Audio enabled setting saved: ${enabled}`);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-audio-enabled');
    }
  }

  /**
   * Get audio volume setting
   */
  static getAudioVolume(): number {
    try {
      if (!this.isStorageAvailable()) {
        return 0.7; // Default volume
      }

      const stored = localStorage.getItem(this.KEYS.AUDIO_VOLUME);
      const volume = stored ? parseFloat(stored) : 0.7;
      
      // Validate volume (0.0 to 1.0)
      return isNaN(volume) || volume < 0 || volume > 1 ? 0.7 : volume;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-audio-volume');
      return 0.7;
    }
  }

  /**
   * Set audio volume setting
   */
  static setAudioVolume(volume: number): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot save volume setting');
        return;
      }

      // Validate volume
      if (isNaN(volume) || volume < 0 || volume > 1) {
        console.warn('Invalid volume provided:', volume);
        return;
      }

      localStorage.setItem(this.KEYS.AUDIO_VOLUME, volume.toString());
      console.log(`Audio volume saved: ${volume}`);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-audio-volume');
    }
  }

  /**
   * Get games played count
   */
  static getGamesPlayed(): number {
    try {
      if (!this.isStorageAvailable()) {
        return 0;
      }

      const stored = localStorage.getItem(this.KEYS.GAMES_PLAYED);
      const count = stored ? parseInt(stored, 10) : 0;
      
      return isNaN(count) || count < 0 ? 0 : count;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-games-played');
      return 0;
    }
  }

  /**
   * Increment games played count
   */
  static incrementGamesPlayed(): void {
    try {
      const current = this.getGamesPlayed();
      this.setGamesPlayed(current + 1);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'increment-games-played');
    }
  }

  /**
   * Set games played count
   */
  private static setGamesPlayed(count: number): void {
    try {
      if (!this.isStorageAvailable()) {
        return;
      }

      if (isNaN(count) || count < 0) {
        console.warn('Invalid games played count:', count);
        return;
      }

      localStorage.setItem(this.KEYS.GAMES_PLAYED, count.toString());
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-games-played');
    }
  }

  /**
   * Get total score across all games
   */
  static getTotalScore(): number {
    try {
      if (!this.isStorageAvailable()) {
        return 0;
      }

      const stored = localStorage.getItem(this.KEYS.TOTAL_SCORE);
      const total = stored ? parseInt(stored, 10) : 0;
      
      return isNaN(total) || total < 0 ? 0 : total;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-total-score');
      return 0;
    }
  }

  /**
   * Add to total score
   */
  static addToTotalScore(score: number): void {
    try {
      if (isNaN(score) || score < 0) {
        console.warn('Invalid score to add:', score);
        return;
      }

      const current = this.getTotalScore();
      this.setTotalScore(current + score);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'add-to-total-score');
    }
  }

  /**
   * Set total score
   */
  private static setTotalScore(total: number): void {
    try {
      if (!this.isStorageAvailable()) {
        return;
      }

      if (isNaN(total) || total < 0) {
        console.warn('Invalid total score:', total);
        return;
      }

      localStorage.setItem(this.KEYS.TOTAL_SCORE, total.toString());
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'set-total-score');
    }
  }

  /**
   * Get all game settings as an object
   */
  static getAllSettings(): {
    highScore: number;
    selectedCharacter: string;
    audioEnabled: boolean;
    audioVolume: number;
    gamesPlayed: number;
    totalScore: number;
  } {
    return {
      highScore: this.getHighScore(),
      selectedCharacter: this.getSelectedCharacter(),
      audioEnabled: this.getAudioEnabled(),
      audioVolume: this.getAudioVolume(),
      gamesPlayed: this.getGamesPlayed(),
      totalScore: this.getTotalScore()
    };
  }

  /**
   * Export settings as JSON string
   */
  static exportSettings(): string {
    try {
      const settings = this.getAllSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'export-settings');
      return '{}';
    }
  }

  /**
   * Import settings from JSON string
   */
  static importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      
      if (typeof settings.highScore === 'number') {
        this.setHighScore(settings.highScore);
      }
      
      if (typeof settings.selectedCharacter === 'string') {
        this.setSelectedCharacter(settings.selectedCharacter);
      }
      
      if (typeof settings.audioEnabled === 'boolean') {
        this.setAudioEnabled(settings.audioEnabled);
      }
      
      if (typeof settings.audioVolume === 'number') {
        this.setAudioVolume(settings.audioVolume);
      }
      
      console.log('Settings imported successfully');
      return true;
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'import-settings');
      return false;
    }
  }

  /**
   * Clear all stored data
   */
  static clearAllData(): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot clear data');
        return;
      }

      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('All game data cleared');
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'clear-all-data');
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    available: boolean;
    keysStored: number;
    estimatedSize: number;
  } {
    try {
      if (!this.isStorageAvailable()) {
        return { available: false, keysStored: 0, estimatedSize: 0 };
      }

      let keysStored = 0;
      let estimatedSize = 0;

      Object.values(this.KEYS).forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          keysStored++;
          estimatedSize += key.length + value.length;
        }
      });

      return {
        available: true,
        keysStored,
        estimatedSize
      };
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-storage-info');
      return { available: false, keysStored: 0, estimatedSize: 0 };
    }
  }
}