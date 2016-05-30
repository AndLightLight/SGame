var Box2d = require("box2dweb-commonjs");
var DataMgr = require("DataMgr");
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
    
    StartGame: function () {
        var stage1p = DataMgr.instance.GetPrefabById(7);
        var stage1n = cc.instantiate(stage1p);
        stage1n.parent = this.node;
        stage1n.x = 0;
        stage1n.y = 0;
        
        var bt = cc.find("Canvas/UI/Start").active = false;
    },
    
    // use this for initialization
    onLoad: function () {
        if (!Game.instance) {
            Game.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
        this.world = new Box2d.b2World(new Box2d.b2Vec2(0,9.8),true);
        // var debugDraw = new Box2d.b2DebugDraw();
        // debugDraw.SetSprite(cc.game.config.id.getContext("2d"));
        // debugDraw.SetDrawScale(1.0);
        // debugDraw.SetFillAlpha(1.3);
        // debugDraw.SetLineThickness(2.0);
        // debugDraw.SetFlags(Box2d.b2DebugDraw.e_shapeBit | Box2d.b2DebugDraw.e_jointBit);
        // this.world.SetDebugDraw(debugDraw);

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.world.Step(dt,10,10);
        this.world.DrawDebugData();
        this.world.ClearForces();
    },
});
