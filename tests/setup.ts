// Jest setup file
import 'jest-environment-jsdom';

// Mock Phaser
global.Phaser = {
  Scene: class MockScene {
    add = {
      text: jest.fn(),
      image: jest.fn(),
      sprite: jest.fn(),
      graphics: jest.fn(),
      rectangle: jest.fn(),
      tileSprite: jest.fn(),
      container: jest.fn()
    };
    physics = {
      add: {
        sprite: jest.fn(),
        existing: jest.fn()
      }
    };
    input = {
      on: jest.fn(),
      keyboard: {
        on: jest.fn()
      }
    };
    cameras = {
      main: {
        width: 800,
        height: 600
      }
    };
    tweens = {
      add: jest.fn(),
      killAll: jest.fn(),
      getAllTweens: jest.fn(() => [])
    };
    time = {
      now: Date.now(),
      delayedCall: jest.fn()
    };
    scene = {
      start: jest.fn()
    };
    children = {
      list: []
    };
  },
  Physics: {
    Arcade: {
      Sprite: class MockSprite {
        constructor(scene: any, x: number, y: number, texture: string) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.texture = texture;
        }
        setScale = jest.fn().mockReturnThis();
        setOrigin = jest.fn().mockReturnThis();
        setDepth = jest.fn().mockReturnThis();
        setVisible = jest.fn().mockReturnThis();
        setActive = jest.fn().mockReturnThis();
        setPosition = jest.fn().mockReturnThis();
        setTexture = jest.fn().mockReturnThis();
        setAlpha = jest.fn().mockReturnThis();
        setRotation = jest.fn().mockReturnThis();
        destroy = jest.fn();
        getBounds = jest.fn(() => ({ x: 0, y: 0, width: 32, height: 24 }));
      }
    }
  },
  GameObjects: {
    TileSprite: class MockTileSprite {
      tilePositionX = 0;
      setOrigin = jest.fn().mockReturnThis();
      setDepth = jest.fn().mockReturnThis();
    }
  },
  Geom: {
    Rectangle: class MockRectangle {
      constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }
    }
  },
  Math: {
    Between: jest.fn((min, max) => Math.floor(Math.random() * (max - min + 1)) + min)
  }
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    jsHeapSizeLimit: 10000000
  }
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});