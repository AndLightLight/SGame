var DataMgr = require("DataMgr");
var Game = require("Game");
var PoolMgr = require("PoolMgr");
var BuffMgr = cc.Class({
    extends: cc.Component,

    properties: {
        guid: {
            default: 0,
            visible: false,
        },

        buffList: {
            default: {},
            visible: false,
        },
    },

    // use this for initialization
    onLoad: function () {
        if (!BuffMgr.instance) {
            BuffMgr.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
    },


    AddBuff: function (fromrole,torole,buffid) {
        var buffinfo = DataMgr.instance.GetInfoByTalbeNameAndId("buff",buffid);
        if (buffinfo) {
            this.guid ++;
            var Buff = require("Buff")
            var buff = new Buff();
            
            buff.guid = this.guid;
            buff.info = buffinfo;
            buff.fromrole = fromrole;
            buff.torole = torole;
            this.buffList[buff.guid] = buff;
            buff.onLoad();

            for (var i = 0;i < buffinfo.animationpre.length;i ++) {
                var preid = buffinfo.animationpre[i];
                var aninode = PoolMgr.instance.GetNodeByPreId(preid);
                //var pre = DataMgr.instance.GetPrefabById(preid);
                if (aninode) {
                    //var aninode = cc.instantiate(pre);

                    aninode.x = 0;
                    aninode.y = 0;
                    aninode.parent = torole.node;
                    aninode.prefabid = preid;
                    var anic = aninode.getComponent(cc.Animation);
                    if (anic) {
                        anic.play();
                    }
                    buff.aninode.push(aninode);
                }
            }
        }
    },

    ClearBuffByRole: function (role) {
         for (var key in this.buffList) {
            if (this.buffList.hasOwnProperty(key)) {
                var element = this.buffList[key];
                if (element.torole == role) {
                    element.isActive = false;
                }
            }
        }   
    },

    ClearBuff: function () {
        for (var key in this.buffList) {
            if (this.buffList.hasOwnProperty(key)) {
                var element = this.buffList[key];
                element.Clear();
            }
        }
        this.buffList = {};
        this.guid = 0;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (Game.instance.currentMap) {
            if (!Game.instance.currentMap.pause) {
                for (var key in this.buffList) {
                    if (this.buffList.hasOwnProperty(key)) {
                        var element = this.buffList[key];
                        if (element.isActive) {
                            element.update(dt);
                        }
                        else {
                            this.buffList[key].Clear();
                            delete this.buffList[key];
                        }
                    }
                }
            }
        }
    },
});
