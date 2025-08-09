import 'phaser';
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import Menu from './scenes/Menu';
import Game from './scenes/Game';
import ArcadeGame from './scenes/ArcadeGame';
import { PHASER_CONFIG } from './config/GameConfig';

// Multi-scene game config. Retains legacy app.ts separately until migration complete.
const config: Phaser.Types.Core.GameConfig = {
  ...PHASER_CONFIG,
  scene: [Boot, Preload, Menu, Game, ArcadeGame]
};

export const multiSceneGame = new Phaser.Game(config);
(window as any).flappyGame = multiSceneGame;
console.log('[MultiScene] Game initialized with scenes: Boot -> Preload -> Menu -> Game | ArcadeGame');
