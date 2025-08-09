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

// Bird state machine
export enum BirdState {
  IDLE = 'IDLE',
  JUMP = 'JUMP',
  FALL = 'FALL',
  HIT = 'HIT',
  DEAD = 'DEAD'
}

// Pipe variants
export enum PipeVariant {
  STATIC = 'STATIC',
  OSCILLATING = 'OSCILLATING',
  NARROW = 'NARROW',
  DOUBLE = 'DOUBLE',
  DECORATED = 'DECORATED'
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

// Difficulty settings returned per score tier
export interface DifficultySettings {
  speed: number; // negative (leftward) speed
  gap: number; // current gap size
  allowedVariants: PipeVariant[];
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

// Skin definition (can later include pipe tint & theme assets)
export interface Skin {
  id: string;
  name: string;
  birdTexture: string;
  scale?: number;
  hitboxShrink?: number; // 0..1 factor to shrink hitbox for accessibility
  pipeTint?: number; // optional tint applied to pipes
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

// Telemetry events to balance design
export interface TelemetryEvent {
  timestamp: number;
  type: 'collision' | 'pass' | 'spawn';
  pipeVariant?: PipeVariant;
  gap?: number;
  speed?: number;
  birdVelocityY?: number;
  scoreAtEvent?: number;
}

export interface TelemetrySnapshot {
  events: TelemetryEvent[];
  collisionsByVariant: Record<string, number>;
}