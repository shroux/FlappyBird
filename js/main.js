var game = new Phaser.Game(288, 505, Phaser.AUTO, 'flappy-bird-reborn');

FlappyBirdReborn = {};
FlappyBirdReborn.MainMenu = function(){ };
FlappyBirdReborn.Play = function(){ };
FlappyBirdReborn.Preload = function(){ this.asset = null; this.ready = false; this.nbLoaded = 0};
FlappyBirdReborn.Boot = function(){ };

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

FlappyBirdReborn.MainMenu.prototype = {
    preload: function(){
    },

    create: function(){
        this.background = this.game.add.sprite(0, 0, "background");
    },
    update: function(){
    }
}

FlappyBirdReborn.Play.prototype = {
    preload: function(){
    },

    create: function(){
    },
    update: function(){
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

        this.load.spritesheet('bird', './assets/bird.png', 34, 24, 3);

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
        this.progress.text = this.nbLoaded + " files loaded on 5";
    }
}

game.state.add('MainMenu', FlappyBirdReborn.MainMenu);
game.state.add('Play', FlappyBirdReborn.Play);
game.state.add('Preload', FlappyBirdReborn.Preload);
game.state.add('Boot', FlappyBirdReborn.Boot);


game.state.start('Boot');