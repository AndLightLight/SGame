var Box2d = require("box2dweb-commonjs");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        
        word: {
            default: null,
            visible: false,
        }
    },
    
    // use this for initialization
    onLoad: function () {
        require("Datamgr").GetInstance().Init();
        this.word = new Box2d.b2Word(new Box2d.b2Vec2(0,9.8),true);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.word.Step(dt,10,10);
        this.world.DrawDebugData();
        this.word.ClearForces();
    },
});
