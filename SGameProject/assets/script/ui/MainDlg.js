var MainDlg = cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onStage1Click: function (params) {
        require("Game").instance.StartGame(1);
        this.Hide();
    },

    onStage2Click: function (params) {
        require("Game").instance.StartGame(2);
        this.Hide();
    },



    onShow: function (params) {
         
    },

    Hide: function () {
        this.node.active = false;
    },

    // use this for initialization
    onLoad: function () {
        if (!MainDlg.instance) {
            MainDlg.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }

        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});


MainDlg.Show = function (params) {
    cc.loader.loadRes("pre/ui/MainDlg",function (err,prefab) {
        if (err) {
            cc.log("prefab load error: " + err);
        }
        else {
            if (!MainDlg.instance) {
                var uinode = cc.instantiate(prefab);
                uinode.parent = require("UIMgr").instance.node;
                uinode.x = 0;
                uinode.y = 0;
            }
            MainDlg.instance.node.active = true;
            MainDlg.instance.onShow(params);
        }
    });
};