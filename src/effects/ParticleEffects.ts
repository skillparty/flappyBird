import ErrorHandler from '../managers/ErrorHandler';

export default class ParticleEffects {
  private scene: Phaser.Scene;
  private particlePool: Phaser.GameObjects.Graphics[] = [];
  private activeParticles: Array<{
    graphics: Phaser.GameObjects.Graphics;
    tween: Phaser.Tweens.Tween;
  }> = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializePool();
  }

  /**
   * Initialize particle pool for performance
   */
  private initializePool(): void {
    try {
      for (let i = 0; i < 20; i++) {
        const particle = this.scene.add.graphics();
        particle.setVisible(false);
        particle.setActive(false);
        this.particlePool.push(particle);
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'particle-pool-init');
    }
  }

  /**
   * Get particle from pool
   */
  private getParticle(): Phaser.GameObjects.Graphics | null {
    try {
      const particle = this.particlePool.find(p => !p.active);
      if (particle) {
        particle.setActive(true);
        particle.setVisible(true);
        particle.clear();
        return particle;
      }
      return null;
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'get-particle');
      return null;
    }
  }

  /**
   * Return particle to pool
   */
  private returnParticle(particle: Phaser.GameObjects.Graphics): void {
    try {
      particle.setActive(false);
      particle.setVisible(false);
      particle.clear();
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'return-particle');
    }
  }

  /**
   * Create score effect when passing through pipes
   */
  createScoreEffect(x: number, y: number): void {
    try {
      // Create floating "+1" text
      const scoreText = this.scene.add.text(x, y, '+1', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      scoreText.setDepth(100);

      // Animate the score text
      this.scene.tweens.add({
        targets: scoreText,
        y: y - 50,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 1000,
        ease: 'Power2.easeOut',
        onComplete: () => {
          scoreText.destroy();
        }
      });

      // Create sparkle particles
      this.createSparkleParticles(x, y, 0x00FF00);

    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-effect');
    }
  }

  /**
   * Create collision effect
   */
  createCollisionEffect(x: number, y: number): void {
    try {
      // Create impact burst
      this.createBurstParticles(x, y, 0xFF6B6B, 12);
      
      // Create screen flash effect
      const flash = this.scene.add.rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        0xFF0000,
        0.3
      );
      flash.setDepth(200);

      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          flash.destroy();
        }
      });

    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'collision-effect');
    }
  }

  /**
   * Create jump effect
   */
  createJumpEffect(x: number, y: number): void {
    try {
      // Create small puff particles
      this.createPuffParticles(x, y - 10, 0xFFFFFF, 4);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'jump-effect');
    }
  }

  /**
   * Create sparkle particles
   */
  private createSparkleParticles(x: number, y: number, color: number): void {
    try {
      for (let i = 0; i < 6; i++) {
        const particle = this.getParticle();
        if (!particle) continue;

        const angle = (i / 6) * Math.PI * 2;
        const distance = 20 + Math.random() * 15;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        // Draw sparkle
        particle.fillStyle(color);
        particle.fillStar(0, 0, 4, 3, 6);
        particle.setPosition(x, y);
        particle.setDepth(90);

        const tween = this.scene.tweens.add({
          targets: particle,
          x: targetX,
          y: targetY,
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 800,
          ease: 'Power2.easeOut',
          onComplete: () => {
            this.returnParticle(particle);
            this.removeActiveParticle(particle);
          }
        });

        this.activeParticles.push({ graphics: particle, tween });
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'sparkle-particles');
    }
  }

  /**
   * Create burst particles
   */
  private createBurstParticles(x: number, y: number, color: number, count: number): void {
    try {
      for (let i = 0; i < count; i++) {
        const particle = this.getParticle();
        if (!particle) continue;

        const angle = (i / count) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        // Draw burst particle
        particle.fillStyle(color);
        particle.fillCircle(0, 0, 3 + Math.random() * 2);
        particle.setPosition(x, y);
        particle.setDepth(95);

        const tween = this.scene.tweens.add({
          targets: particle,
          x: targetX,
          y: targetY,
          alpha: 0,
          duration: 600,
          ease: 'Power2.easeOut',
          onComplete: () => {
            this.returnParticle(particle);
            this.removeActiveParticle(particle);
          }
        });

        this.activeParticles.push({ graphics: particle, tween });
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'burst-particles');
    }
  }

  /**
   * Create puff particles
   */
  private createPuffParticles(x: number, y: number, color: number, count: number): void {
    try {
      for (let i = 0; i < count; i++) {
        const particle = this.getParticle();
        if (!particle) continue;

        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 10;

        // Draw puff particle
        particle.fillStyle(color, 0.6);
        particle.fillCircle(0, 0, 2 + Math.random() * 3);
        particle.setPosition(x + offsetX, y + offsetY);
        particle.setDepth(85);

        const tween = this.scene.tweens.add({
          targets: particle,
          y: y + offsetY - 20,
          alpha: 0,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 400,
          ease: 'Power1.easeOut',
          onComplete: () => {
            this.returnParticle(particle);
            this.removeActiveParticle(particle);
          }
        });

        this.activeParticles.push({ graphics: particle, tween });
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'puff-particles');
    }
  }

  /**
   * Create new high score celebration effect
   */
  createHighScoreCelebration(x: number, y: number): void {
    try {
      // Create golden burst
      this.createBurstParticles(x, y, 0xFFD700, 16);
      
      // Create floating stars
      for (let i = 0; i < 8; i++) {
        const particle = this.getParticle();
        if (!particle) continue;

        const angle = (i / 8) * Math.PI * 2;
        const startDistance = 10;
        const endDistance = 60;
        const startX = x + Math.cos(angle) * startDistance;
        const startY = y + Math.sin(angle) * startDistance;
        const endX = x + Math.cos(angle) * endDistance;
        const endY = y + Math.sin(angle) * endDistance;

        // Draw star
        particle.fillStyle(0xFFD700);
        particle.fillStar(0, 0, 5, 4, 8);
        particle.setPosition(startX, startY);
        particle.setDepth(100);

        const tween = this.scene.tweens.add({
          targets: particle,
          x: endX,
          y: endY,
          alpha: 0,
          rotation: Math.PI * 2,
          duration: 1500,
          ease: 'Power2.easeOut',
          onComplete: () => {
            this.returnParticle(particle);
            this.removeActiveParticle(particle);
          }
        });

        this.activeParticles.push({ graphics: particle, tween });
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'high-score-celebration');
    }
  }

  /**
   * Remove active particle from tracking
   */
  private removeActiveParticle(particle: Phaser.GameObjects.Graphics): void {
    try {
      const index = this.activeParticles.findIndex(p => p.graphics === particle);
      if (index !== -1) {
        this.activeParticles.splice(index, 1);
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'remove-active-particle');
    }
  }

  /**
   * Clear all active particles
   */
  clearAllParticles(): void {
    try {
      this.activeParticles.forEach(({ graphics, tween }) => {
        tween.destroy();
        this.returnParticle(graphics);
      });
      this.activeParticles = [];
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'clear-particles');
    }
  }

  /**
   * Destroy particle system
   */
  destroy(): void {
    try {
      this.clearAllParticles();
      
      this.particlePool.forEach(particle => {
        particle.destroy();
      });
      
      this.particlePool = [];
      
      console.log('Particle effects destroyed');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'particle-effects-destroy');
    }
  }
}