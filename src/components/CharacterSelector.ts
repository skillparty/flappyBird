import { Character } from '../types/GameTypes';
import StorageManager from '../managers/StorageManager';
import AssetManager from '../managers/AssetManager';
import ErrorHandler from '../managers/ErrorHandler';

export default class CharacterSelector {
  private scene: Phaser.Scene;
  private characters: Character[] = [];
  private selectedCharacterId: string = 'bird';
  private selectorContainer?: Phaser.GameObjects.Container;
  private characterSprites: Phaser.GameObjects.Sprite[] = [];
  private selectionIndicator?: Phaser.GameObjects.Graphics;
  private onSelectionChange?: (character: Character) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeCharacters();
    this.loadSelectedCharacter();
  }

  /**
   * Initialize available characters
   */
  private initializeCharacters(): void {
    try {
      this.characters = [
        {
          id: 'bird',
          name: 'Pájaro Clásico',
          texture: 'bird',
          unlocked: true
        },
        {
          id: 'birdYellow',
          name: 'Pájaro Dorado',
          texture: 'birdYellow',
          unlocked: true
        },
        {
          id: 'birdBlue',
          name: 'Pájaro Azul',
          texture: 'birdBlue',
          unlocked: true
        },
        {
          id: 'birdRed',
          name: 'Pájaro Rojo',
          texture: 'birdRed',
          unlocked: true
        }
      ];
      
      console.log(`Character selector initialized with ${this.characters.length} characters`);
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-selector-init');
    }
  }

  /**
   * Load selected character from storage
   */
  private loadSelectedCharacter(): void {
    try {
      this.selectedCharacterId = StorageManager.getSelectedCharacter();
      
      // Validate that the character exists and is unlocked
      const character = this.characters.find(c => c.id === this.selectedCharacterId);
      if (!character || !character.unlocked) {
        this.selectedCharacterId = 'bird'; // Fallback to default
        StorageManager.setSelectedCharacter(this.selectedCharacterId);
      }
      
      console.log(`Selected character loaded: ${this.selectedCharacterId}`);
    } catch (error) {
      ErrorHandler.handleStorageError(error as Error, 'load-selected-character');
      this.selectedCharacterId = 'bird';
    }
  }

  /**
   * Create character selection UI
   */
  createSelector(x: number, y: number): void {
    try {
      // Create container for the selector
      this.selectorContainer = this.scene.add.container(x, y);
      this.selectorContainer.setDepth(100);
      
      // Create title
      const title = this.scene.add.text(0, -80, 'Selecciona tu Personaje', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      
      this.selectorContainer.add(title);
      
      // Create character display area
      this.createCharacterDisplay();
      
      // Create navigation buttons
      this.createNavigationButtons();
      
      // Create selection indicator
      this.createSelectionIndicator();
      
      // Update display to show current selection
      this.updateDisplay();
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-selector-create');
    }
  }

  /**
   * Create character display sprites
   */
  private createCharacterDisplay(): void {
    if (!this.selectorContainer) return;

    try {
      const assetManager = AssetManager.getInstance(this.scene);
      
      // Clear existing sprites
      this.characterSprites.forEach(sprite => sprite.destroy());
      this.characterSprites = [];
      
      // Create sprites for each character
      this.characters.forEach((character, index) => {
        const offsetX = (index - 1.5) * 80; // Center the characters
        
        // Get texture key (with fallback)
        const textureKey = assetManager.getAssetKey(character.texture);
        
        // Create character sprite
        const sprite = this.scene.add.sprite(offsetX, -20, textureKey);
        sprite.setScale(0.8);
        sprite.setDepth(10);
        
        // Add glow effect for unlocked characters
        if (character.unlocked) {
          sprite.setTint(0xFFFFFF);
        } else {
          sprite.setTint(0x666666); // Gray out locked characters
          sprite.setAlpha(0.5);
        }
        
        // Make interactive if unlocked
        if (character.unlocked) {
          sprite.setInteractive({ useHandCursor: true });
          
          sprite.on('pointerover', () => {
            sprite.setScale(0.9);
            this.showCharacterInfo(character);
          });
          
          sprite.on('pointerout', () => {
            sprite.setScale(0.8);
            this.hideCharacterInfo();
          });
          
          sprite.on('pointerdown', () => {
            this.selectCharacter(character.id);
          });
        }
        
        this.characterSprites.push(sprite);
        this.selectorContainer!.add(sprite);
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-display-create');
    }
  }

  /**
   * Create navigation buttons
   */
  private createNavigationButtons(): void {
    if (!this.selectorContainer) return;

    try {
      // Previous button
      const prevButton = this.scene.add.text(-150, -20, '◀', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#34495E',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      
      prevButton.setInteractive({ useHandCursor: true });
      prevButton.on('pointerdown', () => this.selectPreviousCharacter());
      
      // Next button
      const nextButton = this.scene.add.text(150, -20, '▶', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#34495E',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      
      nextButton.setInteractive({ useHandCursor: true });
      nextButton.on('pointerdown', () => this.selectNextCharacter());
      
      this.selectorContainer.add([prevButton, nextButton]);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-navigation-create');
    }
  }

  /**
   * Create selection indicator
   */
  private createSelectionIndicator(): void {
    if (!this.selectorContainer) return;

    try {
      this.selectionIndicator = this.scene.add.graphics();
      this.selectionIndicator.setDepth(5);
      this.selectorContainer.add(this.selectionIndicator);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-indicator-create');
    }
  }

  /**
   * Update display to show current selection
   */
  private updateDisplay(): void {
    try {
      if (!this.selectionIndicator) return;
      
      // Find selected character index
      const selectedIndex = this.characters.findIndex(c => c.id === this.selectedCharacterId);
      if (selectedIndex === -1) return;
      
      // Clear previous indicator
      this.selectionIndicator.clear();
      
      // Draw selection indicator
      const offsetX = (selectedIndex - 1.5) * 80;
      this.selectionIndicator.lineStyle(3, 0x00FF00);
      this.selectionIndicator.strokeRoundedRect(offsetX - 25, -45, 50, 50, 5);
      
      // Add selection glow
      this.selectionIndicator.lineStyle(1, 0x00FF00, 0.5);
      this.selectionIndicator.strokeRoundedRect(offsetX - 30, -50, 60, 60, 8);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-display-update');
    }
  }

  /**
   * Select a character by ID
   */
  selectCharacter(characterId: string): void {
    try {
      const character = this.characters.find(c => c.id === characterId);
      
      if (!character) {
        console.warn(`Character not found: ${characterId}`);
        return;
      }
      
      if (!character.unlocked) {
        console.warn(`Character not unlocked: ${characterId}`);
        return;
      }
      
      // Update selection
      this.selectedCharacterId = characterId;
      
      // Save to storage
      StorageManager.setSelectedCharacter(characterId);
      
      // Update display
      this.updateDisplay();
      
      // Trigger callback
      if (this.onSelectionChange) {
        this.onSelectionChange(character);
      }
      
      console.log(`Character selected: ${character.name}`);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-select');
    }
  }

  /**
   * Select previous character
   */
  private selectPreviousCharacter(): void {
    try {
      const currentIndex = this.characters.findIndex(c => c.id === this.selectedCharacterId);
      const unlockedCharacters = this.characters.filter(c => c.unlocked);
      const currentUnlockedIndex = unlockedCharacters.findIndex(c => c.id === this.selectedCharacterId);
      
      if (currentUnlockedIndex > 0) {
        const prevCharacter = unlockedCharacters[currentUnlockedIndex - 1];
        this.selectCharacter(prevCharacter.id);
      } else {
        // Wrap to last unlocked character
        const lastCharacter = unlockedCharacters[unlockedCharacters.length - 1];
        this.selectCharacter(lastCharacter.id);
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-select-previous');
    }
  }

  /**
   * Select next character
   */
  private selectNextCharacter(): void {
    try {
      const unlockedCharacters = this.characters.filter(c => c.unlocked);
      const currentUnlockedIndex = unlockedCharacters.findIndex(c => c.id === this.selectedCharacterId);
      
      if (currentUnlockedIndex < unlockedCharacters.length - 1) {
        const nextCharacter = unlockedCharacters[currentUnlockedIndex + 1];
        this.selectCharacter(nextCharacter.id);
      } else {
        // Wrap to first unlocked character
        const firstCharacter = unlockedCharacters[0];
        this.selectCharacter(firstCharacter.id);
      }
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-select-next');
    }
  }

  /**
   * Show character information
   */
  private showCharacterInfo(character: Character): void {
    if (!this.selectorContainer) return;

    try {
      // Remove existing info
      this.hideCharacterInfo();
      
      // Create info text
      const infoText = this.scene.add.text(0, 60, character.name, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      
      infoText.setData('characterInfo', true);
      this.selectorContainer.add(infoText);
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-info-show');
    }
  }

  /**
   * Hide character information
   */
  private hideCharacterInfo(): void {
    if (!this.selectorContainer) return;

    try {
      // Remove info elements
      const children = this.selectorContainer.list.slice();
      children.forEach(child => {
        if (child.getData('characterInfo')) {
          child.destroy();
        }
      });
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-info-hide');
    }
  }

  /**
   * Get currently selected character
   */
  getSelectedCharacter(): Character {
    const character = this.characters.find(c => c.id === this.selectedCharacterId);
    return character || this.characters[0]; // Fallback to first character
  }

  /**
   * Get selected character texture key
   */
  getSelectedTexture(): string {
    const character = this.getSelectedCharacter();
    const assetManager = AssetManager.getInstance(this.scene);
    return assetManager.getAssetKey(character.texture);
  }

  /**
   * Unlock a character
   */
  unlockCharacter(characterId: string): boolean {
    try {
      const character = this.characters.find(c => c.id === characterId);
      
      if (!character) {
        console.warn(`Character not found for unlock: ${characterId}`);
        return false;
      }
      
      if (character.unlocked) {
        console.log(`Character already unlocked: ${characterId}`);
        return true;
      }
      
      character.unlocked = true;
      
      // Recreate display to show newly unlocked character
      if (this.selectorContainer) {
        this.createCharacterDisplay();
        this.updateDisplay();
      }
      
      console.log(`Character unlocked: ${character.name}`);
      return true;
      
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-unlock');
      return false;
    }
  }

  /**
   * Set selection change callback
   */
  setOnSelectionChange(callback: (character: Character) => void): void {
    this.onSelectionChange = callback;
  }

  /**
   * Show selector
   */
  show(): void {
    if (this.selectorContainer) {
      this.selectorContainer.setVisible(true);
    }
  }

  /**
   * Hide selector
   */
  hide(): void {
    if (this.selectorContainer) {
      this.selectorContainer.setVisible(false);
    }
  }

  /**
   * Get all characters
   */
  getAllCharacters(): Character[] {
    return [...this.characters];
  }

  /**
   * Get unlocked characters
   */
  getUnlockedCharacters(): Character[] {
    return this.characters.filter(c => c.unlocked);
  }

  /**
   * Cleanup character selector
   */
  destroy(): void {
    try {
      this.hideCharacterInfo();
      
      if (this.selectorContainer) {
        this.selectorContainer.destroy();
        this.selectorContainer = undefined;
      }
      
      this.characterSprites = [];
      this.selectionIndicator = undefined;
      this.onSelectionChange = undefined;
      
      console.log('Character selector destroyed');
    } catch (error) {
      ErrorHandler.handleGameplayError(error as Error, 'character-selector-destroy');
    }
  }
}