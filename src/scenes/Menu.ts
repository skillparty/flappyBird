import 'phaser';

export default class Menu extends Phaser.Scene {
  private terminalText!: Phaser.GameObjects.Text;
  private asciiArt!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private cursor!: Phaser.GameObjects.Text;
  private isTransitioning: boolean = false;
  private bootSequenceComplete: boolean = false;

  constructor() {
    super('Menu');
  }

  create() {
    console.log('🖥️  Menu scene: Creating terminal interface...');
    
    // Create terminal background
    this.createTerminalBackground();
    
    // Start boot sequence
    this.startBootSequence();
    
    // Setup input
    this.setupInput();
  }

  private createTerminalBackground(): void {
    // Terminal black background
    this.add.rectangle(400, 300, 800, 600, 0x000000);
    
    // Terminal border (optional)
    const border = this.add.graphics();
    border.lineStyle(2, 0x333333);
    border.strokeRect(10, 10, 780, 580);
    
    // Terminal header bar
    const headerBar = this.add.rectangle(400, 25, 780, 30, 0x2D2D2D);
    this.add.text(20, 15, '● ● ● Terminal - Flappy Bird Game', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FFFFFF'
    });
  }

  private startBootSequence(): void {
    // Initial terminal text
    this.terminalText = this.add.text(30, 60, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00',
      lineSpacing: 4
    });

    const bootMessages = [
      'skillparty@ubuntu:~$ sudo systemctl start flappy-bird.service',
      '[sudo] password for skillparty: ********',
      '',
      'Starting Flappy Bird Game System...',
      '[ OK ] Started Flappy Bird Physics Engine',
      '[ OK ] Started Bird Flight Controller',
      '[ OK ] Started Pipe Obstacle Generator', 
      '[ OK ] Started Collision Detection System',
      '[ OK ] Started Score Management Service',
      '[ OK ] Started Game Audio System',
      '',
      'System ready. Loading game interface...',
      ''
    ];

    this.typeBootSequence(bootMessages, 0, () => {
      this.showAsciiArt();
    });
  }

  private typeBootSequence(messages: string[], index: number, onComplete: () => void): void {
    if (index >= messages.length) {
      onComplete();
      return;
    }

    const message = messages[index];
    let currentText = this.terminalText.text;
    
    if (message === '') {
      this.terminalText.setText(currentText + '\n');
      this.time.delayedCall(100, () => {
        this.typeBootSequence(messages, index + 1, onComplete);
      });
      return;
    }

    let charIndex = 0;
    const typeChar = () => {
      if (charIndex < message.length) {
        this.terminalText.setText(currentText + message.substring(0, charIndex + 1));
        charIndex++;
        this.time.delayedCall(30, typeChar);
      } else {
        this.terminalText.setText(currentText + message + '\n');
        this.time.delayedCall(200, () => {
          this.typeBootSequence(messages, index + 1, onComplete);
        });
      }
    };

    typeChar();
  }

  private showAsciiArt(): void {
    const asciiArt = `
 ____  _                            _     _            
|  _ \\| | __ _ _   _  ___ _ __   __| | __| | ___ _ __  
| |_) | |/ _\` | | | |/ _ \\ '_ \\ / _\` |/ _\` |/ _ \\ '__| 
|  __/| | (_| | |_| |  __/ | | | (_| | (_| |  __/ |    
|_|   |_|\\__,_|\\__, |\\___|_| |_|\\__,_|\\__,_|\\___|_|    
               |___/                                   
                                                       
                        by skillparty                  
`;

    this.asciiArt = this.add.text(400, 280, asciiArt, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#FF6600',
      align: 'center'
    }).setOrigin(0.5);

    // Add glow effect
    this.asciiArt.setStroke('#FF6600', 1);
    this.asciiArt.setShadow(0, 0, '#FF6600', 5, true, true);

    // Animate ASCII art entrance
    this.asciiArt.setAlpha(0);
    this.tweens.add({
      targets: this.asciiArt,
      alpha: 1,
      duration: 1000,
      ease: 'Power2.easeOut',
      onComplete: () => {
        this.showGamePrompt();
      }
    });
  }

  private showGamePrompt(): void {
    this.bootSequenceComplete = true;
    
    // Game prompt
    this.promptText = this.add.text(30, 480, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00'
    });

    const promptMessages = [
      '',
      'skillparty@ubuntu:~$ ./start-game.sh',
      '',
      'Game ready! Controls:',
      '  • SPACE or CLICK to jump',
      '  • ESC to pause',
      '',
      'Press SPACE or CLICK to start playing...'
    ];

    this.typePromptSequence(promptMessages, 0);
    
    // Add blinking cursor
    this.cursor = this.add.text(30, 560, '_', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00'
    });

    this.tweens.add({
      targets: this.cursor,
      alpha: 0,
      duration: 500,
      ease: 'Power2.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  private typePromptSequence(messages: string[], index: number): void {
    if (index >= messages.length) {
      return;
    }

    const message = messages[index];
    let currentText = this.promptText.text;
    
    if (message === '') {
      this.promptText.setText(currentText + '\n');
      this.time.delayedCall(100, () => {
        this.typePromptSequence(messages, index + 1);
      });
      return;
    }

    let charIndex = 0;
    const typeChar = () => {
      if (charIndex < message.length) {
        this.promptText.setText(currentText + message.substring(0, charIndex + 1));
        charIndex++;
        this.time.delayedCall(40, typeChar);
      } else {
        this.promptText.setText(currentText + message + '\n');
        this.time.delayedCall(300, () => {
          this.typePromptSequence(messages, index + 1);
        });
      }
    };

    typeChar();
  }

  private setupInput(): void {
    // Mouse input
    this.input.on('pointerdown', () => {
      this.startGame();
    });

    // Keyboard input
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame();
    });
  }

  private startGame(): void {
    if (!this.bootSequenceComplete || this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;

    // Terminal shutdown effect
    this.add.text(30, 580, 'skillparty@ubuntu:~$ Starting game...', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#00FF00'
    });

    // Fade out effect
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('🎮 Starting Game scene...');
      this.scene.start('Game');
    });
  }

  update(): void {
    // Menu doesn't need continuous updates
  }
}