var FailedDlg = cc.Class({
    extends: cc.Component,

    properties: {
        Scorelb: {
            default: null,
            type: cc.Label,
        }
    },

    onBackClick: function (params) {
        require("Game").instance.currentMap.Out();
        this.Hide();
        require("MainDlg").Show();
    },

    onOutBtClick: function (params) {
        require("Game").instance.currentMap.Out();
        this.Hide();
        require("MainDlg").Show();
    },

    onCancelBtClick: function (params) {
        this.Hide();
    },

    onShow: function (params) {
        this.Scorelb.string = require("Game").instance.currentMap.score;
    },

    Hide: function () {
        this.node.active = false;
    },

    // use this for initialization
    onLoad: function () {
        if (!FailedDlg.instance) {
            FailedDlg.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }

        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});


FailedDlg.Show = function (params) {
    cc.loader.loadRes("pre/ui/FailedDlg",function (err,prefab) {
        if (err) {
            cc.log("prefab load error: " + err);
        }
        else {
            if (!FailedDlg.instance) {
                var uinode = cc.instantiate(prefab);
                uinode.parent = require("UIMgr").instance.node;
                uinode.x = 0;
                uinode.y = 0;
            }
            FailedDlg.instance.node.active = true;
            FailedDlg.instance.onShow(params);
        }
    });
};