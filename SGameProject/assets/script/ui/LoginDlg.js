var LoginDlg = cc.Class({
    extends: cc.Component,

    properties: {
        NameEB: {
            default: null,
            type: cc.EditBox,
        },
        PasswordEB: {
            default: null,
            type: cc.EditBox,
        }
    },

    onBackClick: function (params) {

    },

    onLoginBtClick: function (params) {
        window.pomelo.init({
            host: "127.0.0.1",
            port: 2011,
            log: true 
        }, function () {
            window.pomelo.request(
                'gate.gateHandler.queryEntry',
                {
                    uid: LoginDlg.instance.NameEB.string,
                    password: LoginDlg.instance.PasswordEB.string,
                },
                function (params) {
                    LoginDlg.Hide();
                    MainDlg.Show();
                }
            );
        });
    },

    onShow: function (params) {

    },

    onHide: function () {
        this.node.active = false;
    },

    // use this for initialization
    onLoad: function () {
        if (!LoginDlg.instance) {
            LoginDlg.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }

        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});


LoginDlg.Show = function (params) {
    cc.loader.loadRes("pre/ui/LoginDlg",function (err,prefab) {
        if (err) {
            cc.log("prefab load error: " + err);
        }
        else {
            if (!LoginDlg.instance) {
                var uinode = cc.instantiate(prefab);
                uinode.parent = require("UIMgr").instance.node;
                uinode.x = 0;
                uinode.y = 0;
            }
            LoginDlg.instance.node.active = true;
            LoginDlg.instance.onShow(params);
        }
    });
};

LoginDlg.Hide = function (params) {
    if (LoginDlg.instance) {
        LoginDlg.instance.onHide(params);
    }
}