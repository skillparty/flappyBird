import 'phaser';
import PipeManager from '../components/PipeManager';
import { GAME_CONFIG } from '../config/GameConfig';
import { PipeVariant, DifficultySettings } from '../types/GameTypes';

/**
 * ArcadeGame scene: incremental refactor of legacy monolithic app.ts gameplay
 * Uses PipeManager pooling + simplified bird/coin logic. Keeps existing procedural assets.
 * Focus: Pipes + Coins + Scoring migration so we can later remove app.ts.
 */
export default class ArcadeGame extends Phaser.Scene {
  private bird!: Phaser.Physics.Arcade.Sprite;
  private pipes!: PipeManager;
  private coins!: Phaser.Physics.Arcade.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private score:number = 0; // pipes passed
  private coinScore:number = 0; // coins
  private bonusPoints:number = 0; // streak bonus
  private highScore:number = 0;
  private started = false;
  private gameOver = false;
  private paused = false;
  private relaxMode = false;
  private relaxIndicator?: Phaser.GameObjects.Text;
  private ariaAnnouncer: HTMLElement | null = null;
  private lastAnnounceTime = 0;
  private coinStreak = 0; private bestCoinStreak = 0; private lastCoinTime = 0;
  private achievementsText?: Phaser.GameObjects.Text;
  private unlockedAchievements = new Set<string>();
  private masterVolume = 0.7;
  private pauseOverlay?: Phaser.GameObjects.Text;
  private forest!: Phaser.GameObjects.TileSprite;
  private fog!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;
  // Using any to avoid Phaser type friction for emitter manager
  private particleMgr!: any;
  private coinEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private scoreEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Achievement definitions
  private achievementDefs = [
    { id: 'pipes10', label: '10 Pipes', condition: () => this.score >= 10 },
    { id: 'pipes50', label: '50 Pipes', condition: () => this.score >= 50 },
    { id: 'coins50', label: '50 Coins', condition: () => this.coinScore >= 50 },
    { id: 'coins100', label: '100 Coins', condition: () => this.coinScore >= 100 },
    { id: 'streak3', label: 'Coin Streak 3', condition: () => this.bestCoinStreak >= 3 }
  ];

  constructor(){ super('ArcadeGame'); }

  preload(){}

  create(){
    this.loadPersisted();
    // Background layers
    this.forest = this.add.tileSprite(400,520,800,200,'forest_bg').setOrigin(0.5,1).setDepth(-5);
    this.fog = this.add.tileSprite(400,300,800,600,'fog_tex').setDepth(-4).setAlpha(0.15);

    // Ground
    this.ground = this.add.tileSprite(0,540,800,60,'ground').setOrigin(0,0);
    const groundBody = this.physics.add.staticGroup();
    groundBody.create(400,570,'').setVisible(false).setSize(800,60);

    // Bird
  // Use restored CheepCheep texture for fish design
  const birdTexture = this.textures.exists('cheepCheep') ? 'cheepCheep' : 'bird';
  this.bird = this.physics.add.sprite(150,300,birdTexture);
    (this.bird.body as Phaser.Physics.Arcade.Body).setSize(this.bird.width*0.8,this.bird.height*0.8);
    this.bird.setCollideWorldBounds(false);

    // Pipes (pooling)
    this.pipes = new PipeManager(this, { spawnInterval: 1500, gap: 180, speed: -200 });
    this.pipes.setStaticMode(false);
    this.pipes.setDifficultyFunction((score:number):DifficultySettings => {
      if (this.relaxMode) return { speed: -180, gap: 220, allowedVariants: [PipeVariant.STATIC] };
      const level = Math.min(Math.floor(score / 10), 12);
      const gapBase = 180 - level * 5 + Phaser.Math.Between(-20,20);
      const speed = -200 + (level/12)*-60;
      return { speed, gap: gapBase, allowedVariants: [PipeVariant.STATIC] };
    });

    // Coins
    this.coins = this.physics.add.group();

    // Particles
    this.particleMgr = this.add.particles(0,0,'particle');
    this.coinEmitter = this.particleMgr.createEmitter({ speed:{min:40,max:140}, lifespan:{min:300,max:700}, scale:{start:0.9,end:0}, alpha:{start:1,end:0}, quantity:0, tint:[0xFFD700,0xFFF4B0,0xFFC300], rotate:{min:0,max:360}, gravityY:30, on:false });
    this.scoreEmitter = this.particleMgr.createEmitter({ speed:{min:30,max:100}, lifespan:{min:250,max:550}, scale:{start:0.7,end:0}, alpha:{start:0.9,end:0}, quantity:0, tint:[0x32CD32,0x66FF88,0x1FA34A], rotate:{min:0,max:360}, gravityY:20, on:false });

    // UI
  this.scoreText = this.add.text(400,50,this.buildScoreLine(),{ fontSize:'28px', fontFamily:'Arial', color:'#FFFFFF', stroke:'#000', strokeThickness:4 }).setOrigin(0.5);
  this.relaxIndicator = this.add.text(400,80,'',{ fontSize:'18px', fontFamily:'Arial', color:'#FFFFCC', stroke:'#000', strokeThickness:3 }).setOrigin(0.5);
  this.achievementsText = this.add.text(10,40,'',{ fontSize:'14px', fontFamily:'Arial', color:'#FFFFAA', stroke:'#000', strokeThickness:3, lineSpacing:2 }).setDepth(20).setOrigin(0,0);
  this.updateAchievementsDisplay();
  this.createVolumeUI();

    // Input
  this.input.on('pointerdown', ()=> this.handleInput());
  this.input.keyboard?.on('keydown-SPACE', ()=> this.handleInput());
  this.input.keyboard?.on('keydown-P', ()=> { if(this.started && !this.gameOver) this.togglePause(); });
  this.input.keyboard?.on('keydown-R', ()=> { if(!this.started){ this.relaxMode = !this.relaxMode; this.relaxIndicator?.setText(this.relaxMode ? 'RELAX MODE' : ''); this.scoreText.setText(this.buildScoreLine()); } });

    // Collisions
  this.physics.add.overlap(this.bird, groundBody, ()=> this.onGameOver());
  this.ariaAnnouncer = document.getElementById('game-announcements');
  }

