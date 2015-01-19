var game = new Phaser.Game(288, 505, Phaser.AUTO, 'flappy-bird-reborn');

FlappyBirdReborn = {};
FlappyBirdReborn.MainMenu = function(){ };
FlappyBirdReborn.Play = function(){ };
FlappyBirdReborn.Preload = function(){ this.asset = null; this.ready = false; this.nbLoaded = 0};
FlappyBirdReborn.Boot = function(){ };
FlappyBirdReborn.Gameover = function(){ };

FlappyBirdReborn.Boot.prototype = {
    preload: function(){
        game.load.image('preloader', './assets/preloader.gif');
    },

    create: function(){
        this.game.state.start('Preload');
    },
    update: function(){
    }
}

FlappyBirdReborn.Gameover.prototype = {
    preload: function(){
    },

    create: function(){
    },
    update: function(){
    }
}

FlappyBirdReborn.MainMenu.prototype = {
    preload: function(){
    },

    create: function(){
        this.background = this.game.add.sprite(0, 0, "background");

        this.ground = this.game.add.tileSprite(0, 400, 335, 112, 'ground');
        this.ground.autoScroll(-200, 0);

        this.titleGroup = this.game.add.group();
        this.title = this.game.add.sprite(0, 0, "title");
        this.titleGroup.add(this.title);

        this.bird = this.game.add.sprite(200, 5, "bird");
        this.titleGroup.add(this.bird);
        this.bird.animations.add("flap");
        this.bird.animations.play("flap", 12, true);

        this.titleGroup.x = 30;
        this.titleGroup.y = 100;

        this.game.add.tween(this.titleGroup).to({y: 115}, 700, Phaser.Easing.Linear.None, true, 0, -1, true);

        this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
        this.startButton.anchor.setTo(0.5, 0.5);
    },
    update: function(){
    },
    startClick: function(){
        game.state.start("Play");
    }
}

FlappyBirdReborn.Play.prototype = {
    preload: function(){
    },

    create: function(){
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 1100;

        this.score = 0;

        this.background = this.game.add.sprite(0, 0, 'background');

        this.bird = new Bird(this.game, 100, 505/2);
        this.game.add.existing(this.bird);

        this.pipes = this.game.add.group();

        this.ground = new Ground(this.game, 0, 400, 335, 112);
        this.game.add.existing(this.ground);

        this.scoreSound = this.game.add.audio('score');
        this.groundHit = this.game.add.audio('groundHit');

        this.instructionGroup = this.game.add.group();
        this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 100, 'getReady'));
        this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 325, 'instructions'));
        this.instructionGroup.setAll('anchor.x', 0.5);
        this.instructionGroup.setAll('anchor.y', 0.5);

        this.scoreText = this.game.add.bitmapText(this.game.width/2 - 30, 10, 'flappyfont', this.score.toString() + " pipe", 24);
        this.scoreText.visible = true;

        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        var flapKey = this.input.keyboard.addKey([Phaser.Keyboard.SPACEBAR]);
        flapKey.onDown.addOnce(this.startGame, this);
        flapKey.onDown.add(this.bird.flap, this.bird);

        this.input.onDown.addOnce(this.startGame, this);
        this.input.onDown.add(this.bird.flap, this.bird);

    },
    update: function(){
        this.game.physics.arcade.collide(this.bird, this.ground, this.deathHandler, null, this);
        this.pipes.forEach(function(p){
            this.checkScore(p);
            this.game.physics.arcade.collide(this.bird, p, this.birdDie, null, this);
        }, this);
        if(!this.bird.inWorld){
            this.deathHandler();
        }
    },
    generatePipes: function(){
        var pipeY = this.game.rnd.integerInRange(-100, 100);
        var pipeGroup = this.pipes.getFirstExists(false);
        if (!pipeGroup)
            pipeGroup = new PipeGroup(this.game, this.pipes);
        pipeGroup.reset(this.game.width + pipeGroup.width/2, pipeY);
    },
    checkScore: function(pipeGroup){
        if (pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x && this.bird.alive){
            this.scoreSound.play();
            this.score++;
            pipeGroup.hasScored = true;
            if (this.score < 2)
                this.scoreText.setText(this.score.toString() + " pipe");
            else
                this.scoreText.setText(this.score.toString() + " pipes");
        }
    },
    birdDie: function(){
        this.bird.die();
        this.ground.autoScroll(0, 0);
        this.pipes.forEach(function(p){
            p.stop();
            game.time.events.remove(this.pipeGenerator);
            if (p.bottomPipe.body.touching.up){
                this.bird.body.velocity.x = 80;
                this.bird.angle += 2;
            }
        }, this);
    },
    deathHandler: function(){
        this.groundHit.play();
        game.state.start("Gameover");
    },
    startGame: function(){
        if (!this.bird.alive){
            this.bird.body.allowGravity = true;
            this.bird.alive = true;
            this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25, this.generatePipes, this);
            this.pipeGenerator.timer.start();
            this.instructionGroup.destroy();
        }
    },
    shutdown: function(){
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
        this.bird.destroy();
        this.pipes.destroy();
    }
}

FlappyBirdReborn.Preload.prototype = {
    preload: function(){
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.asset = this.add.sprite(288/2, 505/2, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);

        this.load.setPreloadSprite(this.asset);

        this.load.image('background', './assets/background.png');
        this.load.image('ground', './assets/ground.png');
        this.load.image('title', './assets/title.png');
        this.load.image('startButton', './assets/start-button.png');
        this.load.image('instructions', './assets/instructions.png');
        this.load.image('getReady', './assets/get-ready.png');

        this.load.spritesheet('bird', './assets/bird.png', 34, 24, 3);
        this.load.spritesheet('pipe', './assets/pipes.png', 54, 320, 2);

        this.load.bitmapFont('flappyfont', './assets/fonts/flappyfont/flappyfont.png', './assets/fonts/flappyfont/flappyfont.fnt');

        this.load.audio('score', './assets/score.wav');
        this.load.audio('flap', './assets/flap.wav');
        this.load.audio('pipeHit', './assets/ouch.wav');
        this.load.audio('groundHit', './assets/ground-hit.wav');

        this.progress = game.add.text(288/2 - 50, 505/2 + 15, "0", { font: "14px Arial", fill: "#ffffff"});

        this.load.onFileComplete.add(this.onFileComplete, this);

    },

    create: function(){
        this.asset.cropEnabled = false;
    },
    update: function(){
        if (this.ready == true)
            game.state.start("MainMenu");
    },
    onLoadComplete: function(){
        this.ready = true;
    },
    onFileComplete: function(progress){
        this.nbLoaded += 1;
        this.progress.text = this.nbLoaded + " files loaded on 9";
    }
}

game.state.add('MainMenu', FlappyBirdReborn.MainMenu);
game.state.add('Play', FlappyBirdReborn.Play);
game.state.add('Preload', FlappyBirdReborn.Preload);
game.state.add('Boot', FlappyBirdReborn.Boot);
game.state.add('Gameover', FlappyBirdReborn.Gameover);


game.state.start('Boot');