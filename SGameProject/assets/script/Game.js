var Box2d = require("box2dweb-commonjs");
var DataMgr = require("DataMgr");
var LoadUI = require("LoadUI");
var Game = cc.Class({
    extends: cc.Component,

    properties: {
        LogPane: {
            default: null,
            type: cc.Node,  
        },
        
        LogCP: {
            default: null,
            type: cc.Label,  
        },
        
        world: {
            default: null,
            visible: false,
        }
    },
    
    StartGame: function (event) {
        var node = event.target;
        var stageid = 1;
        if (node.name == "stage1bt") {
            stageid = 1;
        }
        else if (node.name == "stage2bt") {
            stageid = 2;
        }
        
        var stageinfo = DataMgr.instance.GetInfoByTalbeNameAndId("stage" , stageid);
        if (stageinfo) {
            var mappre = stageinfo.prefabid;
            var preinfo = DataMgr.instance.GetInfoByTalbeNameAndId("preload" , mappre);
            var stage1p;
            LoadUI.instance.totalLoadNum ++;
            DataMgr.instance.GetPrefabById(mappre,function (prefab) {
                LoadUI.instance.currentLoadNum ++;
            });
            var roleid = stageinfo.roleid;
            for (var key in roleid) {
                if (roleid.hasOwnProperty(key)) {
                    var element = roleid[key];
                    LoadUI.instance.totalLoadNum ++;
                    DataMgr.instance.GetPrefabById(element,function (prefab) {
                        LoadUI.instance.currentLoadNum ++;
                    });
                }
            }
            LoadUI.instance.StartLoading = true;
            LoadUI.instance.callBack = function () {
                stage1p = DataMgr.instance.GetPrefabById(mappre);
                var stage1n = cc.instantiate(stage1p);
                stage1n.getChildByName("map").getChildByName("layout").getComponent(require("MapLayoutHandle")).info = stageinfo;
                stage1n.parent = Game.instance.node;
                stage1n.x = 0;
                stage1n.y = 0;
            }
        }
        
        

        
        //var bt = cc.find("Canvas/UI/Start").active = false;
        Game.instance.Log("Log");
        if (cc.game.config.renderMode == 1) {
            Game.instance.Log("CanvasMode");
        }
        else if (cc.game.config.renderMode == 2) {
            Game.instance.Log("WebGLMode");
        }
        else {
            if (cc._renderType == 0) {
                Game.instance.Log("CanvasMode");
            }
            else if (cc._renderType == 1) {
                Game.instance.Log("WebGLMode");
            }
        }
    },
    
    Log: function (logtext,autoline) {
        if (autoline == false) {
            this.LogCP.string = this.LogCP.string + logtext;
        }
        else {
            this.LogCP.string = this.LogCP.string + logtext + "\n";
        }
    },
    
    OpenLog: function (bopen) {
        if (bopen == true) {
            this.LogPane.active = true;
        }
        else if (bopen == false) {
            this.LogPane.active = false;
        }
        else {
            this.LogPane.active = !this.LogPane.active;
        }
    },
    
    // use this for initialization
    onLoad: function () {
        if (!Game.instance) {
            Game.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
        //this.world = new Box2d.b2World(new Box2d.b2Vec2(0,9.8),true);
        cc.director.setDisplayStats(true);
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
        if (this.world) {
            this.world.Step(dt,10,10);
            this.world.DrawDebugData();
            this.world.ClearForces();
        }
    },
});
