import { AudioConfig } from '../types/GameTypes';
import StorageManager from './StorageManager';
import ErrorHandler from './ErrorHandler';

export default class AudioManager {
  private static instance: AudioManager;
  private scene?: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;
  private isInitialized: boolean = false;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(scene?: Phaser.Scene): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    
    if (scene) {
      AudioManager.instance.scene = scene;
      if (!AudioManager.instance.isInitialized) {
        AudioManager.instance.initialize();
      }
    }
    
    return AudioManager.instance;
  }

  /**
   * Initialize audio manager with scene
   */
  private initialize(): void {
    try {
      if (!this.scene) {
        console.warn('AudioManager: No scene provided for initialization');
        return;
      }

      this.loadSettings();
      this.preloadSounds();
      this.isInitialized = true;
      
      console.log(`AudioManager initialized - Enabled: ${this.isEnabled}, Volume: ${this.volume}`);
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'audio-manager-init');
    }
  }

  /**
   * Load audio settings from storage
   */
  private loadSettings(): void {
    try {
      this.isEnabled = StorageManager.getAudioEnabled();
      this.volume = StorageManager.getAudioVolume();
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'load-audio-settings');
      // Use defaults
      this.isEnabled = true;
      this.volume = 0.7;
    }
  }

  /**
   * Preload and setup all game sounds
   */
  private preloadSounds(): void {
    if (!this.scene || !this.isEnabled) return;

    try {
      const soundKeys = ['jump', 'score', 'hit'];
      
      soundKeys.forEach(key => {
        try {
          if (this.scene!.cache.audio.exists(key)) {
            const sound = this.scene!.sound.add(key, { volume: this.volume });
            this.sounds.set(key, sound);
            console.log(`Audio loaded: ${key}`);
          } else {
            console.warn(`Audio file not found: ${key}`);
          }
        } catch (error) {
          console.warn(`Failed to load sound: ${key}`, error);
          ErrorHandler.handleAudioError(error as Error, key);
        }
      });
      
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'preload-sounds');
    }
  }

  /**
   * Play a sound by key
   */
  playSound(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.isEnabled || !this.scene) return;

    try {
      const sound = this.sounds.get(key);
      
      if (sound) {
        // Stop if already playing to prevent overlap
        if (sound.isPlaying) {
          sound.stop();
        }
        
        const playConfig = {
          volume: this.volume,
          ...config
        };
        
        sound.play(playConfig);
      } else {
        // Try to create sound on-the-fly if not preloaded
        this.createAndPlaySound(key, config);
      }
      
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, key);
    }
  }

  /**
   * Create and play sound if not preloaded
   */
  private createAndPlaySound(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.scene) return;

    try {
      if (this.scene.cache.audio.exists(key)) {
        const sound = this.scene.sound.add(key, { volume: this.volume });
        this.sounds.set(key, sound);
        
        const playConfig = {
          volume: this.volume,
          ...config
        };
        
        sound.play(playConfig);
      } else {
        console.warn(`Audio file not available: ${key}`);
      }
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, `create-${key}`);
    }
  }

  /**
   * Play jump sound
   */
  playJump(): void {
    this.playSound('jump', { volume: this.volume * 0.8 });
  }

  /**
   * Play score sound
   */
  playScore(): void {
    this.playSound('score', { volume: this.volume * 0.9 });
  }

  /**
   * Play hit/collision sound
   */
  playHit(): void {
    this.playSound('hit', { volume: this.volume * 1.0 });
  }

  /**
   * Play background music (if available)
   */
  playBackgroundMusic(): void {
    if (!this.isEnabled || !this.scene) return;

    try {
      const bgMusic = this.sounds.get('background');
      
      if (bgMusic) {
        if (!bgMusic.isPlaying) {
          bgMusic.play({
            loop: true,
            volume: this.volume * 0.3 // Background music should be quieter
          });
        }
      } else if (this.scene.cache.audio.exists('background')) {
        const music = this.scene.sound.add('background', {
          loop: true,
          volume: this.volume * 0.3
        });
        this.sounds.set('background', music);
        music.play();
      }
      
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'background-music');
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    try {
      const bgMusic = this.sounds.get('background');
      if (bgMusic && bgMusic.isPlaying) {
        bgMusic.stop();
      }
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'stop-background-music');
    }
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    try {
      // Validate volume range
      this.volume = Math.max(0, Math.min(1, volume));
      
      // Update all existing sounds
      this.sounds.forEach(sound => {
        if (sound.setVolume) {
          sound.setVolume(this.volume);
        }
      });
      
      // Save to storage
      StorageManager.setAudioVolume(this.volume);
      
      console.log(`Audio volume set to: ${this.volume}`);
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'set-volume');
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    try {
      const wasEnabled = this.isEnabled;
      this.isEnabled = enabled;
      
      if (!enabled) {
        // Stop all currently playing sounds
        this.stopAllSounds();
      } else if (!wasEnabled && enabled) {
        // Re-initialize sounds if enabling after being disabled
        this.preloadSounds();
      }
      
      // Save to storage
      StorageManager.setAudioEnabled(enabled);
      
      console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'set-enabled');
    }
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Stop all currently playing sounds
   */
  stopAllSounds(): void {
    try {
      this.sounds.forEach(sound => {
        if (sound.isPlaying) {
          sound.stop();
        }
      });
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'stop-all-sounds');
    }
  }

  /**
   * Pause all sounds
   */
  pauseAllSounds(): void {
    try {
      this.sounds.forEach(sound => {
        if (sound.isPlaying && sound.pause) {
          sound.pause();
        }
      });
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'pause-all-sounds');
    }
  }

  /**
   * Resume all paused sounds
   */
  resumeAllSounds(): void {
    try {
      this.sounds.forEach(sound => {
        if (sound.isPaused && sound.resume) {
          sound.resume();
        }
      });
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'resume-all-sounds');
    }
  }

  /**
   * Create fallback sounds using Web Audio API
   */
  private createFallbackSounds(): void {
    if (!this.scene || !this.isEnabled) return;

    try {
      // Create simple beep sounds as fallback
      this.createBeepSound('jump', 440, 0.1); // A4 note
      this.createBeepSound('score', 660, 0.2); // E5 note
      this.createBeepSound('hit', 220, 0.3); // A3 note
      
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'create-fallback-sounds');
    }
  }

  /**
   * Create a simple beep sound
   */
  private createBeepSound(key: string, frequency: number, duration: number): void {
    try {
      // This would require Web Audio API implementation
      // For now, we'll just log that fallback sounds would be created
      console.log(`Fallback sound created: ${key} (${frequency}Hz, ${duration}s)`);
      
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, `create-beep-${key}`);
    }
  }

  /**
   * Get audio system status
   */
  getStatus(): {
    enabled: boolean;
    volume: number;
    initialized: boolean;
    soundsLoaded: number;
    hasScene: boolean;
  } {
    return {
      enabled: this.isEnabled,
      volume: this.volume,
      initialized: this.isInitialized,
      soundsLoaded: this.sounds.size,
      hasScene: !!this.scene
    };
  }

  /**
   * Test audio system
   */
  testAudio(): void {
    try {
      console.log('Testing audio system...');
      console.log('Status:', this.getStatus());
      
      if (this.isEnabled) {
        // Test each sound with a small delay
        setTimeout(() => this.playJump(), 100);
        setTimeout(() => this.playScore(), 600);
        setTimeout(() => this.playHit(), 1100);
      }
      
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'test-audio');
    }
  }

  /**
   * Cleanup audio manager
   */
  destroy(): void {
    try {
      this.stopAllSounds();
      
      // Destroy all sounds
      this.sounds.forEach(sound => {
        if (sound.destroy) {
          sound.destroy();
        }
      });
      
      this.sounds.clear();
      this.scene = undefined;
      this.isInitialized = false;
      
      console.log('AudioManager destroyed');
    } catch (error) {
      ErrorHandler.handleAudioError(error as Error, 'audio-manager-destroy');
    }
  }
}