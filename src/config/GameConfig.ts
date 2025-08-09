import { GameConfig } from '../types/GameTypes';

// Main game configuration
export const GAME_CONFIG: GameConfig = {
  physics: {
    gravity: 1500,
    birdJumpForce: -400,
    pipeSpeed: -200
  },
  gameplay: {
    pipeGap: 200,
    pipeSpawnInterval: 1500,
    difficultyIncrease: false
  },
  visual: {
    canvasWidth: 800,
    canvasHeight: 600,
    backgroundColor: '#87CEEB'
  },
  audio: {
    enabled: true,
    volume: 0.7
  }
};

// Phaser game configuration
export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.visual.canvasWidth,
  height: GAME_CONFIG.visual.canvasHeight,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.visual.backgroundColor,
  physics: {
    default: 'arcade',
    arcade: {
  gravity: { x: 0, y: GAME_CONFIG.physics.gravity },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.visual.canvasWidth,
    height: GAME_CONFIG.visual.canvasHeight
  },
  render: {
    antialias: true,
    pixelArt: false
  }
};

// Asset paths configuration
export const ASSET_CONFIG = {
  images: {
    bird: 'assets/images/bird.png',
    pipe: 'assets/images/pipe.png',
    background: 'assets/images/background.png',
    ground: 'assets/images/ground.png',
    // Character skins
    birdYellow: 'assets/images/bird-yellow.png',
    birdBlue: 'assets/images/bird-blue.png',
    birdRed: 'assets/images/bird-red.png'
  },
  audio: {
    jump: 'assets/audio/jump.wav',
    score: 'assets/audio/score.wav',
    hit: 'assets/audio/hit.wav',
    background: 'assets/audio/background.mp3'
  }
};

// Game constants
export const GAME_CONSTANTS = {
  BIRD_START_X: 100,
  BIRD_START_Y: 300,
  PIPE_WIDTH: 80,
  GROUND_HEIGHT: 50,
  SCORE_FONT_SIZE: 32,
  UI_FONT_SIZE: 24,
  PIPE_SPAWN_X: 800,
  BIRD_SCALE: 0.5,
  PIPE_SCALE: 0.5
};