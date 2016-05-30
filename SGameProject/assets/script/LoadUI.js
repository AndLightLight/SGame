var DataMgr = require("DataMgr");
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
        
        StartLoading: {
            default: false,
            visible: false,  
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.StartLoading) {
            if (DataMgr.instance._totalLoadNum <= DataMgr.instance._currentLoadNum) {
                this.node.active = false;
                this.StartLoading = false;
            }
        }
    },
});
