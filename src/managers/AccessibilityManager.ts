import ErrorHandler from './ErrorHandler';

export default class AccessibilityManager {
  private static instance: AccessibilityManager;
  private announcementElement?: HTMLElement;
  private gameContainer?: HTMLElement;
  private isHighContrast: boolean = false;
  private isReducedMotion: boolean = false;

  private constructor() {
    this.detectAccessibilityPreferences();
    this.setupAnnouncementElement();
    this.setupKeyboardNavigation();
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  /**
   * Detect user accessibility preferences
   */
  private detectAccessibilityPreferences(): void {
    try {
      // Check for high contrast preference
      this.isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Check for reduced motion preference
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Listen for changes
      window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
        this.isHighContrast = e.matches;
        this.applyHighContrastMode();
      });
      
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
        this.applyReducedMotionMode();
      });
      
      console.log(`Accessibility preferences - High contrast: ${this.isHighContrast}, Reduced motion: ${this.isReducedMotion}`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'accessibility-preferences');
    }
  }

  /**
   * Setup announcement element for screen readers
   */
  private setupAnnouncementElement(): void {
    try {
      this.announcementElement = document.getElementById('game-announcements');
      this.gameContainer = document.getElementById('game-container');
      
      if (!this.announcementElement) {
        console.warn('Game announcements element not found');
      }
      
      if (this.gameContainer) {
        // Ensure game container is focusable
        this.gameContainer.setAttribute('tabindex', '0');
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'accessibility-setup');
    }
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    try {
      // Add keyboard event listeners
      document.addEventListener('keydown', (event) => {
        this.handleKeyboardNavigation(event);
      });
      
      // Focus management
      document.addEventListener('focusin', (event) => {
        this.handleFocusChange(event);
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'keyboard-navigation-setup');
    }
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    try {
      // Skip if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.key) {
        case 'Tab':
          // Let default tab behavior work, but ensure proper focus management
          this.ensureFocusVisibility();
          break;
          
        case 'Escape':
          // Return focus to game container
          if (this.gameContainer) {
            this.gameContainer.focus();
          }
          break;
          
        case 'Enter':
        case ' ':
          // These are handled by the game, but we can announce actions
          if (document.activeElement === this.gameContainer) {
            this.announce('Pájaro saltando');
          }
          break;
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'keyboard-navigation');
    }
  }

  /**
   * Handle focus changes
   */
  private handleFocusChange(event: FocusEvent): void {
    try {
      const target = event.target as HTMLElement;
      
      // Ensure focused elements are visible
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'focus-change');
    }
  }

  /**
   * Ensure focus is visible
   */
  private ensureFocusVisibility(): void {
    try {
      // Add focus indicators if not already present
      const focusedElement = document.activeElement as HTMLElement;
      if (focusedElement && !focusedElement.classList.contains('focus-visible')) {
        focusedElement.style.outline = '2px solid #3B82F6';
        focusedElement.style.outlineOffset = '2px';
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'focus-visibility');
    }
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    try {
      if (!this.announcementElement) return;
      
      // Set the aria-live priority
      this.announcementElement.setAttribute('aria-live', priority);
      
      // Clear and set new message
      this.announcementElement.textContent = '';
      setTimeout(() => {
        if (this.announcementElement) {
          this.announcementElement.textContent = message;
        }
      }, 100);
      
      console.log(`Screen reader announcement (${priority}): ${message}`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'screen-reader-announcement');
    }
  }

  /**
   * Announce game state changes
   */
  announceGameState(state: 'started' | 'paused' | 'resumed' | 'over', additionalInfo?: string): void {
    try {
      let message = '';
      
      switch (state) {
        case 'started':
          message = 'Juego iniciado. Usa ESPACIO para saltar.';
          break;
        case 'paused':
          message = 'Juego pausado. Presiona ESC para continuar.';
          break;
        case 'resumed':
          message = 'Juego reanudado.';
          break;
        case 'over':
          message = `Juego terminado. ${additionalInfo || ''}`;
          break;
      }
      
      this.announce(message, 'assertive');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'game-state-announcement');
    }
  }

  /**
   * Announce score changes
   */
  announceScore(score: number, isNewHighScore: boolean = false): void {
    try {
      let message = `Puntuación: ${score}`;
      
      if (isNewHighScore) {
        message += '. ¡Nuevo récord!';
      }
      
      this.announce(message, 'polite');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'score-announcement');
    }
  }

  /**
   * Apply high contrast mode
   */
  private applyHighContrastMode(): void {
    try {
      const body = document.body;
      
      if (this.isHighContrast) {
        body.classList.add('high-contrast');
        console.log('High contrast mode enabled');
      } else {
        body.classList.remove('high-contrast');
        console.log('High contrast mode disabled');
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'high-contrast-mode');
    }
  }

  /**
   * Apply reduced motion mode
   */
  private applyReducedMotionMode(): void {
    try {
      const body = document.body;
      
      if (this.isReducedMotion) {
        body.classList.add('reduced-motion');
        console.log('Reduced motion mode enabled');
      } else {
        body.classList.remove('reduced-motion');
        console.log('Reduced motion mode disabled');
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'reduced-motion-mode');
    }
  }

  /**
   * Get accessibility preferences
   */
  getPreferences(): {
    highContrast: boolean;
    reducedMotion: boolean;
  } {
    return {
      highContrast: this.isHighContrast,
      reducedMotion: this.isReducedMotion
    };
  }

  /**
   * Set focus to game container
   */
  focusGame(): void {
    try {
      if (this.gameContainer) {
        this.gameContainer.focus();
        this.announce('Enfoque en el área de juego. Usa ESPACIO para saltar.');
      }
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'focus-game');
    }
  }

  /**
   * Create accessible button
   */
  createAccessibleButton(text: string, onClick: () => void, ariaLabel?: string): HTMLButtonElement {
    try {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = 'game-button';
      button.setAttribute('type', 'button');
      
      if (ariaLabel) {
        button.setAttribute('aria-label', ariaLabel);
      }
      
      button.addEventListener('click', onClick);
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      });
      
      return button;
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'create-accessible-button');
      
      // Fallback button
      const fallbackButton = document.createElement('button');
      fallbackButton.textContent = text;
      fallbackButton.addEventListener('click', onClick);
      return fallbackButton;
    }
  }

  /**
   * Update page title with game state
   */
  updatePageTitle(gameState?: string, score?: number): void {
    try {
      let title = 'Flappy Bird - Clon Profesional';
      
      if (gameState && score !== undefined) {
        title = `${title} - ${gameState} (Puntuación: ${score})`;
      } else if (gameState) {
        title = `${title} - ${gameState}`;
      }
      
      document.title = title;
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'update-page-title');
    }
  }

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return this.isReducedMotion;
  }

  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast(): boolean {
    return this.isHighContrast;
  }

  /**
   * Cleanup accessibility manager
   */
  destroy(): void {
    try {
      // Remove event listeners would go here
      // For now, just clear references
      this.announcementElement = undefined;
      this.gameContainer = undefined;
      
      console.log('Accessibility manager destroyed');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'accessibility-destroy');
    }
  }
}