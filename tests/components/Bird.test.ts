import Bird from '../../src/components/Bird';
import { BirdConfig, BirdState } from '../../src/types/GameTypes';

describe('Bird Component', () => {
  let mockScene: any;
  let birdConfig: BirdConfig;
  let bird: Bird;

  beforeEach(() => {
    // Create mock scene
    mockScene = {
      add: {
        existing: jest.fn()
      },
      physics: {
        add: {
          existing: jest.fn()
        }
      },
      tweens: {
        add: jest.fn()
      },
      time: {
        now: 1000
      }
    };

    birdConfig = {
      x: 100,
      y: 300,
      texture: 'bird',
      jumpForce: -400,
      maxRotation: 30
    };

    bird = new Bird(mockScene, birdConfig);
  // Ensure outline disabled for tests to avoid graphics side-effects
  bird.setOutlineVisible(false);
  });

  afterEach(() => {
    if (bird) {
      bird.destroy();
    }
  });

  describe('Initialization', () => {
    test('should create bird with correct configuration', () => {
  expect((bird as any).x).toBe(100);
  expect((bird as any).y).toBe(300);
  expect((bird as any).texture.key).toBe('bird');
  expect((bird as any).state).toBeDefined();
    });

    test('should add bird to scene', () => {
      expect(mockScene.add.existing).toHaveBeenCalledWith(bird);
      expect(mockScene.physics.add.existing).toHaveBeenCalledWith(bird);
    });

    test('should be alive initially', () => {
      expect(bird.getIsAlive()).toBe(true);
    });
  });

  describe('Jump Mechanics', () => {
    test('should jump when alive', () => {
      // Mock body
  (bird as any).body = {
        setVelocityY: jest.fn()
      } as any;

      bird.jump();
  expect((bird as any).body.setVelocityY).toHaveBeenCalledWith(-400);
  // State should become JUMP briefly
  expect((bird as any).state).toBe(BirdState.JUMP);
    });

    test('should not jump when dead', () => {
      bird.body = {
        setVelocityY: jest.fn()
      } as any;

      bird.die();
      bird.jump();
  expect(((bird as any).body.setVelocityY)).not.toHaveBeenCalled();
    });

    test('should respect jump cooldown', () => {
      bird.body = {
        setVelocityY: jest.fn()
      } as any;

      mockScene.time.now = 1000;
      bird.jump();
  expect(((bird as any).body.setVelocityY)).toHaveBeenCalledTimes(1);

      // Try to jump again immediately (within cooldown)
      mockScene.time.now = 1050;
      bird.jump();
  expect(((bird as any).body.setVelocityY)).toHaveBeenCalledTimes(1); // Should not increase

      // Jump after cooldown
      mockScene.time.now = 1200;
      bird.jump();
  expect(((bird as any).body.setVelocityY)).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rotation', () => {
    test('should update rotation based on velocity', () => {
      bird.body = {
        velocity: { y: 200 }
      } as any;
      bird.setRotation = jest.fn();

      bird.updateRotation();
      expect(bird.setRotation).toHaveBeenCalled();
    });

    test('should not update rotation when dead', () => {
      bird.body = {
        velocity: { y: 200 }
      } as any;
      bird.setRotation = jest.fn();

      bird.die();
      bird.updateRotation();
      expect(bird.setRotation).not.toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    test('should reset to initial position and state', () => {
      bird.setPosition = jest.fn();
      bird.setRotation = jest.fn();
      bird.setScale = jest.fn();
      bird.setAlpha = jest.fn();
      bird.body = {
        setVelocity: jest.fn(),
        setAcceleration: jest.fn()
      } as any;

      bird.die();
      expect(bird.getIsAlive()).toBe(false);

      bird.reset();
      expect(bird.getIsAlive()).toBe(true);
      expect(bird.setPosition).toHaveBeenCalledWith(100, 300);
      expect(bird.setRotation).toHaveBeenCalledWith(0);
      expect(bird.setAlpha).toHaveBeenCalledWith(1);
    });
  });

  describe('Death Mechanics', () => {
    test('should die and become inactive', () => {
      expect(bird.getIsAlive()).toBe(true);
      
      bird.die();
      expect(bird.getIsAlive()).toBe(false);
    });

    test('should stop physics on death', () => {
  (bird as any).body = {
        setVelocity: jest.fn()
      } as any;

      bird.die();
  expect(((bird as any).body.setVelocity)).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('Character Texture', () => {
    test('should change character texture', () => {
      bird.setTexture = jest.fn();
      mockScene.textures = {
        exists: jest.fn().mockReturnValue(true)
      };

      bird.setCharacterTexture('birdBlue');
      expect(bird.setTexture).toHaveBeenCalledWith('birdBlue');
    });

    test('should not change to non-existent texture', () => {
      bird.setTexture = jest.fn();
      mockScene.textures = {
        exists: jest.fn().mockReturnValue(false)
      };

      bird.setCharacterTexture('nonExistent');
      expect(bird.setTexture).not.toHaveBeenCalled();
    });
  });

  describe('Velocity', () => {
    test('should return current velocity', () => {
      bird.body = {
        velocity: { x: 0, y: -200 }
      } as any;

      const velocity = bird.getVelocity();
      expect(velocity).toEqual({ x: 0, y: -200 });
    });

    test('should return zero velocity when no body', () => {
      bird.body = null;
      const velocity = bird.getVelocity();
      expect(velocity).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Update Loop', () => {
    test('should update when alive', () => {
      bird.updateRotation = jest.fn();
      bird.update();
      expect(bird.updateRotation).toHaveBeenCalled();
    });

    test('should not update when dead', () => {
      bird.updateRotation = jest.fn();
      bird.die();
      bird.update();
      expect(bird.updateRotation).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing body gracefully', () => {
      bird.body = null;
      
      expect(() => {
        bird.jump();
        bird.updateRotation();
        bird.update();
      }).not.toThrow();
    });

    test('should handle scene errors gracefully', () => {
      // Mock scene methods to throw errors
      mockScene.tweens.add = jest.fn(() => {
        throw new Error('Tween error');
      });

      expect(() => {
        bird.jump();
      }).not.toThrow();
    });
  });
});