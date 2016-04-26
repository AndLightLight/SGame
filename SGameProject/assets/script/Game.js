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
        bDown: false,
    },
    mousefun: function (event) {
        if (event.type == cc.Node.EventType.MOUSE_UP) {
            var dbmgr = require("datamgr");
            var dbmgrinst = dbmgr.GetInstance();
            var tb = dbmgrinst.GetTalbeByName("act");
            var info = dbmgrinst.GetInfoByTalbeNameAndId("act",13);
            var test1 = info["看"];
            var test2 = info.看;
            var node = event.currentTarget;
            node.bDown = false;
        }
        else if (event.type == cc.Node.EventType.MOUSE_DOWN) {
            if (event instanceof cc.Event.EventMouse) {
                var node = event.currentTarget;
                var mx = event.getLocation().x;
                var my = event.getLocation().y;
                var nx = node.x;
                var ny = node.y;
                node.bDown = true;
            }
        }
        else if (event.type == cc.Node.EventType.MOUSE_MOVE) {
            var node = event.currentTarget;
            var mx = event.getLocation().x;
            var my = event.getLocation().y;
            var nx = node.x;
            var ny = node.y;
            if (node.bDown) {
                node.x = mx;
                node.y = my;
            }
        }
    },
    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.MOUSE_UP,this.mousefun);
        this.node.on(cc.Node.EventType.MOUSE_DOWN,this.mousefun);
        this.node.on(cc.Node.EventType.MOUSE_MOVE,this.mousefun);
        require("datamgr").GetInstance().Init();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
