import ErrorHandler from '../managers/ErrorHandler';

interface PerformanceSettings {
  enableParallax: boolean;
  enableParticles: boolean;
  enableAnimations: boolean;
  enableAudio: boolean;
  maxPipes: number;
  targetFPS: number;
}

export default class PerformanceManager {
  private static instance: PerformanceManager;
  private settings: PerformanceSettings;
  private scene?: Phaser.Scene;
  private fpsHistory: number[] = [];
  private lastOptimization: number = 0;

  private constructor() {
    this.settings = {
      enableParallax: true,
      enableParticles: true,
      enableAnimations: true,
      enableAudio: true,
      maxPipes: 10,
      targetFPS: 60
    };
  }

  static getInstance(scene?: Phaser.Scene): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    
    if (scene) {
      PerformanceManager.instance.scene = scene;
    }
    
    return PerformanceManager.instance;
  }

  /**
   * Monitor performance and adjust settings
   */
  monitorAndOptimize(): void {
    if (!this.scene) return;

    try {
      const currentFPS = this.scene.game.loop.actualFps;
      this.fpsHistory.push(currentFPS);
      
      // Keep only last 60 frames (1 second at 60fps)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      // Calculate average FPS
      const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      
      // Check if optimization is needed
      if (avgFPS < this.settings.targetFPS * 0.8 && this.canOptimize()) {
        this.optimizePerformance(avgFPS);
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'performance-monitor');
    }
  }

  /**
   * Check if enough time has passed since last optimization
   */
  private canOptimize(): boolean {
    const now = Date.now();
    return now - this.lastOptimization > 5000; // 5 seconds cooldown
  }

  /**
   * Apply performance optimizations based on current FPS
   */
  private optimizePerformance(currentFPS: number): void {
    try {
      this.lastOptimization = Date.now();
      let optimizationsApplied = 0;

      console.log(`Optimizing performance - Current FPS: ${currentFPS.toFixed(1)}`);

      // Level 1: Disable particles (least impact on gameplay)
      if (currentFPS < 50 && this.settings.enableParticles) {
        this.settings.enableParticles = false;
        this.disableParticles();
        optimizationsApplied++;
        console.log('Disabled particle effects');
      }

      // Level 2: Disable parallax background (moderate impact)
      if (currentFPS < 40 && this.settings.enableParallax) {
        this.settings.enableParallax = false;
        this.disableParallax();
        optimizationsApplied++;
        console.log('Disabled parallax background');
      }

      // Level 3: Reduce animations (higher impact)
      if (currentFPS < 30 && this.settings.enableAnimations) {
        this.settings.enableAnimations = false;
        this.reduceAnimations();
        optimizationsApplied++;
        console.log('Reduced animations');
      }

      // Level 4: Reduce pipe count (gameplay impact)
      if (currentFPS < 25 && this.settings.maxPipes > 5) {
        this.settings.maxPipes = Math.max(5, this.settings.maxPipes - 2);
        optimizationsApplied++;
        console.log(`Reduced max pipes to ${this.settings.maxPipes}`);
      }

      // Notify user if optimizations were applied
      if (optimizationsApplied > 0) {
        ErrorHandler.showUserError(
          `Aplicadas ${optimizationsApplied} optimizaciones para mejorar el rendimiento.`
        );
      }

    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'performance-optimization');
    }
  }

  /**
   * Disable particle effects
   */
  private disableParticles(): void {
    if (!this.scene) return;

    try {
      // Find and disable particle emitters
      this.scene.children.list.forEach(child => {
        if (child instanceof Phaser.GameObjects.Particles.ParticleEmitter) {
          child.setVisible(false);
          child.pause();
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'disable-particles');
    }
  }

  /**
   * Disable parallax background
   */
  private disableParallax(): void {
    try {
      // This would be called on the parallax background component
      // The actual implementation would depend on how the component is structured
      console.log('Parallax background disabled for performance');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'disable-parallax');
    }
  }

  /**
   * Reduce animations
   */
  private reduceAnimations(): void {
    if (!this.scene) return;

    try {
      // Kill non-essential tweens
      this.scene.tweens.getAllTweens().forEach(tween => {
        // Keep essential tweens (like game over animations)
        if (!tween.data || !tween.data.essential) {
          tween.destroy();
        }
      });
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'reduce-animations');
    }
  }

  /**
   * Get current performance settings
   */
  getSettings(): PerformanceSettings {
    return { ...this.settings };
  }

  /**
   * Force enable/disable specific features
   */
  setFeature(feature: keyof PerformanceSettings, enabled: boolean): void {
    try {
      (this.settings as any)[feature] = enabled;
      console.log(`Performance feature ${feature} set to ${enabled}`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'set-performance-feature');
    }
  }

  /**
   * Reset all settings to default
   */
  resetToDefaults(): void {
    this.settings = {
      enableParallax: true,
      enableParticles: true,
      enableAnimations: true,
      enableAudio: true,
      maxPipes: 10,
      targetFPS: 60
    };
    
    this.fpsHistory = [];
    this.lastOptimization = 0;
    
    console.log('Performance settings reset to defaults');
  }

  /**
   * Get performance statistics
   */
  getStatistics(): {
    currentFPS: number;
    averageFPS: number;
    optimizationsActive: number;
    memoryUsage?: number;
  } {
    const currentFPS = this.scene ? this.scene.game.loop.actualFps : 0;
    const averageFPS = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 0;

    // Count active optimizations
    const defaultSettings = {
      enableParallax: true,
      enableParticles: true,
      enableAnimations: true,
      enableAudio: true,
      maxPipes: 10
    };

    let optimizationsActive = 0;
    Object.keys(defaultSettings).forEach(key => {
      if (key === 'maxPipes') {
        if (this.settings.maxPipes < (defaultSettings as any)[key]) {
          optimizationsActive++;
        }
      } else if (!(this.settings as any)[key] && (defaultSettings as any)[key]) {
        optimizationsActive++;
      }
    });

    const stats: any = {
      currentFPS: Math.round(currentFPS * 10) / 10,
      averageFPS: Math.round(averageFPS * 10) / 10,
      optimizationsActive
    };

    // Add memory usage if available
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      stats.memoryUsage = Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100);
    }

    return stats;
  }

  /**
   * Check if a feature should be enabled based on current settings
   */
  shouldEnable(feature: keyof PerformanceSettings): boolean {
    return this.settings[feature] as boolean;
  }

  /**
   * Get maximum allowed pipes
   */
  getMaxPipes(): number {
    return this.settings.maxPipes;
  }

  /**
   * Cleanup performance manager
   */
  destroy(): void {
    this.fpsHistory = [];
    this.scene = undefined;
    console.log('Performance manager destroyed');
  }
}