  private handleInput(){
    if(this.gameOver){ this.scene.restart(); return; }
    if(!this.started){
      this.started = true; this.announce('Game start');
  if (this.cache.audio.exists('background')) {
        try { const bg = this.sound.add('background',{ loop:true, volume:0.3*this.masterVolume }); bg.play(); } catch {}
      }
    }
    this.bird.setVelocityY(-350);
    if (this.sound.get('jump')) this.sound.play('jump',{ volume:0.55*this.masterVolume, detune: Phaser.Math.Between(-80,80)}); else this.playBeep(650+Phaser.Math.Between(-30,30),0.12,'square');
  }

  private buildScoreLine():string {
    const total = this.score + this.coinScore*10 + this.bonusPoints;
    if (total > this.highScore) this.highScore = total;
    const streakPart = this.coinStreak>0 ? ` | Streak: ${this.coinStreak}/3` : '';
    const bonusPart = this.bonusPoints>0 ? ` | Bonus: ${this.bonusPoints}` : '';
    return `Pipes: ${this.score} | Coins: ${this.coinScore} | Total: ${total} | Best: ${this.highScore}${this.relaxMode ? ' | Mode: Relax': ''}${streakPart}${bonusPart}`;
  }

  private spawnCoin(gapCenter:number, speed:number){
    const coin = this.coins.create(820,gapCenter,'coin');
    coin.setScale(0.8);
    coin.body.setVelocityX(speed);
    coin.setData('rotationSpeed',0.1);
  }
  private collectCoin(coin: Phaser.Physics.Arcade.Sprite){
    this.coinScore++;
    const now = this.time.now;
    if (now - this.lastCoinTime < 1200) this.coinStreak++; else this.coinStreak = 1;
    this.lastCoinTime = now;
    if (this.coinStreak > this.bestCoinStreak) this.bestCoinStreak = this.coinStreak;
    if (this.coinStreak === 3) { this.bonusPoints += 5; this.spawnFloatingText(coin.x, coin.y - 28, 'STREAK +5', '#32CD32'); this.coinStreak = 0; this.playBeep(1046,0.18,'square'); }
    this.scoreText.setText(this.buildScoreLine());
    this.coinEmitter.explode(14, coin.x, coin.y);
    this.spawnFloatingText(coin.x, coin.y - 20, '+10', '#FFD700');
    this.announce('Coin +10'); this.vibrate(30);
    if (this.sound.get('score')) this.sound.play('score',{ volume:0.65*this.masterVolume, detune: Phaser.Math.Between(-50,50)}); else this.playBeep(880+Phaser.Math.Between(-40,40),0.16,'triangle');
    coin.destroy();
    this.checkAchievements();
  }

