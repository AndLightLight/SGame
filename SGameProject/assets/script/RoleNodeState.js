var StateMgr = require("StateMgr");
var DataMgr = require("DataMgr");
var RNStateIdle = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = require("RoleNode").StateType.IDLE;
        temp.node.stopAllActions();
        temp.resetPosition();
        temp._brefresh = true;
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        do {
            var toidx = temp.checkCanDown();
            if (toidx) {
                temp.changeState(require("RoleNode").StateType.DOWN,toidx);  
                break;
            }
            var cpre = true;
            var result = temp.checkCanShake();
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
                cpre = temp.compareShakeLineRole(linerole,mergettoroleid);
                if (!cpre) {
                    temp.changeState(require("RoleNode").StateType.SHAKE);
                    for (var key in temp._shakeLineRole) {
                        if (temp._shakeLineRole.hasOwnProperty(key)) {
                            var element = temp._shakeLineRole[key];
                            element.changeState(require("RoleNode").StateType.SHAKE);
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
        var ppos = temp._maphandle.getPixelPosByPos(temp._maphandle.getPosByIndex(toidx));
        var action = cc.moveTo(0.5, ppos);
        var callfun = cc.callFunc(function (params) {
            temp.changeState(require("RoleNode").StateType.IDLE);
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
        temp.resetPosition();
        var right = cc.moveBy(0.1, 2, 0);
        var left = cc.moveBy(0.1, -2, 0);
        var sqerl = cc.sequence(right,left);
        var rep = cc.repeat(sqerl,10);
        
        var callfun = cc.callFunc(function (params) {
            if (temp.stateType == require("RoleNode").StateType.SHAKE) {
                if (temp._mergetoroleid > 0) {
                    var torole = require("RoleNode").findLowestRole(temp._shakeLineRole);
                    if (torole) {
                        var tempshakeLineRole = temp._shakeLineRole.slice(0);
                        for (var key in tempshakeLineRole) {
                            if (tempshakeLineRole.hasOwnProperty(key)) {
                                var element = tempshakeLineRole[key];
                                if (torole != element) {
                                    element.changeState(require("RoleNode").StateType.MERGE,torole.idx);
                                    element._brefresh = false;
                                }
                            }
                        }
                        var mergetoroleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",temp._mergetoroleid);
                        var pre = DataMgr.instance.GetPrefabById(mergetoroleinfo.prefabid);
                        var nd = cc.instantiate(pre);
                        nd.x = torole.node.x;
                        nd.y = torole.node.y;
                        nd.parent = torole.node.parent;
                        var rolenode = nd.getComponent(require("RoleNode"));
                        rolenode.info = mergetoroleinfo;
                        torole._maphandle.setRoleInIdx(rolenode,torole.idx);
                        rolenode.changeState(require("RoleNode").StateType.IDLE);
                        torole.changeState(require("RoleNode").StateType.IDLE);
                        torole._brefresh = false;
                        torole.node.destroy();
                    }
                }
                else {
                    var tempshakeLineRole = temp._shakeLineRole.slice(0);
                    for (var key in tempshakeLineRole) {
                        if (tempshakeLineRole.hasOwnProperty(key)) {
                            var element = tempshakeLineRole[key];
                            element.changeState(require("RoleNode").StateType.BOOM);
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
            var toidx = temp.checkCanDown();
            if (toidx) {
                temp.changeState(require("RoleNode").StateType.DOWN,toidx);  
                break;
            }
            var cpre = true;
            var result = temp.checkCanShake();
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
                cpre = temp.compareShakeLineRole(linerole,mergettoroleid);
                if (!cpre) {
                    temp.changeState(require("RoleNode").StateType.SHAKE);
                    for (var key in temp._shakeLineRole) {
                        if (temp._shakeLineRole.hasOwnProperty(key)) {
                            var element = temp._shakeLineRole[key];
                            element.changeState(null);
                            element.changeState(require("RoleNode").StateType.SHAKE);
                        }
                    }
                }
                break;
            }
            temp.changeState(require("RoleNode").StateType.IDLE);
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
        temp.resetPosition();
        temp.stateType = require("RoleNode").StateType.BOOM;
        temp.node.stopAllActions();
        var be = cc.instantiate(temp.boomEffect);
        var bea = be.getComponent(require("AnimationCallBack"));
        bea.callBack = function () {
            var node = this.node.parent;
            node.destroy();
            var rolenode = node.getComponent(require("RoleNode"));
            rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
            rolenode.refreshRound();
        };
        be.parent = temp.node;
        be.x = 0;
        be.y = 0;
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
        var toidx = param;
        temp.stateType = require("RoleNode").StateType.DOWN;
        temp.node.stopAllActions();
        temp._maphandle.setRoleInIdx(null,temp.idx);
        temp._maphandle.setRoleInIdx(temp,toidx);
        temp._downToIdx = toidx;
        temp.refreshRound();
    },
    
    onExit: function (temp) {
        temp._downToIdx = null;
    },
    
    onTick: function (temp,dt) {
        if (temp._downToIdx && temp._downToIdx >= 0) {
            var toppos = temp._maphandle.getPixelPosByPos(temp._maphandle.getPosByIndex(temp._downToIdx));
            if (temp.node.y <= toppos.y) { //到达才开始继续检查
                var toidx = temp.checkCanDown();
                if (toidx && toidx != temp._downToIdx) {
                    temp._maphandle.setRoleInIdx(null,temp.idx);
                    temp._maphandle.setRoleInIdx(temp,toidx);
                    temp._downToIdx = toidx;
                    var pos = temp._maphandle.getPosByIndex(temp.idx);
                    var uurole = temp._maphandle.getRoleByPos(cc.v2(pos.x,pos.y-2));
                    if (uurole) {
                        uurole._brefresh = true;
                    }
                }
                else {
                    var toidx = temp.checkCanDown();
                    temp._downToIdx = null;
                    temp.changeState(require("RoleNode").StateType.IDLE);
                    return;
                }
            }
            temp.node.y -= dt * 300;
            if (temp.node.y <= toppos.y) {
                temp.node.y = toppos.y;
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
        temp.resetPosition();
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
        temp.resetPosition();
        temp.stateType = require("RoleNode").StateType.MERGE;
        temp.node.stopAllActions();
        var ppos = temp._maphandle.getPixelPosByPos(temp._maphandle.getPosByIndex(toidx));
        var mt = cc.moveTo(0.2,ppos);
        var ft = cc.fadeTo(0.2,0);
        var swp = cc.spawn(mt,ft);
        var callfun = cc.callFunc(function (params) {
            var node = temp.node;
            node.destroy();
            var rolenode = temp;
            rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
            rolenode.refreshRound();
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