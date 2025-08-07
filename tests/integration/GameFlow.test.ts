import ScoreManager from '../../src/managers/ScoreManager';
import StorageManager from '../../src/managers/StorageManager';

// Mock dependencies
jest.mock('../../src/managers/StorageManager');
const mockStorageManager = StorageManager as jest.Mocked<typeof StorageManager>;

describe('Game Flow Integration', () => {
  let scoreManager: ScoreManager;
  let mockScene: any;

  beforeEach(() => {
    // Reset singleton
    (ScoreManager as any).instance = undefined;
    
    // Setup mocks
    mockStorageManager.getHighScore.mockReturnValue(0);
    mockStorageManager.getGamesPlayed.mockReturnValue(0);
    mockStorageManager.getTotalScore.mockReturnValue(0);
    
    // Create mock scene
    mockScene = {
      add: {
        text: jest.fn().mockReturnValue({
          setOrigin: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setText: jest.fn(),
          setScale: jest.fn().mockReturnThis(),
          setAlpha: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })
      },
      tweens: {
        add: jest.fn()
      }
    };

    scoreManager = ScoreManager.getInstance();
  });

  afterEach(() => {
    scoreManager.cleanup();
  });

  describe('Complete Game Session', () => {
    test('should handle a complete game session flow', () => {
      // Initialize game
      scoreManager.initialize(mockScene, 400, 50);
      expect(scoreManager.getCurrentScore()).toBe(0);

      // Player scores some points
      scoreManager.increment();
      scoreManager.increment();
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(3);

      // Game ends - check for high score
      const isNewHighScore = scoreManager.saveHighScore();
      expect(isNewHighScore).toBe(true);
      expect(mockStorageManager.setHighScore).toHaveBeenCalledWith(3);

      // Record game completion
      scoreManager.recordGameCompletion();
      expect(mockStorageManager.incrementGamesPlayed).toHaveBeenCalled();
      expect(mockStorageManager.addToTotalScore).toHaveBeenCalledWith(3);

      // Reset for next game
      scoreManager.reset();
      expect(scoreManager.getCurrentScore()).toBe(0);
      expect(scoreManager.getSessionScore()).toBe(3); // Session score persists
    });

    test('should handle multiple game sessions', () => {
      // First game
      scoreManager.increment();
      scoreManager.increment();
      scoreManager.saveHighScore();
      scoreManager.recordGameCompletion();
      scoreManager.reset();

      // Second game with higher score
      mockStorageManager.getHighScore.mockReturnValue(2); // Previous high score
      for (let i = 0; i < 5; i++) {
        scoreManager.increment();
      }
      
      const isNewHighScore = scoreManager.saveHighScore();
      expect(isNewHighScore).toBe(true);
      expect(mockStorageManager.setHighScore).toHaveBeenCalledWith(5);

      scoreManager.recordGameCompletion();
      expect(scoreManager.getSessionScore()).toBe(7); // 2 + 5
    });

    test('should handle game session without new high score', () => {
      mockStorageManager.getHighScore.mockReturnValue(10); // Existing high score
      
      scoreManager.increment();
      scoreManager.increment();
      
      const isNewHighScore = scoreManager.saveHighScore();
      expect(isNewHighScore).toBe(false);
      expect(mockStorageManager.setHighScore).not.toHaveBeenCalled();
    });
  });

  describe('Statistics Tracking', () => {
    test('should track statistics across multiple games', () => {
      // Setup mock data for multiple games
      mockStorageManager.getGamesPlayed.mockReturnValue(3);
      mockStorageManager.getTotalScore.mockReturnValue(45);
      mockStorageManager.getHighScore.mockReturnValue(20);

      const stats = scoreManager.getStatistics();
      expect(stats).toEqual({
        gamesPlayed: 3,
        averageScore: 15,
        bestScore: 20
      });
    });

    test('should handle first game statistics', () => {
      mockStorageManager.getGamesPlayed.mockReturnValue(0);
      mockStorageManager.getTotalScore.mockReturnValue(0);
      mockStorageManager.getHighScore.mockReturnValue(0);

      const stats = scoreManager.getStatistics();
      expect(stats).toEqual({
        gamesPlayed: 0,
        averageScore: 0,
        bestScore: 0
      });
    });
  });

  describe('UI Integration', () => {
    test('should update UI throughout game session', () => {
      scoreManager.initialize(mockScene, 400, 50);
      const mockTextObject = mockScene.add.text.mock.results[0].value;

      // Score updates should trigger UI updates
      scoreManager.increment();
      expect(mockTextObject.setText).toHaveBeenCalledWith('Score: 1');

      scoreManager.increment();
      expect(mockTextObject.setText).toHaveBeenCalledWith('Score: 2');

      // Reset should update UI
      scoreManager.reset();
      expect(mockTextObject.setText).toHaveBeenCalledWith('Score: 0');
    });

    test('should create displays for different scenes', () => {
      // Menu scene high score display
      mockStorageManager.getHighScore.mockReturnValue(25);
      const highScoreDisplay = scoreManager.createHighScoreDisplay(mockScene, 200, 100);
      expect(mockScene.add.text).toHaveBeenCalledWith(200, 100, 'High Score: 25', expect.any(Object));

      // Game over scene score display
      scoreManager.increment();
      scoreManager.increment();
      const scoreDisplay = scoreManager.createScoreDisplay(mockScene, 300, 200);
      expect(mockScene.add.text).toHaveBeenCalledWith(300, 200, 'Score: 2', expect.any(Object));
    });
  });

  describe('Error Recovery', () => {
    test('should recover from storage errors during game flow', () => {
      // Simulate storage error during high score save
      mockStorageManager.setHighScore.mockImplementation(() => {
        throw new Error('Storage error');
      });

      scoreManager.increment();
      scoreManager.increment();

      // Should not throw and should return false
      const isNewHighScore = scoreManager.saveHighScore();
      expect(isNewHighScore).toBe(false);

      // Game should continue normally
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(3);
    });

    test('should handle UI errors gracefully', () => {
      // Mock scene to throw errors
      mockScene.add.text.mockImplementation(() => {
        throw new Error('UI error');
      });

      // Should not throw
      expect(() => {
        scoreManager.initialize(mockScene, 400, 50);
      }).not.toThrow();

      // Core functionality should still work
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(1);
    });
  });

  describe('Callback Integration', () => {
    test('should trigger callbacks during game flow', () => {
      const scoreCallback = jest.fn();
      scoreManager.setOnScoreChange(scoreCallback);

      scoreManager.increment();
      expect(scoreCallback).toHaveBeenCalledWith(1);

      scoreManager.increment();
      expect(scoreCallback).toHaveBeenCalledWith(2);

      scoreManager.reset();
      // Reset doesn't trigger callback, only increment does
      expect(scoreCallback).toHaveBeenCalledTimes(2);
    });
  });
});