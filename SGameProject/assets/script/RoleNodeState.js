var StateMgr = require("StateMgr");
var NSStateIdle = cc.Class({
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
            if (re) {
                for (var key in linerole) {
                    if (linerole.hasOwnProperty(key)) {
                        var element = linerole[key];
                        element._brefresh = true;
                    }
                }
                cpre = temp.compareShakeLineRole(linerole);
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

NSStateIdle.instance = null;
NSStateIdle.GetInstance = function () {
    if (!NSStateIdle.instance) {
        NSStateIdle.instance = new NSStateIdle;
    }
    return NSStateIdle.instance;
}

//////////////////////////////////////////////////////////////////////////
var NSStateChange = cc.Class({
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

NSStateChange.instance = null;
NSStateChange.GetInstance = function () {
    if (!NSStateChange.instance) {
        NSStateChange.instance = new NSStateChange;
    }
    return NSStateChange.instance;
}

///////////////////////////////////////////////////////////////////////////
var NSStateShake = cc.Class({
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
            for (var key in temp._shakeLineRole) {
                if (temp._shakeLineRole.hasOwnProperty(key)) {
                    var element = temp._shakeLineRole[key];
                    element.changeState(require("RoleNode").StateType.BOOM);
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
            if (re) {
                for (var key in linerole) {
                    if (linerole.hasOwnProperty(key)) {
                        var element = linerole[key];
                        element._brefresh = true;
                    }
                }
                cpre = temp.compareShakeLineRole(linerole);
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

NSStateShake.instance = null;
NSStateShake.GetInstance = function () {
    if (!NSStateShake.instance) {
        NSStateShake.instance = new NSStateShake;
    }
    return NSStateShake.instance;
}


//////////////////////////////////////////////////////////////////////
var NSStateBoom = cc.Class({
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

NSStateBoom.instance = null;
NSStateBoom.GetInstance = function () {
    if (!NSStateBoom.instance) {
        NSStateBoom.instance = new NSStateBoom;
    }
    return NSStateBoom.instance;
}

/////////////////////////////////////////////////////////////////////////
var NSStateDown = cc.Class({
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
        }
    },
});

NSStateDown.instance = null;
NSStateDown.GetInstance = function () {
    if (!NSStateDown.instance) {
        NSStateDown.instance = new NSStateDown;
    }
    return NSStateDown.instance;
}


////////////////////////////////////////////////////////////////////////
var NSStateFloat = cc.Class({
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

NSStateFloat.instance = null;
NSStateFloat.GetInstance = function () {
    if (!NSStateFloat.instance) {
        NSStateFloat.instance = new NSStateFloat;
    }
    return NSStateFloat.instance;
}



var RoleNodeState = {
    NSStateIdle: NSStateIdle,
    NSStateChange: NSStateChange,
    NSStateShake: NSStateShake,
    NSStateBoom: NSStateBoom,
    NSStateDown: NSStateDown,
    NSStateFloat: NSStateFloat,
}



module.exports = RoleNodeState;