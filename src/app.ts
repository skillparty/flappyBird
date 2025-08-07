import 'phaser';
import { PHASER_CONFIG } from './config/GameConfig';
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Menu from './scenes/Menu';
import Game from './scenes/Game';
import GameOver from './scenes/GameOver';

// Enhanced Phaser configuration with scene management
const gameConfig: Phaser.Types.Core.GameConfig = {
  ...PHASER_CONFIG,
  scene: [Boot, Preload, Menu, Game, GameOver]
};

// Initialize the game
const game = new Phaser.Game(gameConfig);

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

export default game;
