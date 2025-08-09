import 'phaser';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    console.log('🚀 Boot scene: Initializing game systems...');
    
    // Hide loading indicator immediately
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  create() {
    console.log('✅ Boot scene: Systems initialized, starting Preload...');
    
    // Immediate transition - no delay needed
    this.scene.start('Preload');
  }
}
