// Core game configuration interfaces
export interface GameConfig {
  physics: {
    gravity: number;
    birdJumpForce: number;
    pipeSpeed: number;
  };
  gameplay: {
    pipeGap: number;
    pipeSpawnInterval: number;
    difficultyIncrease: boolean;
  };
  visual: {
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: string;
  };
  audio: {
    enabled: boolean;
    volume: number;
  };
}

// Game state management
export interface GameState {
  currentScore: number;
  highScore: number;
  selectedCharacter: string;
  audioEnabled: boolean;
  audioVolume: number;
  gamesPlayed: number;
}

// Bird component configuration
export interface BirdConfig {
  x: number;
  y: number;
  texture: string;
  jumpForce: number;
  maxRotation: number;
}

// Pipe system configuration
export interface PipeConfig {
  speed: number;
  gap: number;
  spawnInterval: number;
  minHeight: number;
  maxHeight: number;
}

// Score data structure
export interface ScoreData {
  current: number;
  high: number;
  session: number;
}

// Audio system configuration
export interface AudioConfig {
  jump: string;
  score: string;
  hit: string;
  background?: string;
  volume: number;
}

// Character selection system
export interface Character {
  id: string;
  name: string;
  texture: string;
  unlocked: boolean;
}

// Asset manifest for loading
export interface AssetManifest {
  images: {
    [key: string]: {
      path: string;
      frameWidth?: number;
      frameHeight?: number;
    };
  };
  audio: {
    [key: string]: {
      path: string;
      volume?: number;
    };
  };
  fonts: {
    [key: string]: string;
  };
}

// Scene data passing
export interface SceneData {
  score?: number;
  isNewHighScore?: boolean;
  selectedCharacter?: string;
}