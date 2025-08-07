import { CollisionResult } from './CollisionSystem';
import ScoreManager from '../managers/ScoreManager';
import ErrorHandler from '../managers/ErrorHandler';

export interface GameOverData {
  finalScore: number;
  isNewHighScore: boolean;
  collisionType: string;
  gameTime: number;
}

export default class GameOverSystem {
  private scene: Phaser.Scene;
  private scoreManager: ScoreManager;
  private gameStartTime: number;
  private isGameOver: boolean;
  private onGameOverCallback?: (data: GameOverData) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scoreManager = ScoreManager.getInstance();
    this.gameStartTime = Date.now();
    this.isGameOver = false;
  }

  /**
   * Initialize game over system
   */
  initialize(): void {
    try {
      this.gameStartTime = Date.now();
      this.isGameOver = false;
      console.log('Game over system initialized');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-over-system-init');
    }
  }

  /**
   * Trigger game over sequence
   */
  triggerGameOver(collisionResult: CollisionResult): void {
    if (this.isGameOver) return;

    try {
      this.isGameOver = true;
      console.log('Game over triggered:', collisionResult.collisionType);

      // Calculate game time
      const gameTime = Date.now() - this.gameStartTime;
      
      // Get final score
      const finalScore = this.scoreManager.getCurrentScore();
      
      // Check and save high score
      const isNewHighScore = this.scoreManager.saveHighScore();
      
      // Record game completion for statistics
      this.scoreManager.recordGameCompletion();
      
      // Create game over data
      const gameOverData: GameOverData = {
        finalScore,
        isNewHighScore,
        collisionType: collisionResult.collisionType,
        gameTime
      };

      // Show game over effects
      this.showGameOverEffects(gameOverData);
      
      // Trigger callback after effects
      this.scene.time.delayedCall(1500, () => {
        if (this.onGameOverCallback) {
          this.onGameOverCallback(gameOverData);
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-over-trigger');
    }
  }

  /**
   * Show game over visual effects
   */
  private showGameOverEffects(data: GameOverData): void {
    try {
      // Show collision-specific effects
      this.showCollisionEffect(data.collisionType);
      
      // Show score effects
      this.showScoreEffects(data);
      
      // Show new high score effect if applicable
      if (data.isNewHighScore) {
        this.showNewHighScoreEffect();
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-over-effects');
    }
  }

  /**
   * Show collision-specific visual effect
   */
  private showCollisionEffect(collisionType: string): void {
    try {
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;

      let effectText = '';
      let effectColor = '#FF6B6B';

      switch (collisionType) {
        case 'pipe':
          effectText = '¡CHOQUE!';
          effectColor = '#FF6B6B';
          break;
        case 'ground':
          effectText = '¡AL SUELO!';
          effectColor = '#8B4513';
          break;
        case 'ceiling':
          effectText = '¡MUY ALTO!';
          effectColor = '#87CEEB';
          break;
        default:
          effectText = '¡GAME OVER!';
          effectColor = '#FF6B6B';
      }

      // Create effect text
      const collisionText = this.scene.add.text(centerX, centerY - 50, effectText, {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: effectColor,
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      collisionText.setDepth(150);
      collisionText.setAlpha(0);

      // Animate effect text
      this.scene.tweens.add({
        targets: collisionText,
        alpha: 1,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Fade out after showing
          this.scene.tweens.add({
            targets: collisionText,
            alpha: 0,
            duration: 1000,
            delay: 500,
            onComplete: () => {
              collisionText.destroy();
            }
          });
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'collision-effect-display');
    }
  }

  /**
   * Show score-related effects
   */
  private showScoreEffects(data: GameOverData): void {
    try {
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;

      // Show final score with animation
      const scoreText = this.scene.add.text(centerX, centerY + 20, `Puntuación: ${data.finalScore}`, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      scoreText.setDepth(150);
      scoreText.setAlpha(0);

      // Animate score display
      this.scene.tweens.add({
        targets: scoreText,
        alpha: 1,
        y: centerY + 10,
        duration: 500,
        delay: 300,
        ease: 'Power2.easeOut'
      });

      // Show game time
      const gameTimeSeconds = Math.round(data.gameTime / 1000);
      const timeText = this.scene.add.text(centerX, centerY + 60, `Tiempo: ${gameTimeSeconds}s`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#CCCCCC',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      timeText.setDepth(150);
      timeText.setAlpha(0);

      this.scene.tweens.add({
        targets: timeText,
        alpha: 1,
        duration: 500,
        delay: 600,
        ease: 'Power2.easeOut'
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-effects-display');
    }
  }

  /**
   * Show new high score celebration effect
   */
  private showNewHighScoreEffect(): void {
    try {
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;

      // Create "NEW HIGH SCORE!" text
      const highScoreText = this.scene.add.text(centerX, centerY - 100, '¡NUEVO RÉCORD!', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      highScoreText.setDepth(200);
      highScoreText.setAlpha(0);

      // Animate high score text with celebration effect
      this.scene.tweens.add({
        targets: highScoreText,
        alpha: 1,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 400,
        delay: 800,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Add pulsing effect
          this.scene.tweens.add({
            targets: highScoreText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 2
          });
        }
      });

      // Create celebration particles
      this.createCelebrationParticles(centerX, centerY - 100);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'high-score-effect');
    }
  }

  /**
   * Create celebration particle effect
   */
  private createCelebrationParticles(x: number, y: number): void {
    try {
      const particles = this.scene.add.graphics();
      particles.setDepth(180);

      // Create golden particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const particleX = x + Math.cos(angle) * distance;
        const particleY = y + Math.sin(angle) * distance;
        
        particles.fillStyle(0xFFD700);
        particles.fillCircle(particleX, particleY, 4);
      }

      // Animate particles
      this.scene.tweens.add({
        targets: particles,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        rotation: Math.PI * 2,
        duration: 1500,
        delay: 800,
        ease: 'Power2.easeOut',
        onComplete: () => {
          particles.destroy();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'celebration-particles');
    }
  }

  /**
   * Set game over callback
   */
  setOnGameOver(callback: (data: GameOverData) => void): void {
    this.onGameOverCallback = callback;
  }

  /**
   * Check if game is over
   */
  isGameOverState(): boolean {
    return this.isGameOver;
  }

  /**
   * Reset game over system
   */
  reset(): void {
    try {
      this.isGameOver = false;
      this.gameStartTime = Date.now();
      console.log('Game over system reset');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-over-system-reset');
    }
  }

  /**
   * Get current game time
   */
  getCurrentGameTime(): number {
    return Date.now() - this.gameStartTime;
  }

  /**
   * Force game over (for testing or special conditions)
   */
  forceGameOver(reason: string = 'forced'): void {
    const fakeCollision: CollisionResult = {
      hasCollision: true,
      collisionType: 'none',
      collisionPoint: { x: 0, y: 0 }
    };
    
    console.log(`Force game over: ${reason}`);
    this.triggerGameOver(fakeCollision);
  }

  /**
   * Get game statistics
   */
  getGameStatistics(): {
    gameTime: number;
    score: number;
    isNewRecord: boolean;
  } {
    return {
      gameTime: this.getCurrentGameTime(),
      score: this.scoreManager.getCurrentScore(),
      isNewRecord: this.scoreManager.getCurrentScore() > this.scoreManager.getHighScore()
    };
  }

  /**
   * Cleanup game over system
   */
  destroy(): void {
    try {
      this.onGameOverCallback = undefined;
      console.log('Game over system destroyed');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-over-system-destroy');
    }
  }
}