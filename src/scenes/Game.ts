import 'phaser';

export default class Game extends Phaser.Scene {
  // Core game objects
  private bird!: Phaser.Physics.Arcade.Sprite;
  private pipes!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private background!: Phaser.GameObjects.Image;
  private clouds!: Phaser.Physics.Arcade.Group;
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  
  // Game state
  private score: number = 0;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private pipeTimer: number = 0;
  private pipeDelay: number = 1800; // ms between pipes

  constructor() {
    super('Game');
  }

  create() {
    console.log('🎮 Game scene: Initializing stable game world...');
    
    // Reset game state
    this.resetGameState();
    
    // Create stable game world
    this.createBackground();
    this.createClouds();
    this.createGround();
    this.createBird();
    this.createPipes();
    
    // Setup UI
    this.createUI();
    
    // Setup physics and collisions
    this.setupPhysics();
    
    // Setup input
    this.setupInput();
    
    console.log('✅ Game world created successfully');
  }

  private resetGameState(): void {
    this.score = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.pipeTimer = 0;
  }

  private createBackground(): void {
    // Static sky background
    this.background = this.add.image(400, 300, 'background');
    this.background.setDisplaySize(800, 600);
    this.background.setDepth(-10);
  }

  private createClouds(): void {
    // Create cloud group for parallax effect
    this.clouds = this.physics.add.group();
    
    // Add some initial clouds
    for (let i = 0; i < 3; i++) {
      const cloud = this.clouds.create(
        200 + i * 300, 
        100 + Math.random() * 200, 
        'cloud'
      );
      cloud.setVelocityX(-20 - Math.random() * 10);
      cloud.setAlpha(0.7);
      cloud.setDepth(-5);
    }
  }

  private createGround(): void {
    // Scrolling ground visual
    this.ground = this.add.tileSprite(0, 540, 800, 60, 'ground');
    this.ground.setOrigin(0, 0);
    this.ground.setDepth(10);
    
    // Ground physics body (invisible collision) - completely static
    const groundBody = this.physics.add.staticGroup();
    const groundCollider = groundBody.create(400, 570, null);
    groundCollider.setSize(800, 60);
    groundCollider.setVisible(false);
    groundCollider.refreshBody(); // Ensure static body is properly set
    
    // Store reference for collision detection
    this.physics.world.on('worldbounds', () => {
      // Handle world bounds collision
    });
  }

  private createBird(): void {
    // Create bird with stable physics
    this.bird = this.physics.add.sprite(150, 300, 'bird');
    this.bird.setScale(1);
    this.bird.setDepth(5);
    
    // Configure bird physics for stable flight
    this.bird.body.setSize(30, 20);
    this.bird.body.setOffset(2, 2); // Center the collision box
    this.bird.setCollideWorldBounds(false); // Allow bird to go off-screen for game over
    
    // Set realistic flight physics
    this.bird.body.setDrag(0, 100); // Air resistance
    this.bird.body.setMaxVelocity(300, 500); // Limit max speeds
    this.bird.body.setBounce(0, 0); // No bouncing
    
    console.log('🐦 Bird created with stable physics');
  }

  private createPipes(): void {
    // Create pipe group with custom physics settings
    this.pipes = this.physics.add.group({
      // Configure all pipes to be immovable and not affected by gravity
      immovable: true,
      allowGravity: false
    });
  }

