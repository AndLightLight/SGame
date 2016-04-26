cc.Class({
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
    },
    mousefun: function (event) {
        if (event.type == cc.Node.EventType.MOUSE_UP) {
            var dbmgr = require("datamgr");
            var dbmgrinst = dbmgr.GetInstance();
            var tb = dbmgrinst.GetTalbeByName("Act");
        }
    },
    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.MOUSE_UP,this.mousefun);
        var d = require("datamgr").GetInstance();
        require("datamgr").GetInstance().Init();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
