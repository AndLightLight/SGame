var DataMgr = require("DataMgr");
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


    addBuff: function (fromrole,torole,buffid) {
        var buffinfo = DataMgr.instance.GetInfoByTalbeNameAndId("buff",buffid);
        if (buffinfo) {
            this.guid ++;
            var Buff = require("Buff")
            var buff = new Buff();
            buff.onLoad();
            buff.guid = this.guid;
            buff.info = buffinfo;
            buff.fromrole = fromrole;
            buff.torole = torole;
            this.buffList[buff.guid] = buff;

            for (var i = 0;i < buffinfo.animationpre.length;i ++) {
                var preid = buffinfo.animationpre[i];
                var pre = DataMgr.instance.GetPrefabById(preid);
                if (pre) {
                    var aninode = cc.instantiate(pre);

                    aninode.x = 0;
                    aninode.y = 0;
                    aninode.parent = torole.node;
                }
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        for (var key in this.buffList) {
            if (this.buffList.hasOwnProperty(key)) {
                var element = this.buffList[key];
                if (element.isActive) {
                    element.update(dt);
                }
                else {
                    delete this.buffList[key];
                }
            }
        }
    },
});
