import 'phaser';

export default class Preload extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super('Preload');
  }

  preload() {
    console.log('🎮 Preload scene: Creating game assets...');
    
    // Create terminal-style loading screen
    this.createTerminalLoadingScreen();
    
    // Create stable game assets
    this.createGameAssets();
  }

  private createTerminalLoadingScreen(): void {
    // Terminal background
    this.add.rectangle(400, 300, 800, 600, 0x000000);
    
    // Terminal loading text
    this.loadingText = this.add.text(50, 50, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00FF00'
    });
    
    // Simulate terminal loading
    this.simulateTerminalLoading();
  }

  private simulateTerminalLoading(): void {
    const loadingMessages = [
      'skillparty@flappybird:~$ initializing game systems...',
      'Loading assets... [████████████████████] 100%',
      'Configuring physics engine... OK',
      'Setting up game world... OK',
      'Preparing bird mechanics... OK',
      'Generating pipe obstacles... OK',
      'Initializing collision detection... OK',
      'Loading complete. Starting game...',
      '',
      'Press any key to continue...'
    ];

    let currentLine = 0;
    const typeSpeed = 50;

    const typeNextLine = () => {
      if (currentLine < loadingMessages.length) {
        const message = loadingMessages[currentLine];
        let currentChar = 0;
        
        const typeLine = () => {
          if (currentChar <= message.length) {
            const currentText = this.loadingText.text + message.substring(currentChar - 1, currentChar);
            this.loadingText.setText(this.loadingText.text + (currentChar === 0 ? '' : message[currentChar - 1]));
            currentChar++;
            
            if (currentChar <= message.length) {
              this.time.delayedCall(typeSpeed, typeLine);
            } else {
              this.loadingText.setText(this.loadingText.text + '\n');
              currentLine++;
              this.time.delayedCall(200, typeNextLine);
            }
          }
        };
        
        typeLine();
      } else {
        // Loading complete, wait for input or auto-continue
        this.time.delayedCall(1000, () => {
          this.scene.start('Menu');
        });
      }
    };

    typeNextLine();
  }

  private createGameAssets(): void {
    const graphics = this.add.graphics();
    
    // Create stable, high-quality sprites
    
    // Bird animation frames (wing up, mid, down) - more professional styled simple vector
    const birdFrames = ['bird_frame_up','bird_frame_mid','bird_frame_down'];
    const wingOffsets = [-4,0,4];
    for (let i=0;i<birdFrames.length;i++) {
      graphics.clear();
      // Body gradient illusion: draw two overlapping rounded rects
      graphics.fillStyle(0xFFC94D);
      graphics.fillRoundedRect(0, 0, 36, 26, 6);
      graphics.fillStyle(0xFFB027);
      graphics.fillRoundedRect(2, 2, 32, 22, 6);
      // Wing
      graphics.fillStyle(0xE0901E);
      graphics.fillRoundedRect(14, 8 + wingOffsets[i], 14, 10, 4);
      // Eye
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(10, 11, 4);
      graphics.fillStyle(0x000000);
      graphics.fillCircle(11, 11, 2);
      // Beak (two-tone)
      graphics.fillStyle(0xFF8C00);
      graphics.fillTriangle(0, 13, -7, 10, -7, 16);
      graphics.fillStyle(0xFF7000);
      graphics.fillTriangle(-1, 13, -5, 11, -5, 15);
      graphics.generateTexture(birdFrames[i], 36, 26);
    }
    // Backwards compatibility main bird texture
    graphics.clear();
    graphics.fillStyle(0xFFC94D);
    graphics.fillRoundedRect(0, 0, 36, 26, 6);
    graphics.fillStyle(0xFFB027);
    graphics.fillRoundedRect(2, 2, 32, 22, 6);
    graphics.fillStyle(0xFFFFFF);
    graphics.fillCircle(10, 11, 4);
    graphics.fillStyle(0x000000);
    graphics.fillCircle(11, 11, 2);
    graphics.fillStyle(0xFF8C00);
    graphics.fillTriangle(0, 13, -7, 10, -7, 16);
    graphics.generateTexture('bird', 36, 26);
    
  // Pipe - gradient & lip
  graphics.clear();
  const PIPE_W = 80; const PIPE_H = 420;
  // Base shadow
  graphics.fillStyle(0x166d16);
  graphics.fillRect(0,0,PIPE_W,PIPE_H);
  // Inner lighter area
  graphics.fillStyle(0x2fb82f);
  graphics.fillRect(6,0,PIPE_W-18,PIPE_H);
  // Highlight stripe
  graphics.fillStyle(0x55e055);
  graphics.fillRect(58,0,8,PIPE_H);
  // Cap
  graphics.fillStyle(0x1e7e1e);
  graphics.fillRect(-6,-28,PIPE_W+12,50);
  graphics.fillStyle(0x3ad23a);
  graphics.fillRect(0,-20,PIPE_W,34);
  graphics.generateTexture('pipe', PIPE_W+12, PIPE_H+50);
    
    // Ground - Textured ground
    graphics.clear();
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(0, 0, 800, 60);
    graphics.fillStyle(0xA0522D);
    for (let i = 0; i < 800; i += 20) {
      graphics.fillRect(i, 0, 18, 60);
    }
    graphics.generateTexture('ground', 800, 60);
    
    // Background - Simple sky blue
    graphics.clear();
    graphics.fillStyle(0x87CEEB);
    graphics.fillRect(0, 0, 800, 600);
    graphics.generateTexture('background', 800, 600);
    
    // Cloud sprites for parallax
    graphics.clear();
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(30, 30, 20);
    graphics.fillCircle(50, 25, 25);
    graphics.fillCircle(70, 30, 20);
    graphics.generateTexture('cloud', 100, 60);
    
    graphics.destroy();
    
    console.log('✅ Game assets created successfully');
  }

  create() {
    // Assets are created in preload, just transition
  }
}
