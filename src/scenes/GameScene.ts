import Phaser from 'phaser';
import hanna from '../../assets/sprites/hanna-sprite.png';
import bluePotion from '../../assets/sprites/blue.png';
import redPotion from '../../assets/sprites/red.png';
import platform from '../../assets/images/platform.png';
import jump from '../../assets/audio/cyber-jump.mp3';
import blueBlock from '../../assets/images/blue-block.png'
import blueBlockFull from '../../assets/images/blue-block-full.png'
import redBlock from '../../assets/images/red-block.png'
import redBlockFull from '../../assets/images/red-block-full.png'
import emptyBlock from '../../assets/images/empty-block.png'
import waterSound from '../../assets/audio/cyber-water.mp3'
import damageSound from '../../assets/audio/cyber-damage.mp3'

let cursors;
let player;
let platforms;
let lastDirection;


let emitterRed;
let emitterBlue;
let particlesRed;
let particlesBlue;
let collectedTwo = false;



export default {
  key: 'play',
  preload: function() {
    this.load.spritesheet('hanna', hanna, {
      frameHeight: 52,
      frameWidth: 47
    });
    this.load.spritesheet('blue', bluePotion, {
      frameHeight: 24,
      frameWidth: 24
    });
    this.load.spritesheet('red', redPotion, {
      frameHeight: 24,
      frameWidth: 24
    });

    this.load.image('emptyBlock', emptyBlock);
    this.load.image('redBlockEmpty', redBlock);
    this.load.image('redBlockFull', redBlockFull);
    this.load.image('blueBlockEmpty', blueBlock);
    this.load.image('blueBlockFull', blueBlockFull);
    this.load.audio('jump', jump);
    this.load.audio('damageSound', damageSound);
    this.load.audio('waterSound', waterSound);
  },

  create: function() {
    this.redPotionsCollected = 1;
    this.bluePotionsCollected = 1;
    this.redPotionsUsed = 0;
    this.bluePotionsUsed = 0;
    this.score = 0;
    
    

    this.redInfo = this.add.text(20, 20, `${this.redPotionsCollected}`, {color: "#fa0e20"}).setScrollFactor(0);
    this.blueInfo = this.add.text(20, 40, `${this.bluePotionsCollected}`, {color: "#5fcde4"}).setScrollFactor(0);
    this.scoreInfo = this.add.text(650, 550, `Score: ${this.score}`).setScrollFactor(0);
    

    platforms = this.physics.add.staticGroup();
    this.redPotions = this.physics.add.group();
    this.bluePotions = this.physics.add.group();
    
    platforms
      .create(400, 568, 'emptyBlock')
      .setScale(4)
      .refreshBody();
      this.add.text(340, 380, `Hello, Hanna`);
      
    platforms.create(200, 400, 'emptyBlock');
    
    platforms.create(100, 250, 'emptyBlock');
    this.redPotions.create(100, 200, 'red');
    this.tasteIt = this.add.text(30, 140, `You need energy`);

    
    platforms.create(400, 250, 'emptyBlock')
    this.bluePotions.create(400, 200, 'blue');
    this.add.text(320 , 140, 'Use it to survive');
    
    platforms.create(724, 200, 'emptyBlock');
    platforms.create(650, 150, 'redBlockEmpty');
    this.add.text(600 , 100, `Don't touch`);
    platforms.create(724, 50, 'emptyBlock');
    this.redPotions.create(724, 0, 'red');
    platforms.create(600, 0, 'emptyBlock');
    platforms.create(448, -100, 'blueBlockEmpty');
    platforms.create(400, -100, 'emptyBlock');
    platforms.create(376, -100, 'emptyBlock');
    platforms.create(376, -260, 'redBlockEmpty');
    
    platforms.create(376, -420, 'emptyBlock');
    this.add.text(310, -520, `It ends here...`);
   
    player = this.physics.add.sprite(400, 450, 'hanna');

    player.setSize(32, 50).setOffset(8, 3).setDepth(1);
    player.setCollideWorldBounds(false);
    this.cameras.main.startFollow(player, true, 1, 1, 0, 0);
    

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('hanna', { start: 2, end: 6 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('hanna', { start: 7, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'hanna', frame: 0 }],
      frameRate: 20
    });
    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'hanna', frame: 1 }],
      frameRate: 20
    });
    this.jumpSound = this.sound.add('jump', { loop: false });
    this.waterSound = this.sound.add('waterSound', { loop: false });
    this.damageSound = this.sound.add('damageSound', { loop: false });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, platforms, (player, platform) => {
    
      if(platform.texture.key === 'redBlockEmpty' && this.redPotionsCollected !== 0) {
        platform.setTexture('redBlockFull')
        this.events.emit('removeRed');
      }
      if(platform.texture.key === 'blueBlockEmpty' && this.bluePotionsCollected !== 0) {
        platform.setTexture('blueBlockFull')
        this.events.emit('removeBlue');
      }
    });

    

    this.anims.create({
      key: 'red-potion-idle',
      frames: this.anims.generateFrameNumbers('red', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'blue-potion-idle',
      frames: this.anims.generateFrameNumbers('blue', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    this.redPotions.children.iterate(function(child) {
      child.setSize(24, 50).setOffset(0, 0);
      child.anims.play('red-potion-idle', true);
    });
    
    this.bluePotions.children.iterate(function(child) {
      child.setSize(24, 50).setOffset(0, 0);
      child.anims.play('blue-potion-idle', true);
    });

    this.physics.add.collider(this.redPotions, platforms);
    this.physics.add.overlap(player, this.redPotions, collectRedPotion, null, this);
    this.physics.add.collider(this.bluePotions, platforms);
    this.physics.add.overlap(
      player,
      this.bluePotions,
      collectBluePotion,
      null,
      this
    );
    function collectRedPotion(player, potion) {
      this.waterSound.play();
      potion.disableBody(true, true);
      const prevRed = this.redPotionsCollected;
      if (prevRed > 0) {
        this.textures.remove(`particle-red-${prevRed}`)
      }
      const nextRed = this.redPotionsCollected + 1
      
      this.textures.generate(`particle-red-${nextRed}`, {
        data: ['3'],
        pixelWidth: nextRed+1
      });
      if (particlesRed) particlesRed.destroy();
      particlesRed = this.add.particles(`particle-red-${nextRed}`);
      // BREAKS prettier
      emitterRed = particlesRed.createEmitter({
        
        gravityX: 50,
        lifespan: { min: 200*nextRed, max: 400*nextRed },
        blendMode: 'ADD'
        x: 0,
        y: 0,
        speed: 10,
        
      });  
      emitterRed.startFollow(player);
      this.redPotionsCollected = nextRed;
      if (nextRed > 0 && this.bluePotionsCollected>0) {
        collectedTwo = true;
      }
      this.events.emit('addScore');
      this.events.emit('addRed');
      
    }
    function collectBluePotion(player, potion) {
      this.waterSound.play();
      potion.disableBody(true, true);
      const prevBlue = this.bluePotionsCollected;
      if (prevBlue > 0) {
        this.textures.remove(`particle-blue-${prevBlue}`)
      }
      const nextBlue= this.bluePotionsCollected + 1
      
      this.textures.generate(`particle-blue-${nextBlue}`, {
        data: ['F'],
        pixelWidth: nextBlue + 1
      });
      
      if (particlesBlue) particlesBlue.destroy();
      particlesBlue = this.add.particles(`particle-blue-${nextBlue}`);
      // BREAKS prettier
      emitterBlue = particlesBlue.createEmitter({
       
        speed: 10,
        gravityX: -50,
        lifespan: { min: 200*nextBlue, max: 400*nextBlue },
        blendMode: 'ADD'
        x: 0,
        y: 0,
        
        
      }); 
      emitterBlue.startFollow(player);
      this.bluePotionsCollected = nextBlue;
      if (nextBlue > 0 && this.redPotionsCollected>0) {
        collectedTwo = true;
      }
      this.events.emit('addScore');
      this.events.emit('addBlue');
      
      
    }
    this.events.on('addScore', function () {
      console.log(this.score);
      this.score += 10;
      console.log(this.score);
      this.scoreInfo.setText(`Score: ${this.score}`);

  }, this);
    this.events.on('addRed', function () {

      if (this.redPotionsCollected === 2) {
        this.tasteIt.setText(`Do you like it?`)
      }
      this.redInfo.setText(`${this.redPotionsCollected}`)
      this.scoreInfo.setText(`Score: ${this.score}`);

  }, this);
  this.events.on('removeRed', function () {
    const prevRed = this.redPotionsCollected;
      if (prevRed > 0) {
        this.textures.remove(`particle-red-${prevRed}`)
      }
      const nextRed= this.redPotionsCollected - 1;
      player.tint = "0xfa0e20";
      this.time.delayedCall(200, () =>{player.tint = 0xFFFFFF}, [], this);
      if(nextRed > 0) {
        this.textures.generate(`particle-red-${nextRed}`, {
          data: ['3'],
          pixelWidth: nextRed + 1
        });
        
        if (particlesRed) particlesRed.destroy();
        particlesRed = this.add.particles(`particle-red-${nextRed}`);
        // BREAKS prettier
        emitterRed = particlesRed.createEmitter({
         
          speed: 10,
          gravityX: -50,
          lifespan: { min: 200*nextRed, max: 400*nextRed },
          blendMode: 'ADD'
          x: 0,
          y: 0,
          
          
        }); 
        emitterRed.startFollow(player);
      }
      

    
      
      this.redPotionsCollected = nextRed;

    
    this.redInfo.setText(`${nextRed }`)
    this.score -= 10;
    this.scoreInfo.setText(`Score: ${this.score}`);
    this.damageSound.play();
    if(!this.bluePotionsCollected && !this.redPotionsCollected && collectedTwo ) {
      player.tint = 0xff0000;
      this.textures.remove(`particle-red-${this.redPotionsCollected}`)
      this.textures.remove(`particle-blue-${this.bluePotionsCollected}`)
      this.score = 0;
      collectedTwo = false;
      this.events.off('addScore');
      this.events.off('removeRed');
      this.events.off('removeBlue');
      this.scene.restart();
    }

  }, this);
    this.events.on('addBlue', function () {

      
      this.blueInfo.setText(`${this.bluePotionsCollected}`)
      this.scoreInfo.setText(`Score: ${this.score}`);

    }, this);
    this.events.on('removeBlue', function () {
      
      const prevBlue = this.bluePotionsCollected;
      console.log(prevBlue)
      if (prevBlue > 0) {
        console.log(prevBlue)
        this.textures.remove(`particle-blue-${prevBlue}`)
      }
      const nextBlue= prevBlue- 1;
      player.tint = "0x5fcde4";
      this.time.delayedCall(200, () =>{player.tint = 0xFFFFFF}, [], this);
      
      if (nextBlue > 0 ) {
        this.textures.generate(`particle-blue-${nextBlue}`, {
          data: ['F'],
          pixelWidth: nextBlue + 1
        });
        
        if (particlesBlue) particlesBlue.destroy();
        particlesBlue = this.add.particles(`particle-blue-${nextBlue}`);
        // BREAKS prettier
        emitterBlue = particlesBlue.createEmitter({
         
          speed: 10,
          gravityX: -50,
          lifespan: { min: 200*nextBlue, max: 400*nextBlue },
          blendMode: 'ADD'
          x: 0,
          y: 0,
          
          
        }); 
        emitterBlue.startFollow(player);
      }
      

    
      this.blueInfo.setText(`${nextBlue}`)
      this.bluePotionsCollected = nextBlue;
      this.score -= 10;
      this.scoreInfo.setText(`Score: ${this.score}`);
      this.damageSound.play();
      if(!this.bluePotionsCollected && !this.redPotionsCollected && collectedTwo ) {
        player.tint = 0xff0000;
      this.textures.remove(`particle-red-${this.redPotionsCollected}`)
      this.textures.remove(`particle-blue-${this.bluePotionsCollected}`)
      this.score = 0;
      collectedTwo = false;
      this.events.off('addScore');
      this.events.off('removeRed');
      this.events.off('removeBlue');
      this.scene.restart();
      }
  
    }, this);

    
   
   
  },
  
  update: function() {
    if (player.y > 1200) {
      this.damageSound.play();
      player.tint = 0xff0000;
      this.textures.remove(`particle-red-${this.redPotionsCollected}`)
      this.textures.remove(`particle-blue-${this.bluePotionsCollected}`)
      this.score = 0;
      collectedTwo = false;

      this.events.off('addScore');
      this.events.off('removeRed');
      this.events.off('removeBlue');
      this.scene.restart();
    }
    
    if (cursors.left.isDown) {
      lastDirection = 'left';
      player.setVelocityX(-160);

      player.anims.play('left', true);
      player.flipX = true;
    } else if (cursors.right.isDown) {
      lastDirection = 'right';
      player.setVelocityX(160);

      player.anims.play('right', true);
      player.flipX = false;
    } else {
      player.setVelocityX(0);
      if (lastDirection === 'left') {
        player.anims.play('idle-left', true);
        player.flipX = true;
      } else {
        player.anims.play('idle-right', true);
      }
    }

    if (cursors.up.isDown && player.body.touching.down) {
      this.jumpSound.play();
      player.setVelocityY(-330);
    }
  }
};
