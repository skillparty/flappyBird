import 'phaser';

export default class GameOver extends Phaser.Scene {
  private score: number = 0;
  
  constructor() {
    super('GameOver');
  }

  init(data: { score: number }) {
    this.score = data.score || 0;
  }

  create() {
    console.log('💀 GameOver scene: Final score:', this.score);
    
    // Terminal-style game over screen
    this.add.rectangle(400, 300, 800, 600, 0x000000);
    
    // Terminal header
    this.add.rectangle(400, 25, 780, 30, 0x2D2D2D);
    this.add.text(20, 15, '● ● ● Terminal - Game Over', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    });
    
    // Game over message
    const gameOverText = `
skillparty@ubuntu:~$ ./flappy-bird --status
Game Status: TERMINATED
Final Score: ${this.score}
High Score: ${Math.max(this.score, parseInt(localStorage.getItem('flappyHighScore') || '0'))}

Process ended with collision detected.
Bird flight system: OFFLINE
Pipe obstacle system: OFFLINE
Score system: OFFLINE

skillparty@ubuntu:~$ 
`;

    this.add.text(30, 60, gameOverText, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00',
      lineSpacing: 4
    });

    // Options
    const optionsText = `
Available commands:
  restart    - Start new game
  menu       - Return to main menu
  quit       - Exit game

skillparty@ubuntu:~$ _`;

    this.add.text(30, 350, optionsText, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFF00',
      lineSpacing: 4
    });

    // Blinking cursor
    const cursor = this.add.text(190, 470, '_', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00'
    });

    this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Input handling
    this.setupInput();
  }

  private setupInput(): void {
    // R key for restart
    this.input.keyboard?.on('keydown-R', () => {
      this.executeCommand('restart');
    });

    // M key for menu
    this.input.keyboard?.on('keydown-M', () => {
      this.executeCommand('menu');
    });

    // Space for restart (common expectation)
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.executeCommand('restart');
    });

    // Click for restart
    this.input.on('pointerdown', () => {
      this.executeCommand('restart');
    });
  }

  private executeCommand(command: string): void {
    const commandText = this.add.text(190, 470, command, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00'
    });

    this.time.delayedCall(500, () => {
      switch (command) {
        case 'restart':
          console.log('🔄 Restarting game...');
          this.scene.start('Game');
          break;
        case 'menu':
          console.log('🏠 Returning to menu...');
          this.scene.start('Menu');
          break;
        default:
          this.scene.start('Game');
      }
    });
  }
}