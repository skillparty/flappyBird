import StorageManager from '../../src/managers/StorageManager';

describe('StorageManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('High Score Management', () => {
    test('should return 0 for new high score', () => {
      expect(StorageManager.getHighScore()).toBe(0);
    });

    test('should set and get high score', () => {
      StorageManager.setHighScore(100);
      expect(StorageManager.getHighScore()).toBe(100);
      expect(localStorage.setItem).toHaveBeenCalledWith('flappyBird_highScore', '100');
    });

    test('should handle invalid high score values', () => {
      StorageManager.setHighScore(-5);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      StorageManager.setHighScore(NaN);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    test('should validate stored high score', () => {
      localStorage.setItem('flappyBird_highScore', 'invalid');
      expect(StorageManager.getHighScore()).toBe(0);
    });
  });

  describe('Character Selection', () => {
    test('should return default character', () => {
      expect(StorageManager.getSelectedCharacter()).toBe('bird');
    });

    test('should set and get selected character', () => {
      StorageManager.setSelectedCharacter('birdBlue');
      expect(StorageManager.getSelectedCharacter()).toBe('birdBlue');
      expect(localStorage.setItem).toHaveBeenCalledWith('flappyBird_selectedCharacter', 'birdBlue');
    });

    test('should handle invalid character values', () => {
      StorageManager.setSelectedCharacter('');
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      StorageManager.setSelectedCharacter(null as any);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Audio Settings', () => {
    test('should return default audio enabled state', () => {
      expect(StorageManager.getAudioEnabled()).toBe(true);
    });

    test('should set and get audio enabled state', () => {
      StorageManager.setAudioEnabled(false);
      expect(StorageManager.getAudioEnabled()).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('flappyBird_audioEnabled', 'false');
    });

    test('should return default audio volume', () => {
      expect(StorageManager.getAudioVolume()).toBe(0.7);
    });

    test('should set and get audio volume', () => {
      StorageManager.setAudioVolume(0.5);
      expect(StorageManager.getAudioVolume()).toBe(0.5);
      expect(localStorage.setItem).toHaveBeenCalledWith('flappyBird_audioVolume', '0.5');
    });

    test('should validate audio volume range', () => {
      StorageManager.setAudioVolume(-0.5);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      StorageManager.setAudioVolume(1.5);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      StorageManager.setAudioVolume(NaN);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Game Statistics', () => {
    test('should return 0 for new games played', () => {
      expect(StorageManager.getGamesPlayed()).toBe(0);
    });

    test('should increment games played', () => {
      StorageManager.incrementGamesPlayed();
      expect(StorageManager.getGamesPlayed()).toBe(1);
      
      StorageManager.incrementGamesPlayed();
      expect(StorageManager.getGamesPlayed()).toBe(2);
    });

    test('should return 0 for new total score', () => {
      expect(StorageManager.getTotalScore()).toBe(0);
    });

    test('should add to total score', () => {
      StorageManager.addToTotalScore(50);
      expect(StorageManager.getTotalScore()).toBe(50);
      
      StorageManager.addToTotalScore(25);
      expect(StorageManager.getTotalScore()).toBe(75);
    });

    test('should handle invalid score values', () => {
      const initialTotal = StorageManager.getTotalScore();
      
      StorageManager.addToTotalScore(-10);
      expect(StorageManager.getTotalScore()).toBe(initialTotal);
      
      StorageManager.addToTotalScore(NaN);
      expect(StorageManager.getTotalScore()).toBe(initialTotal);
    });
  });

  describe('Settings Management', () => {
    test('should get all settings', () => {
      StorageManager.setHighScore(100);
      StorageManager.setSelectedCharacter('birdRed');
      StorageManager.setAudioEnabled(false);
      StorageManager.setAudioVolume(0.3);
      StorageManager.incrementGamesPlayed();
      StorageManager.addToTotalScore(150);
      
      const settings = StorageManager.getAllSettings();
      expect(settings).toEqual({
        highScore: 100,
        selectedCharacter: 'birdRed',
        audioEnabled: false,
        audioVolume: 0.3,
        gamesPlayed: 1,
        totalScore: 150
      });
    });

    test('should export settings as JSON', () => {
      StorageManager.setHighScore(50);
      StorageManager.setSelectedCharacter('birdBlue');
      
      const exported = StorageManager.exportSettings();
      const parsed = JSON.parse(exported);
      
      expect(parsed.highScore).toBe(50);
      expect(parsed.selectedCharacter).toBe('birdBlue');
    });

    test('should import settings from JSON', () => {
      const settingsJson = JSON.stringify({
        highScore: 200,
        selectedCharacter: 'birdYellow',
        audioEnabled: false,
        audioVolume: 0.8
      });
      
      const success = StorageManager.importSettings(settingsJson);
      expect(success).toBe(true);
      
      expect(StorageManager.getHighScore()).toBe(200);
      expect(StorageManager.getSelectedCharacter()).toBe('birdYellow');
      expect(StorageManager.getAudioEnabled()).toBe(false);
      expect(StorageManager.getAudioVolume()).toBe(0.8);
    });

    test('should handle invalid JSON import', () => {
      const success = StorageManager.importSettings('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('Data Management', () => {
    test('should clear all data', () => {
      StorageManager.setHighScore(100);
      StorageManager.setSelectedCharacter('birdRed');
      StorageManager.setAudioEnabled(false);
      
      StorageManager.clearAllData();
      
      expect(localStorage.removeItem).toHaveBeenCalledTimes(6); // All keys
    });

    test('should get storage info', () => {
      StorageManager.setHighScore(100);
      StorageManager.setSelectedCharacter('birdBlue');
      
      const info = StorageManager.getStorageInfo();
      expect(info.available).toBe(true);
      expect(info.keysStored).toBeGreaterThan(0);
      expect(info.estimatedSize).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage unavailable', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage unavailable');
      });
      
      // Should not throw
      expect(() => {
        StorageManager.setHighScore(100);
      }).not.toThrow();
      
      // Restore original method
      localStorage.setItem = originalSetItem;
    });

    test('should handle localStorage getItem errors', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage unavailable');
      });
      
      // Should return defaults
      expect(StorageManager.getHighScore()).toBe(0);
      expect(StorageManager.getSelectedCharacter()).toBe('bird');
      expect(StorageManager.getAudioEnabled()).toBe(true);
      
      // Restore original method
      localStorage.getItem = originalGetItem;
    });
  });
});