import 'phaser';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load any assets needed for the preload scene (like a loading bar)
    console.log('Boot scene preload');
  }

  create() {
    console.log('Boot scene create - starting Preload scene');
    this.scene.start('Preload');
  }
}
