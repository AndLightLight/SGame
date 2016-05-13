var Box2d = require("box2dweb-commonjs");
var Game = cc.Class({
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
        
        world: {
            default: null,
            visible: false,
        }
    },
    
    // use this for initialization
    onLoad: function () {
        Game.instance = this;
        this.world = new Box2d.b2World(new Box2d.b2Vec2(0,0),true);
        var debugDraw = new Box2d.b2DebugDraw();
        debugDraw.SetSprite(cc.game.config.id.getContext("2d"));
        debugDraw.SetDrawScale(30.0);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(Box2d.b2DebugDraw.e_shapeBit | Box2d.b2DebugDraw.e_jointBit);
        this.world.SetDebugDraw(debugDraw);

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.world.Step(dt,10,10);
        this.world.DrawDebugData();
        this.world.ClearForces();
    },
});
