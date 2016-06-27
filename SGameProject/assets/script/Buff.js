var BuffMgr = require("BuffMgr");
var PoolMgr = require("PoolMgr");
var Buff = cc.Class({
    extends: cc.Component,

    properties: {
        guid: 0,
        info: null,
        fromrole: null,
        torole: null,
        aninode: [],

        _currenttime: 0,
        _triggertime: 0,
        _triggernum: 0,

        isActive: true,
    },

    // use this for initialization
    onLoad: function () {
        this._triggernum = this.info.triggernum;
    },

    Clear: function () {
        this.trigger(0);
        this.guid = 0;
        this.info = null;
        this.fromrole = null;
        this.torole = null;
        for (var index = 0; index < this.aninode.length; index++) {
            var element = this.aninode[index];
            PoolMgr.instance.RemoveNodeByPreId(element.prefabid,element);
        }
        this.aninode = [];
        this._currenttime = 0;
        this._triggertime = 0;
        this._triggernum = 0;
    },


// 1是触发自己的技能
// 2是生产
// 3是进入下落爆炸状态
// 4是直接销毁
// 5是改某个属性，参数1是属性名，2是增加改变或减少，3是是否永久，4是值
// 6清除某个id的buff
// 7是改某个属性
    trigger: function (isBegin) {
        if (this.info) {
            if (this.info.triggertype == 1) {
                if (isBegin) {
                    require("SkillMgr").instance.UseSkill(this.torole,this.torole.boomSkill);
                }
            }
            else if (this.info.triggertype == 2) {
                if (isBegin && require("Game").instance._isdown) {
                    var num = this.torole._maphandle.info.roleid.length;
                    do {
                        var r = Math.ceil(Math.random()*(num));
                        var roleid = this.torole._maphandle.info.roleid[r-1];
                    } while (roleid == this.lastroleid);
                    this.lastroleid = roleid;
                    var cpos = this.torole._maphandle.GetPosByIndex(this.torole.idx);
                    var drole = this.torole._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
                    if (!drole) {
                        var didx = this.torole._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
                        this.torole._maphandle.CreateRole(roleid,didx,require("RoleNode").StateType.DOWN);
                    }
                }
            }
            else if (this.info.triggertype == 3) {
                if (isBegin) {
                    this.torole.ChangeState(require("RoleNode").StateType.DOWNBOOM,this.info.param[0]);
                }
            }
            else if (this.info.triggertype == 4) {
                if (isBegin) {
                    this.torole._maphandle.RemoveRole(this.torole);
                    this.torole.RefreshRound();
                }
            }
            else if (this.info.triggertype == 5) {
                if (isBegin) {
                    this.torole[this.info.param[0]]?this[this.info.param[0]] = this.torole[this.info.param[0]]:null;
                    if (this.info.param[1] != 0) {
                        this.torole[this.info.param[0]]?this.torole[this.info.param[0]] += this.info.param[1]*this.info.param[3]:null;
                    }
                    else {
                        this.torole[this.info.param[0]]?this.torole[this.info.param[0]] = this.info.param[3]:null;
                    }
                }
                else {
                    if (this.info.param[2] == 0) {
                        if (this.info.param[1] != 0) {
                            this.torole[this.info.param[0]]?this.torole[this.info.param[0]] += -this.info.param[1]*this.info.param[3]:null;
                        }
                        else {
                            this.torole[this.info.param[0]]?this.torole[this.info.param[0]] = this[this.info.param[0]]:null;
                        }
                    }
                }
            }
            else if (this.info.triggertype == 6) {
                if (isBegin) {
                    for (var index = 0; index < this.info.param.length; index++) {
                        var buffid = this.info.param[index];
                        BuffMgr.instance.ClearBuffByRole(this.torole,buffid);
                    }
                    this.torole.ChangeState(require("RoleNode").StateType.IDLE);
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

            if (this._triggertime >= this.info.triggercd && (this.info.triggernum == 0 || this._triggernum > 0)) {
                this._triggertime = 0;
                this.trigger(1);
                this._triggernum --;
            }

            if ((this._currenttime >= this.info.duration && this.info.duration != -1) ) {
                this.isActive = false;
                return;
            }

            this._currenttime += dt;
            this._triggertime += dt;
        }
    },
});
