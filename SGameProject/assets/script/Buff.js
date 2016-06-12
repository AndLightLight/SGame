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
                this.torole.changeState(require("RoleNode").StateType.BOOM);
                this.torole._maphandle.removeRole(this.torole);
                this.torole.refreshRound();
            }
            else if (this.info.triggertype == 2) {
                var num = this.torole._maphandle.info.roleid.length;
                var r = Math.ceil(Math.random()*(num-1)+1);
                var roleid = this.torole._maphandle.info.roleid[r-1];
                var cpos = this.torole._maphandle.getPosByIndex(this.torole.idx);
                var drole = this.torole._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
                if (!drole) {
                    var didx = this.torole._maphandle.getIndexByPos(cc.v2(cpos.x,cpos.y+1));                    
                    this.torole._maphandle.createRole(roleid,didx,require("RoleNode").StateType.DOWN);
                }
                
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

            if (this._currenttime >= this.info.duration && this.info.duration != -1) {
                this.isActive = false;
                return;
            }

            this._currenttime += dt;
            this._triggertime += dt;
        }
    },
});
