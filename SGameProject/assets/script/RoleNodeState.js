var StateMgr = require("StateMgr");
var DataMgr = require("DataMgr");
var Game = require("Game");
var RNStateIdle = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = require("RoleNode").StateType.IDLE;
        temp.node.stopAllActions();
        temp.ResetPosition();
        temp._brefresh = true;
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        do {
            var toidx = temp.CheckCanDown();
            if (toidx) {
                temp.ChangeState(require("RoleNode").StateType.DOWN,toidx);
                break;
            }
            var cpre = true;
            var result = temp.CheckCanShake();
            var re = result.result;
            var linerole = result.linerole;
            var mergettoroleid = result.mergeroleid;
            if (re) {
                for (var key in linerole) {
                    if (linerole.hasOwnProperty(key)) {
                        var element = linerole[key];
                        element._brefresh = true;
                    }
                }
                cpre = temp.CompareShakeLineRole(linerole,mergettoroleid);
                if (!cpre) {
                    temp.ChangeState(require("RoleNode").StateType.SHAKE);
                    for (var key in temp._shakeLineRole) {
                        if (temp._shakeLineRole.hasOwnProperty(key)) {
                            var element = temp._shakeLineRole[key];
                            element.ChangeState(require("RoleNode").StateType.SHAKE);
                        }
                    }
                }
                break;
            }
            temp._brefresh = false;
            break;
        }while (true)
    },
});

RNStateIdle.instance = null;
RNStateIdle.GetInstance = function () {
    if (!RNStateIdle.instance) {
        RNStateIdle.instance = new RNStateIdle;
    }
    return RNStateIdle.instance;
}

//////////////////////////////////////////////////////////////////////////
var RNStateChange = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        var toidx = param;
        temp.stateType = require("RoleNode").StateType.CHANGE;
        temp.node.stopAllActions();
        var ppos = temp._maphandle.GetPixelPosByPos(temp._maphandle.GetPosByIndex(toidx));
        var action = cc.moveTo(0.5, ppos);
        var callfun = cc.callFunc(function (params) {
            temp.ChangeState(require("RoleNode").StateType.IDLE);
            temp.node.zIndex = 0;
            temp._brefresh = true;
        },temp);
        var sqe = cc.sequence(action,callfun);
        temp.node.runAction(sqe);
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        
    },
});

RNStateChange.instance = null;
RNStateChange.GetInstance = function () {
    if (!RNStateChange.instance) {
        RNStateChange.instance = new RNStateChange;
    }
    return RNStateChange.instance;
}

///////////////////////////////////////////////////////////////////////////
var RNStateShake = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = require("RoleNode").StateType.SHAKE;
        temp.node.stopAllActions();
        temp.ResetPosition();
        var right = cc.moveBy(0.1, 2, 0);
        var left = cc.moveBy(0.1, -2, 0);
        var sqerl = cc.sequence(right,left);
        var rep = cc.repeat(sqerl,10);
        
        var callfun = cc.callFunc(function (params) {
            if (temp.stateType == require("RoleNode").StateType.SHAKE) {
                if (temp._mergetoroleid > 0) {
                    var torole = require("RoleNode").FindLowestRole(temp._shakeLineRole);
                    if (torole) {
                        var tempshakeLineRole = temp._shakeLineRole.slice(0);
                        for (var key in tempshakeLineRole) {
                            if (tempshakeLineRole.hasOwnProperty(key)) {
                                var element = tempshakeLineRole[key];
                                if (element.info.level == 1) {
                                    element.ChangeState(require("RoleNode").StateType.MERGE,torole.idx);
                                }
                                else {
                                    element.ChangeState(require("RoleNode").StateType.BOOM,torole.idx);
                                }
                                element._brefresh = false;
                            }
                        }
                        var mergetoroleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",temp._mergetoroleid);
                        torole._maphandle.CreateRole(temp._mergetoroleid,torole.idx,require("RoleNode").StateType.IDLE);
                        
                        // torole.ChangeState(require("RoleNode").StateType.IDLE);
                        // torole._maphandle.RemoveRole(torole);
                    }
                }
                else {
                    var tempshakeLineRole = temp._shakeLineRole.slice(0);
                    for (var key in tempshakeLineRole) {
                        if (tempshakeLineRole.hasOwnProperty(key)) {
                            var element = tempshakeLineRole[key];
                            element.ChangeState(require("RoleNode").StateType.BOOM);
                            element._brefresh = false;
                        }
                    }
                }
            }
        },temp);
        var sqe = cc.sequence(rep,callfun);
        temp.node.runAction(sqe);
    },
    
    onExit: function (temp) {
        temp._shakeLineRole = [];
    },
    
    onTick: function (temp,dt) {
        do {
            var toidx = temp.CheckCanDown();
            if (toidx) {
                temp.ChangeState(require("RoleNode").StateType.DOWN,toidx);
                break;
            }
            var cpre = true;
            var result = temp.CheckCanShake();
            var re = result.result;
            var linerole = result.linerole;
            var mergettoroleid = result.mergeroleid;
            if (re) {
                for (var key in linerole) {
                    if (linerole.hasOwnProperty(key)) {
                        var element = linerole[key];
                        element._brefresh = true;
                    }
                }
                cpre = temp.CompareShakeLineRole(linerole,mergettoroleid);
                if (!cpre) {
                    temp.ChangeState(require("RoleNode").StateType.SHAKE);
                    for (var key in temp._shakeLineRole) {
                        if (temp._shakeLineRole.hasOwnProperty(key)) {
                            var element = temp._shakeLineRole[key];
                            element.ChangeState(null);
                            element.ChangeState(require("RoleNode").StateType.SHAKE);
                        }
                    }
                }
                break;
            }
            temp.ChangeState(require("RoleNode").StateType.IDLE);
            break;
        }while (true)
    },
});

