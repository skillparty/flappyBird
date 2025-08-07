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
    
    // Bird - Golden with better proportions
    graphics.fillStyle(0xFFD700);
    graphics.fillRoundedRect(0, 0, 34, 24, 4);
    graphics.fillStyle(0xFFA500);
    graphics.fillCircle(8, 12, 3); // Eye
    graphics.fillStyle(0xFF8C00);
    graphics.fillTriangle(0, 12, -6, 8, -6, 16); // Beak
    graphics.generateTexture('bird', 34, 24);
    
    // Pipe - More detailed green pipe
    graphics.clear();
    graphics.fillStyle(0x228B22);
    graphics.fillRect(0, 0, 60, 400);
    graphics.fillStyle(0x32CD32);
    graphics.fillRect(5, 0, 50, 400);
    graphics.fillStyle(0x228B22);
    graphics.fillRect(-10, -20, 80, 40); // Pipe cap
    graphics.generateTexture('pipe', 80, 420);
    
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
