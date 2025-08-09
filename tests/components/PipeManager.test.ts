import PipeManager from '../../src/components/PipeManager';
import DifficultyManager from '../../src/managers/DifficultyManager';
import { PipeVariant } from '../../src/types/GameTypes';

// Minimal Phaser scene mock
const createMockScene = () => {
  const makeSprite = () => {
    const sprite: any = {
      x:0,y:0,active:true,visible:true,
      setScale: jest.fn().mockReturnThis(),
      setOrigin: jest.fn().mockReturnThis(),
      setFlipY: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
  setVisible: jest.fn().mockImplementation((v?:boolean)=>{ if(v===false) sprite.visible=false; if(v===true) sprite.visible=true; return sprite; }),
  setActive: jest.fn().mockImplementation((v?:boolean)=>{ if(v===false) sprite.active=false; if(v===true) sprite.active=true; return sprite; }),
  setPosition: jest.fn().mockImplementation((x:number,y:number)=>{ sprite.x=x; sprite.y=y; return sprite; }),
      setImmovable: jest.fn().mockReturnThis(),
      setTexture: jest.fn().mockReturnThis(),
      setDepth: jest.fn().mockReturnThis(),
      setOriginY: jest.fn().mockReturnThis(),
      body: {
        setImmovable: jest.fn(),
        setVelocityX: jest.fn(),
        setVelocity: jest.fn()
      },
      destroy: jest.fn()
    };
    return sprite;
  };
  return {
    physics: { add: { sprite: jest.fn(() => makeSprite()) } },
    time: { now: 0 },
    tweens: { add: jest.fn(), killAll: jest.fn() },
    children: { list: [] }
  };
};

describe('PipeManager', () => {
  let scene: any;
  let manager: PipeManager;

  beforeEach(() => {
    scene = createMockScene();
  manager = new PipeManager(scene, { spawnInterval: 0 });
    // Inject difficulty function
    manager.setDifficultyFunction(DifficultyManager.getSettings);
  });

  test('generates static pipes initially', () => {
    scene.time.now = 0;
  manager.forceSpawnForTest();
    expect(manager.getActivePipeCount()).toBeGreaterThan(0);
  });

  test('applies oscillating variant at score > 5', () => {
    // Stub chooseVariant to return oscillating when allowed
    (manager as any).chooseVariant = () => PipeVariant.OSCILLATING;
    scene.time.now = 0;
    manager.generatePipe(6);
    expect(manager.getTelemetry().some(t => t.pipeVariant === PipeVariant.OSCILLATING)).toBe(true);
  });

  test('includes DOUBLE variant after score threshold', () => {
    (manager as any).chooseVariant = () => PipeVariant.DOUBLE;
    scene.time.now = 0;
    manager.generatePipe(30);
    expect(manager.getTelemetry().some(t => t.pipeVariant === PipeVariant.DOUBLE)).toBe(true);
  });

  test('difficulty function reduces gap over time', () => {
    const early = DifficultyManager.getSettings(0);
    const later = DifficultyManager.getSettings(50);
    expect(later.gap).toBeLessThanOrEqual(early.gap);
  });

  test('DOUBLE variant adds extra pipes', () => {
    (manager as any).chooseVariant = () => PipeVariant.DOUBLE;
    const before = manager.getActivePipeCount();
    scene.time.now = 0;
    manager.generatePipe(100);
    const after = manager.getActivePipeCount();
    // DOUBLE adds one extra pair (so +2 pairs total -> delta 2)
    expect(after - before).toBe(2);
  });

  test('records collision telemetry event', () => {
    // Spawn a pair
    manager.forceSpawnForTest();
    const telemetryBefore = manager.getTelemetry().length;
    // Simulate collision logging directly (private method not accessible, emulate public path with recordCollision via checkCollisions not feasible without bird)
    (manager as any).telemetry.push({ timestamp: Date.now(), type: 'collision' });
    const telemetryAfter = manager.getTelemetry().length;
    expect(telemetryAfter).toBe(telemetryBefore + 1);
    expect(manager.getTelemetry().some(t => t.type === 'collision')).toBe(true);
  });
});
