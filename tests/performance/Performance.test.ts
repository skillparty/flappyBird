import ErrorHandler from '../../src/managers/ErrorHandler';

describe('Performance Tests', () => {
  let mockScene: any;

  beforeEach(() => {
    // Reset performance metrics
    ErrorHandler.resetPerformanceMetrics();
    
    // Create mock scene
    mockScene = {
      game: {
        loop: {
          actualFps: 60
        }
      },
      children: {
        list: []
      },
      tweens: {
        getAllTweens: jest.fn(() => [])
      }
    };

    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      writable: true,
      value: {
        usedJSHeapSize: 1000000,
        jsHeapSizeLimit: 10000000
      }
    });
  });

  describe('FPS Monitoring', () => {
    test('should track FPS correctly', () => {
      // Simulate good FPS
      mockScene.game.loop.actualFps = 60;
      ErrorHandler.monitorPerformance(mockScene);
      
      const metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.frameDrops).toBe(0);
    });

    test('should detect frame drops', () => {
      // Simulate low FPS multiple times
      mockScene.game.loop.actualFps = 30;
      
      for (let i = 0; i < 6; i++) {
        ErrorHandler.monitorPerformance(mockScene);
      }
      
      const metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.frameDrops).toBeGreaterThan(0);
    });

    test('should calculate average FPS', () => {
      // Simulate varying FPS
      const fpsValues = [60, 55, 50, 45, 60];
      
      fpsValues.forEach(fps => {
        mockScene.game.loop.actualFps = fps;
        ErrorHandler.monitorPerformance(mockScene);
      });
      
      const metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.averageFPS).toBeGreaterThan(0);
  expect(metrics.averageFPS).toBeLessThanOrEqual(60);
    });
  });

  describe('Memory Monitoring', () => {
    test('should track memory usage', () => {
      // Simulate normal memory usage
      (performance as any).memory = {
        usedJSHeapSize: 2000000,
        jsHeapSizeLimit: 10000000
      };
      
      ErrorHandler.monitorPerformance(mockScene);
      
      const metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.memoryWarnings).toBe(0);
    });

    test('should detect high memory usage', () => {
      // Simulate high memory usage
      (performance as any).memory = {
        usedJSHeapSize: 9000000,
        jsHeapSizeLimit: 10000000
      };
      
      for (let i = 0; i < 5; i++) {
        ErrorHandler.monitorPerformance(mockScene);
      }
      
      const metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.memoryWarnings).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization', () => {
    test('should not optimize with good performance', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Simulate good performance
      mockScene.game.loop.actualFps = 60;
      ErrorHandler.monitorPerformance(mockScene);
      
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Applying performance optimizations')
      );
    });

    test('should optimize with poor performance', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Simulate poor performance consistently
      mockScene.game.loop.actualFps = 25;
      
      for (let i = 0; i < 10; i++) {
        ErrorHandler.monitorPerformance(mockScene);
      }
      
      // Should eventually trigger optimization
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Applying performance optimizations')
      );
    });
  });

  describe('Error Logging Performance', () => {
    test('should handle rapid error logging efficiently', () => {
      const startTime = performance.now();
      
      // Log many errors rapidly
      for (let i = 0; i < 100; i++) {
        ErrorHandler.handleGameplayError(new Error(`Test error ${i}`), 'performance-test');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 100ms for 100 errors)
      expect(duration).toBeLessThan(100);
    });

    test('should limit error log size for memory efficiency', () => {
      // Log more errors than the max log size
      for (let i = 0; i < 100; i++) {
        ErrorHandler.handleGameplayError(new Error(`Test error ${i}`), 'memory-test');
      }
      
      const errors = ErrorHandler.getRecentErrors();
      expect(errors.length).toBeLessThanOrEqual(50); // Max log size
    });
  });

  describe('Critical Error Detection', () => {
    beforeEach(() => {
      // Ensure isolation between tests
      ErrorHandler.clearErrorLog();
    });
    test('should detect critical errors', () => {
      // Log some critical errors
      ErrorHandler.handlePhysicsError(new Error('Physics failure'), 'physics-critical');
      ErrorHandler.handleSceneError(new Error('Scene transition failure'), 'scene-transition');
      
      const hasCritical = ErrorHandler.hasCriticalErrors();
      expect(hasCritical).toBe(true);
    });

    test('should not flag non-critical errors as critical', () => {
      // Log non-critical errors
      ErrorHandler.handleAudioError(new Error('Audio failure'), 'audio-test');
      ErrorHandler.handleStorageError(new Error('Storage failure'), 'storage-test');
      
      const hasCritical = ErrorHandler.hasCriticalErrors();
      expect(hasCritical).toBe(false);
    });

    test('should clear critical status after time', (done) => {
      // Log critical error
      ErrorHandler.handlePhysicsError(new Error('Physics failure'), 'physics-test');
      expect(ErrorHandler.hasCriticalErrors()).toBe(true);
      
      // Wait for critical errors to expire (mocked time)
      setTimeout(() => {
        expect(ErrorHandler.hasCriticalErrors()).toBe(false);
        done();
      }, 35000); // Slightly more than 30 second threshold
    }, 40000);
  });

  describe('Performance Metrics Reset', () => {
    test('should reset metrics correctly', () => {
      // Generate some metrics
      mockScene.game.loop.actualFps = 30;
      ErrorHandler.monitorPerformance(mockScene);
      
      let metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.frameDrops).toBeGreaterThan(0);
      
      // Reset metrics
      ErrorHandler.resetPerformanceMetrics();
      
      metrics = ErrorHandler.getPerformanceMetrics();
      expect(metrics.frameDrops).toBe(0);
      expect(metrics.memoryWarnings).toBe(0);
      expect(metrics.averageFPS).toBe(60);
    });
  });

  describe('Error Handler Cleanup', () => {
    test('should clear error log', () => {
      // Add some errors
      ErrorHandler.handleGameplayError(new Error('Test 1'), 'test');
      ErrorHandler.handleGameplayError(new Error('Test 2'), 'test');
      
      expect(ErrorHandler.getRecentErrors().length).toBeGreaterThan(0);
      
      // Clear log
      ErrorHandler.clearErrorLog();
      
      expect(ErrorHandler.getRecentErrors().length).toBe(0);
    });
  });
});