  private onGameOver(){
    if(this.gameOver) return; this.gameOver = true;
    this.bird.setVelocity(0,0);
    this.pipes.stop();
    if (this.sound.get('hit')) this.sound.play('hit',{ volume:0.75*this.masterVolume, detune: Phaser.Math.Between(-120,20)}); else this.playBeep(220+Phaser.Math.Between(-20,20),0.28,'sawtooth');
    this.vibrate([60,40,60]); this.announce('Game over');
    const total = this.score + this.coinScore*10 + this.bonusPoints;
    const storedHigh = parseInt(localStorage.getItem('flappyHighScore')||'0');
    if (total > storedHigh) { localStorage.setItem('flappyHighScore', total.toString()); }
    this.add.text(400,300,'GAME OVER',{ fontSize:'48px', fontFamily:'Arial', color:'#FF0000', stroke:'#000', strokeThickness:4}).setOrigin(0.5);
    this.add.text(400,340,`Pipes: ${this.score} | Coins: ${this.coinScore} | Bonus: ${this.bonusPoints}`,{ fontSize:'20px', fontFamily:'Arial', color:'#FFFFFF', stroke:'#000', strokeThickness:2}).setOrigin(0.5);
    this.add.text(400,365,`Total Score: ${total}`,{ fontSize:'24px', fontFamily:'Arial', color:'#FFD700', stroke:'#000', strokeThickness:3}).setOrigin(0.5);
    this.add.text(400,400,'Click or Space to restart',{ fontSize:'20px', fontFamily:'Arial', color:'#FFFF00', stroke:'#000', strokeThickness:2}).setOrigin(0.5);
    if (total > storedHigh) this.add.text(400,420,'NEW HIGH SCORE!',{ fontSize:'20px', fontFamily:'Arial', color:'#00FF00', stroke:'#000', strokeThickness:3}).setOrigin(0.5);
  }

