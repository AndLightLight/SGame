cc.Class({
    extends: cc.Component,

    properties: {
        jumpheight:0,
        time:0
    },

    // use this for initialization
    onLoad: function () {
        var jumpac = cc.jumpBy(this.time, 0, 0, 300, 1);
        var rep = cc.repeatForever(jumpac);
        this.node.runAction(rep);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
