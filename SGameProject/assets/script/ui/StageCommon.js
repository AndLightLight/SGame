var Game = require("Game");
var StageCommon = cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: {
            default: null,
            type: cc.Label,
        },
        LvLabel: {
            default: null,
            type: cc.Label,
        },
        timeLabel: {
            default: null,
            type: cc.Label,
        },
        pausebt: {
            default: null,
            type: cc.Button,
        },

        roundBar: {
            default: null,
            type: cc.ProgressBar,
        },

        zhiZhen: {
            default: null,
            type: cc.Node,
        },
    },

    pause: function () {
        require("PauseDlg").Show();
    },

    onShow: function (params) {
        
    },

    onHide: function () {
        this.node.active = false;
    },

    // use this for initialization
    onLoad: function () {
        if (!StageCommon.instance) {
            StageCommon.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.scoreLabel) {
            if (Game.instance.currentMap) {
                this.scoreLabel.string = Game.instance.currentMap.score;
                var moment = require('moment');
                var day = moment.unix(Game.instance.currentMap.playTime);
                this.timeLabel.string = day.format('mm:ss');

                var percent = Game.instance.currentMap.GetScorePercent();
                this.roundBar.progress = percent;
                this.zhiZhen.rotation = -360*percent;
                Game.instance.currentMap.CurrentStageParamInfo?this.LvLabel.string = Game.instance.currentMap.CurrentStageParamInfo.id:null;              
            }
            else {
                this.scoreLabel.string = 0;
            }
        }
    },
});


StageCommon.Show = function (params) {
    cc.loader.loadRes("pre/ui/StageCommon",function (err,prefab) {
        if (err) {
            cc.log("prefab load error: " + err);
        }
        else {
            if (!StageCommon.instance) {
                var uinode = cc.instantiate(prefab);
                uinode.parent = require("UIMgr").instance.node;
                uinode.x = 0;
                uinode.y = 0;
            }
            StageCommon.instance.node.active = true;
            StageCommon.instance.onShow(params);
        }
    });
};

StageCommon.Hide = function (params) {
    if (StageCommon.instance) {
        StageCommon.instance.onHide(params);
    }
}