  private createUI(): void {
    // Score display
    this.scoreText = this.add.text(400, 50, `Score: ${this.score}`, {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setDepth(20);

    // Instructions
    this.instructionText = this.add.text(400, 200, 
      'SPACE or CLICK to jump\nAvoid the pipes!', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setDepth(20);
  }

  private setupPhysics(): void {
    // Bird vs Ground collision
    this.physics.add.overlap(this.bird, this.physics.world.staticBodies, () => {
      this.handleGameOver();
    });

    // Bird vs Pipes collision
    this.physics.add.overlap(this.bird, this.pipes, () => {
      this.handleGameOver();
    });
  }

  private setupInput(): void {
    // Mouse/touch input
    this.input.on('pointerdown', () => {
      this.handleJump();
    });

    // Keyboard input
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.handleJump();
    });

    // ESC to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('Menu');
    });
  }

  private handleJump(): void {
    if (this.gameOver) {
      // Restart game
      this.scene.restart();
      return;
    }

    if (!this.gameStarted) {
      this.startGame();
    }

    // Make bird jump
    this.bird.setVelocityY(-350);
    
    // Rotate bird upward
    this.tweens.killTweensOf(this.bird);
    this.bird.setRotation(-0.3);
  }

  private startGame(): void {
    this.gameStarted = true;
    this.instructionText.setVisible(false);
    
    console.log('🚀 Game started!');
  }

  private generatePipe(): void {
    if (this.gameOver) return;

    const gapSize = 180;
    const minPipeHeight = 100;
    const maxPipeHeight = 400;
    
    // Random gap position
    const gapY = Phaser.Math.Between(minPipeHeight + gapSize/2, maxPipeHeight - gapSize/2);
    
    // Top pipe - Create as static body (no physics)
    const topPipe = this.pipes.create(850, gapY - gapSize/2, 'pipe');
    topPipe.setOrigin(0.5, 1); // Bottom of sprite
    topPipe.setFlipY(true);
    topPipe.setDepth(1);
    
    // Remove physics body and make it purely kinematic
    topPipe.body.setImmovable(true);
    topPipe.body.setVelocityX(-200);
    topPipe.body.setVelocityY(0); // Ensure no vertical movement
    topPipe.body.setGravityY(-1200); // Cancel out world gravity
    
    // Bottom pipe - Create as static body (no physics)
    const bottomPipe = this.pipes.create(850, gapY + gapSize/2, 'pipe');
    bottomPipe.setOrigin(0.5, 0); // Top of sprite
    bottomPipe.setDepth(1);
    
    // Remove physics body and make it purely kinematic
    bottomPipe.body.setImmovable(true);
    bottomPipe.body.setVelocityX(-200);
    bottomPipe.body.setVelocityY(0); // Ensure no vertical movement
    bottomPipe.body.setGravityY(-1200); // Cancel out world gravity
    
    // Mark pipes for scoring
    topPipe.setData('scored', false);
    bottomPipe.setData('scored', false);
    
    console.log('🏗️ Generated stable pipe pair at gap:', gapY);
  }

  private updatePipes(): void {
    // Update and clean up pipes
    this.pipes.children.entries.forEach((pipe: any) => {
      // Ensure pipes maintain their horizontal movement only
      if (pipe.body) {
        pipe.body.setVelocityY(0); // Force no vertical movement
        
        // Ensure pipes stay at their intended position
        if (Math.abs(pipe.body.velocity.x + 200) > 5) {
          pipe.body.setVelocityX(-200); // Maintain consistent speed
        }
      }
      
      // Remove off-screen pipes
      if (pipe.x < -100) {
        pipe.destroy();
        return;
      }
      
      // Score when bird passes pipe
      if (!pipe.getData('scored') && pipe.x < this.bird.x) {
        pipe.setData('scored', true);
        // Only count once per pipe pair (use top pipe)
        if (pipe.flipY) { 
          this.incrementScore();
        }
      }
    });
  }

  private updateClouds(): void {
    // Reset clouds that go off-screen
    this.clouds.children.entries.forEach((cloud: any) => {
      if (cloud.x < -100) {
        cloud.x = 900;
        cloud.y = 100 + Math.random() * 200;
      }
    });
  }

  private incrementScore(): void {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Visual feedback
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private handleGameOver(): void {
    if (this.gameOver) return;
    
    this.gameOver = true;
    console.log('💀 Game Over! Score:', this.score);
    
    // Stop bird movement completely
    this.bird.setVelocity(0, 0);
    this.bird.body.setAcceleration(0, 0);
    
    // Stop all pipes completely
    this.pipes.children.entries.forEach((pipe: any) => {
      if (pipe.body) {
        pipe.body.setVelocity(0, 0);
        pipe.body.setAcceleration(0, 0);
        pipe.body.setImmovable(true);
      }
    });
    
    // Show game over UI
    this.showGameOverUI();
  }

  private showGameOverUI(): void {
    // Game over text
    const gameOverText = this.add.text(400, 250, 'GAME OVER', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 4
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(25);
    
    // Final score
    const finalScoreText = this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    });
    finalScoreText.setOrigin(0.5);
    finalScoreText.setDepth(25);
    
    // Restart instruction
    const restartText = this.add.text(400, 380, 'SPACE or CLICK to restart\nESC for menu', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(25);
    
    // Save high score
    const highScore = parseInt(localStorage.getItem('flappyHighScore') || '0');
    if (this.score > highScore) {
      localStorage.setItem('flappyHighScore', this.score.toString());
      
      const newRecordText = this.add.text(400, 440, 'NEW HIGH SCORE!', {
        fontSize: '20px',
        fontFamily: 'monospace',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 3
      });
      newRecordText.setOrigin(0.5);
      newRecordText.setDepth(25);
      
      // Celebration effect
      this.tweens.add({
        targets: newRecordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  update(time: number, delta: number): void {
    if (this.gameOver) return;
    
    // Update ground scrolling
    this.ground.tilePositionX += 2;
    
    // Update clouds
    this.updateClouds();
    
    if (!this.gameStarted) return;
    
    // Bird rotation based on velocity
    if (this.bird.body.velocity.y > 0) {
      // Falling - rotate downward
      this.bird.setRotation(Math.min(1.5, this.bird.body.velocity.y * 0.003));
    }
    
    // Check if bird is out of bounds
    if (this.bird.y > 600 || this.bird.y < -50) {
      this.handleGameOver();
      return;
    }
    
    // Generate pipes
    this.pipeTimer += delta;
    if (this.pipeTimer > this.pipeDelay) {
      this.generatePipe();
      this.pipeTimer = 0;
    }
    
    // Update pipes
    this.updatePipes();
  }
}