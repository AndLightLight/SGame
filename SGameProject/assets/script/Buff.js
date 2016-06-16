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
        _triggernum: 0,

        isActive: true,
    },

    // use this for initialization
    onLoad: function () {
        this._triggernum = this.info.triggernum;
    },

    trigger: function () {
        if (this.info) {
            if (this.info.triggertype == 1) {
                this.torole.ChangeState(require("RoleNode").StateType.BOOM);
                this.torole._maphandle.RemoveRole(this.torole);
                this.torole.RefreshRound();
            }
            else if (this.info.triggertype == 2) {
                var num = this.torole._maphandle.info.roleid.length;
                var r = Math.ceil(Math.random()*(num-1)+1);
                var roleid = this.torole._maphandle.info.roleid[r-1];
                var cpos = this.torole._maphandle.GetPosByIndex(this.torole.idx);
                var drole = this.torole._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
                if (!drole) {
                    var didx = this.torole._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
                    this.torole._maphandle.CreateRole(roleid,didx,require("RoleNode").StateType.DOWN);
                }
                
            }
            else if (this.info.triggertype == 3) {
                this.torole.ChangeState(require("RoleNode").StateType.DOWNBOOM);
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

            if (this._triggertime >= this.info.triggercd && (this.info.triggernum == 0 || this._triggernum > 0)) {
                this._triggertime = 0;
                this.trigger();
                this._triggernum --;
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
