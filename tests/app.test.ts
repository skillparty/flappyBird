// Minimal runtime mock of Phaser so the game config can be constructed without the full engine.
jest.mock('phaser', () => {
  class Game {
    public config: any;
    constructor(config: any) {
      this.config = config;
    }
  }
  return {
    AUTO: 0,
    Game,
    Scale: { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' },
    Math: { Between: (a: number) => a, FloatBetween: (a: number) => a },
    Physics: { Arcade: { Sprite: class {}, Group: class {}, Body: class {} } },
    Types: { Core: {} }
  };
});

import game from '../src/app';

describe('App bootstrap', () => {
  test('exports a Phaser.Game instance stub with expected size', () => {
    expect((game as any).config.width).toBe(800);
    expect((game as any).config.height).toBe(600);
  });

  test('has arcade physics enabled with gravity set', () => {
    const physics = (game as any).config.physics;
    expect(physics.default).toBe('arcade');
    expect(physics.arcade.gravity.y).toBeGreaterThan(0);
  });
});
