var StateMgr = require("StateMgr");
var NodeRole = require("NodeRole");
var StateType = NodeRole.StateType;
var NSStateIdle = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = StateType.IDLE;
        temp.node.stopAllActions();
        temp.resetPosition();
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        
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
        temp.stateType = StateType.CHANGE;
        temp.node.stopAllActions();
        var ppos = temp._maphandle.getPixelPosByPos(temp._maphandle.getPosByIndex(toidx));
        var action = cc.moveTo(0.5, ppos);
        var callfun = cc.callFunc(function (params) {
            temp.node.zIndex = 0;
            temp.refreshState();
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
        temp.stateType = StateType.SHAKE;
        temp.node.stopAllActions();
        temp.resetPosition();
        var right = cc.moveBy(0.1, 2, 0);
        var left = cc.moveBy(0.1, -2, 0);
        var sqerl = cc.sequence(right,left);
        var rep = cc.repeat(sqerl,10);
        
        var callfun = cc.callFunc(function (params) {
            temp.changeState(StateType.BOOM);
        },temp);
        var sqe = cc.sequence(rep,callfun);
        temp.node.runAction(sqe);
    },
    
    onExit: function (temp) {
        this._shakeLineRole = [];
    },
    
    onTick: function (temp,dt) {
        
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
        temp.stateType = StateType.BOOM;
        temp.node.stopAllActions();
        var be = cc.instantiate(temp.boomEffect);
        var bea = be.getComponent(require("AnimationCallBack"));
        bea.callBack = function () {
            var node = temp.node.parent;
            node.destroy();
            var rolenode = node.getComponent(RoleNode);
            rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
            var cpos = rolenode._maphandle.getPosByIndex(rolenode.idx);
            var urole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
            var lurole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
            var rurole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
            rolenode._maphandle.pushRefreshMap(urole);
            rolenode._maphandle.pushRefreshMap(lurole);
            rolenode._maphandle.pushRefreshMap(rurole);
            rolenode._maphandle.removeRefreshMap(rolenode);
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
        temp.stateType = StateType.DOWN;
        temp.node.stopAllActions();
        temp._maphandle.setRoleInIdx(null,temp.idx);
        temp._maphandle.setRoleInIdx(temp,toidx);
        temp._downToIdx = toidx;
    },
    
    onExit: function (temp) {
        temp._downToIdx = null;
    },
    
    onTick: function (temp,dt) {
        if (temp._downToIdx && temp._downToIdx >= 0 && temp.stateType == StateType.DOWN) {
            var toppos = temp._maphandle.getPixelPosByPos(temp._maphandle.getPosByIndex(temp._downToIdx));
            if (temp.node.y <= toppos.y) { //到达才开始继续检查
                var toidx = temp.checkCanDown();
                if (toidx && toidx != temp._downToIdx) {
                    temp._maphandle.setRoleInIdx(null,temp.idx);
                    temp._maphandle.setRoleInIdx(temp,toidx);
                    temp._downToIdx = toidx;
                    var pos = temp._maphandle.getPosByIndex(temp.idx);
                    var urole = temp._maphandle.getRoleByPos(cc.v2(pos.x,pos.y-2));
                    temp._maphandle.pushRefreshMap(urole);
                    if (urole) {
                        urole.refreshState();
                    }
                }
                else {
                    var toidx = temp.checkCanDown();
                    temp._downToIdx = null;
                    temp.stateType = StateType.IDLE;
                    temp.resetPosition();
                    temp.refreshState();
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
        temp.stateType = StateType.FLOAT;
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



var NodeRoleState = {}
NodeRoleState.NSStateIdle = NSStateIdle;
NodeRoleState.NSStateChange = NSStateChange;
NodeRoleState.NSStateShake = NSStateShake;
NodeRoleState.NSStateBoom = NSStateBoom;
NodeRoleState.NSStateDown = NSStateDown;
NodeRoleState.NSStateFloat = NSStateFloat;


module.export = NodeRoleState;