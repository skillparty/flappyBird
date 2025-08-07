import { ScoreData } from '../types/GameTypes';
import StorageManager from './StorageManager';
import ErrorHandler from './ErrorHandler';

export default class ScoreManager {
  private static instance: ScoreManager;
  private scoreData: ScoreData;
  private scoreText?: Phaser.GameObjects.Text;
  private scene?: Phaser.Scene;
  private onScoreChange?: (score: number) => void;

  private constructor() {
    this.scoreData = {
      current: 0,
      high: 0,
      session: 0
    };
    
    this.loadHighScore();
  }

  static getInstance(): ScoreManager {
    if (!ScoreManager.instance) {
      ScoreManager.instance = new ScoreManager();
    }
    return ScoreManager.instance;
  }

  /**
   * Initialize score manager with scene and display
   */
  initialize(scene: Phaser.Scene, x: number, y: number): void {
    try {
      this.scene = scene;
      
      // Create score display text
      this.scoreText = scene.add.text(x, y, `Score: ${this.scoreData.current}`, {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
      
      // Set depth for proper layering
      this.scoreText.setDepth(100);
      
      console.log('Score manager initialized');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-manager-init');
    }
  }

  /**
   * Increment current score
   */
  increment(): void {
    try {
      this.scoreData.current++;
      this.scoreData.session++;
      
      this.updateDisplay();
      
      // Play score sound
      try {
        const AudioManager = require('./AudioManager').default;
        const audioManager = AudioManager.getInstance();
        audioManager.playScore();
      } catch (audioError) {
        // Audio is optional, continue without it
      }
      
      // Announce score to screen readers
      try {
        const AccessibilityManager = require('./AccessibilityManager').default;
        const accessibilityManager = AccessibilityManager.getInstance();
        accessibilityManager.announceScore(this.scoreData.current);
      } catch (accessError) {
        // Accessibility is optional
      }
      
      // Trigger callback if set
      if (this.onScoreChange) {
        this.onScoreChange(this.scoreData.current);
      }
      
      console.log(`Score incremented to: ${this.scoreData.current}`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-increment');
    }
  }

  /**
   * Reset current score to 0
   */
  reset(): void {
    try {
      this.scoreData.current = 0;
      this.updateDisplay();
      
      console.log('Score reset to 0');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-reset');
    }
  }

  /**
   * Save high score if current score is higher
   */
  saveHighScore(): boolean {
    try {
      if (this.scoreData.current > this.scoreData.high) {
        const oldHighScore = this.scoreData.high;
        this.scoreData.high = this.scoreData.current;
        
        // Persist to storage
        StorageManager.setHighScore(this.scoreData.high);
        
        console.log(`New high score! ${oldHighScore} -> ${this.scoreData.high}`);
        return true; // New high score achieved
      }
      
      return false; // No new high score
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'save-high-score');
      return false;
    }
  }

  /**
   * Load high score from storage
   */
  private loadHighScore(): void {
    try {
      this.scoreData.high = StorageManager.getHighScore();
      console.log(`Loaded high score: ${this.scoreData.high}`);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'load-high-score');
      this.scoreData.high = 0; // Fallback to 0
    }
  }

  /**
   * Update score display
   */
  private updateDisplay(): void {
    try {
      if (this.scoreText) {
        this.scoreText.setText(`Score: ${this.scoreData.current}`);
        
        // Add score animation effect
        this.animateScoreChange();
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-display-update');
    }
  }

  /**
   * Animate score change for visual feedback
   */
  private animateScoreChange(): void {
    if (!this.scoreText || !this.scene) return;

    try {
      // Scale animation for score change
      this.scene.tweens.add({
        targets: this.scoreText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          if (this.scoreText) {
            this.scoreText.setScale(1);
          }
        }
      });

      // Color flash effect
      this.scene.tweens.add({
        targets: this.scoreText,
        alpha: 0.7,
        duration: 150,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          if (this.scoreText) {
            this.scoreText.setAlpha(1);
          }
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-animation');
    }
  }

  /**
   * Get current score
   */
  getCurrentScore(): number {
    return this.scoreData.current;
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return this.scoreData.high;
  }

  /**
   * Get session score (total points in current session)
   */
  getSessionScore(): number {
    return this.scoreData.session;
  }

  /**
   * Get all score data
   */
  getScoreData(): ScoreData {
    return { ...this.scoreData };
  }

  /**
   * Set callback for score changes
   */
  setOnScoreChange(callback: (score: number) => void): void {
    this.onScoreChange = callback;
  }

  /**
   * Create score display for other scenes
   */
  createScoreDisplay(scene: Phaser.Scene, x: number, y: number, config?: Partial<Phaser.Types.GameObjects.Text.TextStyle>): Phaser.GameObjects.Text {
    try {
      const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
      };

      const style = { ...defaultStyle, ...config };
      
      return scene.add.text(x, y, `Score: ${this.scoreData.current}`, style).setOrigin(0.5);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'create-score-display');
      // Return fallback text
      return scene.add.text(x, y, `Score: ${this.scoreData.current}`, {
        fontSize: '24px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
    }
  }

  /**
   * Create high score display
   */
  createHighScoreDisplay(scene: Phaser.Scene, x: number, y: number, config?: Partial<Phaser.Types.GameObjects.Text.TextStyle>): Phaser.GameObjects.Text {
    try {
      const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 2
      };

      const style = { ...defaultStyle, ...config };
      
      return scene.add.text(x, y, `High Score: ${this.scoreData.high}`, style).setOrigin(0.5);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'create-high-score-display');
      // Return fallback text
      return scene.add.text(x, y, `High Score: ${this.scoreData.high}`, {
        fontSize: '20px',
        color: '#FFFF00'
      }).setOrigin(0.5);
    }
  }

  /**
   * Update score display position (for responsive design)
   */
  updateDisplayPosition(x: number, y: number): void {
    try {
      if (this.scoreText) {
        this.scoreText.setPosition(x, y);
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-position-update');
    }
  }

  /**
   * Show score achievement effect
   */
  showAchievementEffect(scene: Phaser.Scene, message: string): void {
    try {
      const centerX = scene.cameras.main.width / 2;
      const centerY = scene.cameras.main.height / 2;

      // Create achievement text
      const achievementText = scene.add.text(centerX, centerY - 50, message, {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      achievementText.setDepth(200);

      // Animate achievement text
      scene.tweens.add({
        targets: achievementText,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        y: centerY - 100,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => {
          achievementText.destroy();
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'achievement-effect');
    }
  }

  /**
   * Get score statistics
   */
  getStatistics(): { gamesPlayed: number; averageScore: number; bestScore: number } {
    try {
      const gamesPlayed = StorageManager.getGamesPlayed();
      const totalScore = StorageManager.getTotalScore();
      const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;

      return {
        gamesPlayed,
        averageScore,
        bestScore: this.scoreData.high
      };
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'get-statistics');
      return {
        gamesPlayed: 0,
        averageScore: 0,
        bestScore: this.scoreData.high
      };
    }
  }

  /**
   * Record game completion for statistics
   */
  recordGameCompletion(): void {
    try {
      StorageManager.incrementGamesPlayed();
      StorageManager.addToTotalScore(this.scoreData.current);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'record-game-completion');
    }
  }

  /**
   * Cleanup score manager
   */
  cleanup(): void {
    try {
      if (this.scoreText) {
        this.scoreText.destroy();
        this.scoreText = undefined;
      }
      
      this.scene = undefined;
      this.onScoreChange = undefined;
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-manager-cleanup');
    }
  }
}