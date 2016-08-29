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
        window.pomelo.request(
            'player.playerHandler.getScoreList',
            {
                uid: 0,
            },
            function (params) {
                // LoginDlg.Hide();
                // MainDlg.Show();
                cc.log("player success!params.route:"+params.route);
            }
        );
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
                    pomelo.disconnect();
                    window.pomelo.init({
                        host: params.host,
                        port: params.port,
                        log: true 
                    }, function () {
                        window.pomelo.request(
                            'connector.entryHandler.enter',
                            {
                                uid: LoginDlg.instance.NameEB.string,
                                password: LoginDlg.instance.PasswordEB.string,
                                rid: LoginDlg.instance.NameEB.string,
                                username: LoginDlg.instance.PasswordEB.string,

                            },
                            function (params) {
                                cc.log("login sucess!users:"+params.users)
                            }
                        );
                    });
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