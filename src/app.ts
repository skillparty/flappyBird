import 'phaser';
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Menu from './scenes/Menu';
import Game from './scenes/Game';
import GameOver from './scenes/GameOver';

// Stable game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [Boot, Preload, Menu, Game, GameOver],
  render: {
    antialias: true,
    pixelArt: false
  }
};

// Initialize the game
const game = new Phaser.Game(config);

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

export default game;
