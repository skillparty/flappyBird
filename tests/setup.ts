// Jest setup file
import 'jest-environment-jsdom';
// Mock module import for 'phaser' to use our global stub
jest.mock('phaser', () => (global as any).Phaser || {});

// Mock Phaser
global.Phaser = {
  Scale: { FIT: 0, CENTER_BOTH: 0 },
  Scene: class MockScene {
    add = {
      text: jest.fn(),
      image: jest.fn(),
      sprite: jest.fn(),
      graphics: jest.fn(() => ({
        clear: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRect: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      })),
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
        scene: any; x: number; y: number; texture: any; width: number = 32; height: number = 24; originX=0.5; originY=0.5; displayWidth=32; displayHeight=24; rotation=0;
        body: any = { velocity: { x:0, y:0 }, setVelocityY: jest.fn(), setVelocity: jest.fn(), setAcceleration: jest.fn(), setAllowGravity: jest.fn(), setMaxVelocity: jest.fn(), setSize: jest.fn(), setOffset: jest.fn() };
        constructor(scene: any, x: number, y: number, texture: string) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.texture = { key: texture };
        }
        setScale = jest.fn().mockReturnThis();
        setOrigin = jest.fn().mockImplementation((x?:number,y?:number)=>{ if(x!==undefined) this.originX=x; if(y!==undefined) this.originY=y; return this; });
        setDepth = jest.fn().mockReturnThis();
        setVisible = jest.fn().mockReturnThis();
        setActive = jest.fn().mockReturnThis();
        setPosition = jest.fn().mockImplementation((x:number,y:number)=>{ this.x=x; this.y=y; return this; });
        setTexture = jest.fn().mockImplementation((t:string)=>{ this.texture.key=t; return this; });
        setAlpha = jest.fn().mockReturnThis();
        setRotation = jest.fn().mockImplementation((r:number)=>{ this.rotation=r; return this; });
        setTint = jest.fn().mockReturnThis();
        clearTint = jest.fn().mockReturnThis();
        destroy = jest.fn();
        getBounds = jest.fn(() => ({ x: this.x, y: this.y, width: this.width, height: this.height }));
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
    Rectangle: class MockRectangle { x:number; y:number; width:number; height:number;
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
const localStorageMock: any = {
  store: {} as Record<string,string>,
  getItem: jest.fn((k:string) => localStorageMock.store[k] ?? null),
  setItem: jest.fn((k:string,v:string) => { localStorageMock.store[k]=v; }),
  removeItem: jest.fn((k:string)=> { delete localStorageMock.store[k]; }),
  clear: jest.fn(()=> { localStorageMock.store = {}; })
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

// Ensure localStorage property is our mock (some environments define it read-only)
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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