var StateMgr = require("StateMgr");
var DataMgr = require("DataMgr");
var Game = require("Game");
var RoleNodeState = require("RoleNodeState");
var RNStateDownBoom = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = require("RoleNode").StateType.DOWNBOOM;
        temp.node.stopAllActions();
        temp.ResetPosition();
        temp._brefresh = true;
        var cpos = temp._maphandle.GetPosByIndex(temp.idx);
        var drole = temp._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
        if (drole) {
            if (drole.info.bShake == true) {
                temp._boomdownToIdx = drole.idx;
            }
        }
        else {
            temp._boomdownToIdx = temp._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
        }
        temp._maphandle.SetRoleInIdx(null,temp.idx);
        if (!temp._boomdownToIdx|| temp._boomdownToIdx <= 0) {
            temp._maphandle.SetRoleInIdx(temp,temp.idx);
            temp._boomdownToIdx = null;
            require("SkillMgr").instance.UseSkill(temp,4);
        }
    },
    
    onExit: function (temp) {
        
    },
    
    onTick: function (temp,dt) {
        if (temp._boomdownToIdx && temp._boomdownToIdx >= 0) {
            temp.node.y -= dt * 300;            
            var topos = temp._maphandle.GetPosByIndex(temp._boomdownToIdx);
            var torole = temp._maphandle.GetRoleByPos(topos);
            var toppos = temp._maphandle.GetPixelPosByPos(topos);
            if (temp.node.y <= toppos.y) { //到达才开始继续检查
                var toidx;
                var cpos = temp._maphandle.GetPosByIndex(temp._boomdownToIdx);
                var drole = temp._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
                if (drole) {
                    if (drole.info.bShake == true) {
                        toidx = drole.idx;
                    }
                }
                else {
                    toidx = temp._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
                }
                if (toidx && toidx != temp._boomdownToIdx) {
                    if (drole) {
                        drole.ChangeState(require("RoleNode").StateType.BOOM);
                    }
                    //temp._maphandle.SetRoleInIdx(null,temp.idx);
                    temp._boomdownToIdx = toidx;
                    var pos = temp._maphandle.GetPosByIndex(temp.idx);
                    var uurole = temp._maphandle.GetRoleByPos(cc.v2(pos.x,pos.y-2));
                    if (uurole) {
                        uurole._brefresh = true;
                    }
                }
                else {
                    temp._maphandle.SetRoleInIdx(temp,temp._boomdownToIdx);
                    temp._boomdownToIdx = null;
                    require("SkillMgr").instance.UseSkill(temp,4);
                    return;
                }
            }
        }       
    },
});

RNStateDownBoom.instance = null;
RNStateDownBoom.GetInstance = function () {
    if (!RNStateDownBoom.instance) {
        RNStateDownBoom.instance = new RNStateDownBoom;
    }
    return RNStateDownBoom.instance;
}

//////////////////////////////////////////////////////////////////////////






RoleNodeState.RNStateDownBoom = RNStateDownBoom;


module.exports = RoleNodeState;