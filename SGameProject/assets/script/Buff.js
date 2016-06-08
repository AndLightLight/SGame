var BuffMgr = require("BuffMgr");
var Buff = cc.Class({
    extends: cc.Component,

    properties: {
        guid: 0,
        info: null,
        fromrole: null,
        torole: null,

        _currenttime: 0,
        _triggertime: 0,

        isActive: true,
    },

    // use this for initialization
    onLoad: function () {

    },

    trigger: function () {
        if (this.info) {
            if (this.info.triggertype == 1) {
                this.torole._maphandle.removeRole(this.torole);
                this.torole.refreshRound();
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.info) {
            if (!this.torole || !this.torole.node || this.torole.node.isValid == false) {
                this.isActive = false;
                return;
            }

            if (this._triggertime >= this.info.triggercd) {
                this._triggertime = 0;
                this.trigger();
            }

            if (this._currenttime >= this.info.duration) {
                this.isActive = false;
                return;
            }

            this._currenttime += dt;
            this._triggertime += dt;
        }
    },
});