  update(_t:number, dt:number){
    if(this.gameOver) return;
    if(this.paused) return;
    if(!this.started) return;

    // Parallax
    this.ground.tilePositionX += 2;
    this.forest.tilePositionX += 0.3;
    this.fog.tilePositionX += 0.15;

    // Spawn logic via manager
    this.pipes.updatePipes(this.score);

    // 40% chance to attach coin to newly spawned pair (detect via pair count change)
    // After updatePipes, get last pair and check if its id timestamp is near now
    const last = this.pipes.getLastSpawnedPair();
    if(last && !last.top.getData('coinAttempted')){
      last.top.setData('coinAttempted', true);
      if(Math.random()<0.4){
        const gapCenter = last.top.getData('gapCenter') || (last.top.y + last.bottom.y)/2;
        const speed = (last.top.body as Phaser.Physics.Arcade.Body).velocity.x || -200;
        this.spawnCoin(gapCenter, speed);
      }
    }

    // Scoring (bird passes pipes)
    if(this.pipes.checkScoring((this.bird as any))){
      this.score++;
      this.scoreText.setText(this.buildScoreLine());
      this.scoreEmitter.explode(10,this.bird.x,this.bird.y);
      this.announce('Pipe +1'); this.vibrate(15);
      if (this.sound.get('score')) this.sound.play('score',{ volume:0.6*this.masterVolume, detune: Phaser.Math.Between(-40,40)}); else this.playBeep(740+Phaser.Math.Between(-20,20),0.12,'triangle');
      this.checkAchievements();
    }

    // Collisions with pipes
  if(this.pipes.checkCollisions((this.bird as any))){ this.onGameOver(); }

    // Coin update & overlap
    this.coins.children.iterate((obj:Phaser.GameObjects.GameObject | undefined)=>{
      if(!obj) return false;
      const coin = obj as Phaser.Physics.Arcade.Sprite;
      coin.rotation += coin.getData('rotationSpeed') || 0.1;
      if(coin.x < -50){ coin.destroy(); return false; }
      if(Phaser.Math.Distance.Between(coin.x, coin.y, this.bird.x, this.bird.y) < 28){ this.collectCoin(coin); }
      return false;
    });
  }
  private announce(msg:string){ if(!this.ariaAnnouncer) return; const now=performance.now(); if(now - this.lastAnnounceTime < 200) return; this.lastAnnounceTime = now; this.ariaAnnouncer.textContent = msg; }
  private vibrate(pattern:number|number[]){ try { (navigator as any).vibrate?.(pattern); } catch {} }
  private spawnFloatingText(x:number,y:number, txt:string, color:string){ const t = this.add.text(x,y,txt,{ fontSize:'20px', fontFamily:'Arial', color, stroke:'#000', strokeThickness:3 }).setOrigin(0.5); this.tweens.add({ targets:t, y:y-40, alpha:0, duration:900, ease:'Cubic.easeOut', onComplete:()=>t.destroy() }); }
  private playBeep(freq:number,duration:number,type:OscillatorType='sine'){ try { const ctx:AudioContext|undefined=(this.sound as any).context; if(!ctx) return; const osc=ctx.createOscillator(); const gain=ctx.createGain(); osc.type=type; osc.frequency.value=freq; gain.gain.setValueAtTime(0.0001,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.4*this.masterVolume,ctx.currentTime+0.01); gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+duration); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration+0.02);} catch {} }
  private togglePause(){ this.paused=!this.paused; if(this.paused){ this.physics.world.pause(); this.pauseOverlay = this.add.text(400,300,'PAUSED',{ fontSize:'48px', fontFamily:'Arial', color:'#FFFFFF', stroke:'#000', strokeThickness:4}).setOrigin(0.5);} else { this.physics.world.resume(); this.pauseOverlay?.destroy(); } }
  private updateAchievementsDisplay(){ if(!this.achievementsText) return; const unlocked = Array.from(this.unlockedAchievements).map(id=> this.achievementDefs.find(a=>a.id===id)?.label || id); this.achievementsText.setText(unlocked.slice(-6).join('\n')); }
  private checkAchievements(){ for(const a of this.achievementDefs){ if(!this.unlockedAchievements.has(a.id) && a.condition()){ this.unlockedAchievements.add(a.id); this.spawnFloatingText(400,140,`🏅 ${a.label}`,'#FFD700'); this.playBeep(1046,0.18,'square'); this.announce(`Badge ${a.label}`); this.vibrate([40,30,40]); this.updateAchievementsDisplay(); } } try { localStorage.setItem('flappyAchievements', JSON.stringify(Array.from(this.unlockedAchievements))); } catch {} }
  private loadPersisted(){ try { const v = parseFloat(localStorage.getItem('flappyVolume')||''); if(!isNaN(v)) this.masterVolume = Phaser.Math.Clamp(v,0,1); } catch {}; try { const hs = parseInt(localStorage.getItem('flappyHighScore')||'0'); if(!isNaN(hs)) this.highScore = hs; } catch {}; try { const ach = localStorage.getItem('flappyAchievements'); if(ach){ JSON.parse(ach).forEach((id:string)=> this.unlockedAchievements.add(id)); } } catch {} }
  private createVolumeUI(){ const baseX=10, baseY=10; const style={ fontSize:'16px', fontFamily:'Arial', color:'#FFFFFF', stroke:'#000', strokeThickness:3 } as const; const minus = this.add.text(baseX+48, baseY,'−',style).setInteractive({ useHandCursor:true }); const val = this.add.text(baseX+68, baseY, `${Math.round(this.masterVolume*100)}%`, style); const plus = this.add.text(baseX+128, baseY,'+',style).setInteractive({ useHandCursor:true }); const mute = this.add.text(baseX+148, baseY, this.masterVolume>0?'🔊':'🔇', style).setInteractive({ useHandCursor:true }); this.add.text(baseX, baseY,'VOL',style); const apply=(nv:number)=>{ this.masterVolume=Phaser.Math.Clamp(nv,0,1); val.setText(`${Math.round(this.masterVolume*100)}%`); mute.setText(this.masterVolume>0?'🔊':'🔇'); const bg=this.sound.get('background'); if(bg && bg.isPlaying) (bg as any).setVolume?.(0.3*this.masterVolume); try { localStorage.setItem('flappyVolume', this.masterVolume.toString()); } catch {} }; minus.on('pointerdown',()=>apply(this.masterVolume-0.1)); plus.on('pointerdown',()=>apply(this.masterVolume+0.1)); mute.on('pointerdown',()=>apply(this.masterVolume>0?0:0.7)); }
}