RNStateShake.instance = null;
RNStateShake.GetInstance = function () {
    if (!RNStateShake.instance) {
        RNStateShake.instance = new RNStateShake;
    }
    return RNStateShake.instance;
}


//////////////////////////////////////////////////////////////////////
var RNStateBoom = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.ResetPosition();
        temp.stateType = require("RoleNode").StateType.BOOM;
        temp.node.stopAllActions();
        require("SkillMgr").instance.UseSkill(temp,temp.info.boomSkill);
        temp._maphandle.AddScore(temp.info.score);
        // var be = cc.instantiate(temp.boomEffect);
        // var bea = be.getComponent(require("AnimationCallBack"));
        // bea.callBack = function () {
        //     var node = this.node.parent;
        //     var rolenode = node.getComponent(require("RoleNode"));
        //     rolenode._maphandle.RemoveRole(rolenode);
        //     rolenode.RefreshRound();
        // };
        // be.parent = temp.node;
        // be.x = 0;
        // be.y = 0;
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        
    },
});

RNStateBoom.instance = null;
RNStateBoom.GetInstance = function () {
    if (!RNStateBoom.instance) {
        RNStateBoom.instance = new RNStateBoom;
    }
    return RNStateBoom.instance;
}

/////////////////////////////////////////////////////////////////////////
var RNStateDown = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        if (!param) {
            param = temp.CheckCanDown();
        }
        if (!param) {
            temp.ChangeState(require("RoleNode").StateType.IDLE);
            return;
        }
        temp._brefresh = true;
        var toidx = param;
        temp.stateType = require("RoleNode").StateType.DOWN;
        temp.node.stopAllActions();
        temp._maphandle.SetRoleInIdx(null,temp.idx);
        temp._maphandle.SetRoleInIdx(temp,toidx);
        temp._downToIdx = toidx;

        temp.RefreshRound();
    },
    
    onExit: function (temp) {
        temp._downToIdx = null;
    },
    
    onTick: function (temp,dt) {
        if (temp._downToIdx && temp._downToIdx >= 0) {
            temp.node.y -= dt * 300;            
            var topos = temp._maphandle.GetPosByIndex(temp._downToIdx);
            var torole = temp._maphandle.GetRoleByPos(topos);
            var toppos = temp._maphandle.GetPixelPosByPos(topos);
            if (temp.node.y <= toppos.y) { //到达才开始继续检查
                var toidx = temp.CheckCanDown();
                if (toidx && toidx != temp._downToIdx) {
                    temp._maphandle.SetRoleInIdx(null,temp.idx);
                    temp._maphandle.SetRoleInIdx(temp,toidx);
                    temp._downToIdx = toidx;
                    var pos = temp._maphandle.GetPosByIndex(temp.idx);
                    var uurole = temp._maphandle.GetRoleByPos(cc.v2(pos.x,pos.y-2));
                    if (uurole) {
                        uurole._brefresh = true;
                    }
                }
                else {
                    temp._downToIdx = null;
                    temp.ChangeState(require("RoleNode").StateType.IDLE);
                    return;
                }
            }
        }
    },
});

RNStateDown.instance = null;
RNStateDown.GetInstance = function () {
    if (!RNStateDown.instance) {
        RNStateDown.instance = new RNStateDown;
    }
    return RNStateDown.instance;
}


////////////////////////////////////////////////////////////////////////
var RNStateFloat = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = require("RoleNode").StateType.FLOAT;
        temp.node.stopAllActions();
        temp.ResetPosition();
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        
    },
});

RNStateFloat.instance = null;
RNStateFloat.GetInstance = function () {
    if (!RNStateFloat.instance) {
        RNStateFloat.instance = new RNStateFloat;
    }
    return RNStateFloat.instance;
}


////////////////////////////////////////////////////////////////////////
var RNStateMerge = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        var toidx = param
        temp.ResetPosition();
        temp.stateType = require("RoleNode").StateType.MERGE;
        temp.node.stopAllActions();
        var ppos = temp._maphandle.GetPixelPosByPos(temp._maphandle.GetPosByIndex(toidx));
        var mt = cc.moveTo(0.2,ppos);
        var ft = cc.fadeTo(0.2,1);
        var swp = cc.spawn(mt,ft);
        //require("SkillMgr").instance.UseSkill(temp,temp.info.boomSkill);
        var callfun = cc.callFunc(function (params) {
            var node = temp.node;
            var rolenode = node.getComponent(require("RoleNode"));
            rolenode.ChangeState(require("RoleNode").StateType.BOOM);
        },temp);
        var sqe = cc.sequence(swp,callfun);
        temp.node.runAction(sqe);
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        
    },
});

RNStateMerge.instance = null;
RNStateMerge.GetInstance = function () {
    if (!RNStateMerge.instance) {
        RNStateMerge.instance = new RNStateMerge;
    }
    return RNStateMerge.instance;
}



var RoleNodeState = {
    RNStateIdle: RNStateIdle,
    RNStateChange: RNStateChange,
    RNStateShake: RNStateShake,
    RNStateBoom: RNStateBoom,
    RNStateDown: RNStateDown,
    RNStateFloat: RNStateFloat,
    RNStateMerge: RNStateMerge,
}



module.exports = RoleNodeState;