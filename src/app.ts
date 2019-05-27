import Phaser from 'phaser';
import logo from '../assets/images/logo-animated.png';
import audio from '../assets/audio/cyber2-128.mp3';
import GameScene from './scenes/GameScene.ts';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  title: 'Hanna',
  render: { pixelArt: true },
  physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 300 } } },
  width: 800,
  height: 600,
  scene: [{ key: 'title', create, preload }, GameScene],
  backgroundColor: '#222034'
};

const game = new Phaser.Game(config);

function preload() {
  this.load.audio('main', audio);
  this.load.spritesheet('logo', logo, {
    frameWidth: 267,
    frameHeight: 228
  });
  let loadingBar = this.add.graphics({
    fillStyle: { color: 0xffffff }
  });
  this.load.on('progress', percent => {
    loadingBar.fillRect(
      360,
      260,
      (this.game.renderer.width * percent) / 10,
      10
    );
  });
  this.load.on('complete', () => {
    loadingBar.destroy();
  });
}

function create() {
  const logo = this.add.sprite(400, 250, 'logo');
  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('logo', { start: 0, end: 8 }),
    frameRate: 8,
    repeat: -1
  });
  logo.anims.play('idle', true);
  this.add.text(277, 440, 'Press any button to start');

  const music = this.sound.add('main', { loop: true });

  music.play();
  this.input.manager.enabled = true;
  this.input.keyboard.on(
    'keydown',
    function() {
      this.scene.start('play');
    },
    this
  );
}
