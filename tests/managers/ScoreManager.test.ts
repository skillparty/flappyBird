import ScoreManager from '../../src/managers/ScoreManager';
import StorageManager from '../../src/managers/StorageManager';

// Mock StorageManager
jest.mock('../../src/managers/StorageManager');
const mockStorageManager = StorageManager as jest.Mocked<typeof StorageManager>;

describe('ScoreManager', () => {
  let scoreManager: ScoreManager;
  let mockScene: any;

  beforeEach(() => {
    // Reset singleton instance
    (ScoreManager as any).instance = undefined;
    
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

    // Setup StorageManager mocks
    mockStorageManager.getHighScore.mockReturnValue(0);
    mockStorageManager.getGamesPlayed.mockReturnValue(0);
    mockStorageManager.getTotalScore.mockReturnValue(0);

    scoreManager = ScoreManager.getInstance();
  });

  afterEach(() => {
    scoreManager.cleanup();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = ScoreManager.getInstance();
      const instance2 = ScoreManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Score Management', () => {
    test('should start with score 0', () => {
      expect(scoreManager.getCurrentScore()).toBe(0);
    });

    test('should increment score correctly', () => {
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(1);
      
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(2);
    });

    test('should reset score to 0', () => {
      scoreManager.increment();
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(2);
      
      scoreManager.reset();
      expect(scoreManager.getCurrentScore()).toBe(0);
    });

    test('should track session score', () => {
      scoreManager.increment();
      scoreManager.increment();
      expect(scoreManager.getSessionScore()).toBe(2);
      
      scoreManager.reset();
      expect(scoreManager.getSessionScore()).toBe(2); // Session score persists
    });
  });

  describe('High Score Management', () => {
    test('should load high score from storage', () => {
  (ScoreManager as any).instance = undefined;
  mockStorageManager.getHighScore.mockReturnValue(10);
  const newScoreManager = ScoreManager.getInstance();
      expect(newScoreManager.getHighScore()).toBe(10);
    });

    test('should save new high score', () => {
      mockStorageManager.getHighScore.mockReturnValue(5);
      
      // Set current score higher than high score
      for (let i = 0; i < 8; i++) {
        scoreManager.increment();
      }
      
      const isNewHighScore = scoreManager.saveHighScore();
      expect(isNewHighScore).toBe(true);
      expect(mockStorageManager.setHighScore).toHaveBeenCalledWith(8);
    });

    test('should not save if current score is not higher', () => {
  mockStorageManager.getHighScore.mockReturnValue(10);
  // Force lazy reload
  scoreManager.getHighScore(); // ensures internal high score is 10
      
      scoreManager.increment();
      scoreManager.increment();
      
      const isNewHighScore = scoreManager.saveHighScore();
      expect(isNewHighScore).toBe(false);
      expect(mockStorageManager.setHighScore).not.toHaveBeenCalled();
    });
  });

  describe('UI Integration', () => {
    test('should initialize with scene', () => {
      scoreManager.initialize(mockScene, 400, 50);
      expect(mockScene.add.text).toHaveBeenCalledWith(400, 50, 'Score: 0', expect.any(Object));
    });

    test('should update display when score changes', () => {
      scoreManager.initialize(mockScene, 400, 50);
      const mockTextObject = mockScene.add.text.mock.results[0].value;
      
      scoreManager.increment();
      expect(mockTextObject.setText).toHaveBeenCalledWith('Score: 1');
    });

    test('should create score display for other scenes', () => {
      const scoreDisplay = scoreManager.createScoreDisplay(mockScene, 200, 100);
      expect(mockScene.add.text).toHaveBeenCalledWith(200, 100, 'Score: 0', expect.any(Object));
    });

    test('should create high score display', () => {
      mockStorageManager.getHighScore.mockReturnValue(15);
  // Force reload of high score after changing mock return
  scoreManager.getHighScore();
      const highScoreDisplay = scoreManager.createHighScoreDisplay(mockScene, 200, 100);
      expect(mockScene.add.text).toHaveBeenCalledWith(200, 100, 'High Score: 15', expect.any(Object));
    });
  });

  describe('Statistics', () => {
    test('should return correct statistics', () => {
  // Reset instance to avoid previous high score state leakage
  (ScoreManager as any).instance = undefined;
  scoreManager = ScoreManager.getInstance();
      mockStorageManager.getGamesPlayed.mockReturnValue(5);
      mockStorageManager.getTotalScore.mockReturnValue(50);
      mockStorageManager.getHighScore.mockReturnValue(15);
  // Ensure internal high score reflects updated mock
  scoreManager.getHighScore();
      
      const stats = scoreManager.getStatistics();
      expect(stats).toEqual({
        gamesPlayed: 5,
        averageScore: 10,
        bestScore: 15
      });
    });

    test('should handle zero games played', () => {
      mockStorageManager.getGamesPlayed.mockReturnValue(0);
      mockStorageManager.getTotalScore.mockReturnValue(0);
      
      const stats = scoreManager.getStatistics();
      expect(stats.averageScore).toBe(0);
    });

    test('should record game completion', () => {
      scoreManager.increment();
      scoreManager.increment();
      scoreManager.recordGameCompletion();
      
      expect(mockStorageManager.incrementGamesPlayed).toHaveBeenCalled();
      expect(mockStorageManager.addToTotalScore).toHaveBeenCalledWith(2);
    });
  });

  describe('Callbacks', () => {
    test('should trigger callback on score change', () => {
      const callback = jest.fn();
      scoreManager.setOnScoreChange(callback);
      
      scoreManager.increment();
      expect(callback).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle storage errors gracefully', () => {
      mockStorageManager.getHighScore.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw
      expect(() => {
        const newScoreManager = ScoreManager.getInstance();
        newScoreManager.getHighScore();
      }).not.toThrow();
    });
  });
});