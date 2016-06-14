var PauseDlg = cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onBackClick: function (params) {
        this.hide();
    },

    onOutBtClick: function (params) {
        require("Game").instance.currentMap.out();
        this.hide();
    },

    onCancelBtClick: function (params) {
        this.hide();
    },

    show: function (params) {
        require("Game").instance.currentMap.pause = true;  
    },

    hide: function () {
        this.node.active = false;
        require("Game").instance.currentMap.pause = false;
    },

    // use this for initialization
    onLoad: function () {
        if (!PauseDlg.instance) {
            PauseDlg.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }

        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});


PauseDlg.Show = function (params) {
    cc.loader.loadRes("pre/PauseDlg",function (err,prefab) {
        if (err) {
            cc.log("prefab load error: " + err);
        }
        else {
            if (!PauseDlg.instance) {
                var uinode = cc.instantiate(prefab);
                uinode.parent = require("UIMgr").instance.node;
                uinode.x = 0;
                uinode.y = 0;
            }
            PauseDlg.instance.node.active = true;
            PauseDlg.instance.show(params);
        }
    });
};