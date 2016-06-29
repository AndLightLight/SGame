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
        temp._boomdownCurrentNum = 0;
        param?temp._boomdownNum = param:null;
        var cpos = temp._maphandle.GetPosByIndex(temp.idx);
        var drole = temp._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
        if (drole) {
            if (drole.bShake == true) {
                temp._boomdownToIdx = drole.idx;
                drole.ChangeState(require("RoleNode").StateType.BOOM);
            }
        }
        else {
            temp._boomdownToIdx = temp._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
        }


        
        if (!temp._boomdownToIdx|| temp._boomdownToIdx <= 0) {
            require("SkillMgr").instance.UseSkill(temp,4);
        }
        else {
            var oldrole = temp._maphandle.GetRoleByPos(cpos);
            if (oldrole && oldrole.guid == temp.guid) {
                temp._maphandle.SetRoleInIdx(null,temp.idx);
            }
        }
    },
    
    onExit: function (temp) {
        temp._boomdownToIdx = null;
        temp._boomdownNum = 0;
        temp._boomdownCurrentNum = 0;
    },
    
    onTick: function (temp,dt) {
        if (temp._boomdownToIdx && temp._boomdownToIdx >= 0) {
            temp.node.y -= dt * 200;            
            var topos = temp._maphandle.GetPosByIndex(temp._boomdownToIdx);
            var torole = temp._maphandle.GetRoleByPos(topos);
            var toppos = temp._maphandle.GetPixelPosByPos(topos);
            if (temp.node.y <= toppos.y) { //到达才开始继续检查
                temp._boomdownCurrentNum ++;
                var toidx;
                var cpos = temp._maphandle.GetPosByIndex(temp._boomdownToIdx);
                var drole = temp._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
                if (drole) {
                    if (drole.bShake == true) {
                        toidx = drole.idx;
                    }
                }
                else {
                    toidx = temp._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
                }
                if (toidx && toidx != temp._boomdownToIdx && (temp._boomdownNum == 0 || (temp._boomdownNum != 0 && temp._boomdownCurrentNum < temp._boomdownNum) )) {
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
                    var oldrole = temp._maphandle.GetRoleByIndex(temp.idx);
                    if (oldrole && oldrole.guid == temp.guid) {
                        temp._maphandle.SetRoleInIdx(temp,temp._boomdownToIdx);
                    }
                    else {
                        temp.idx = temp._boomdownToIdx
                    }
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

var RNStateCreate = cc.Class({
    //extends: cc.Component,

    properties: {

    },

    onEnter: function (temp,param) {
        temp.stateType = require("RoleNode").StateType.CREATE;
        temp.node.stopAllActions();
        temp.ResetPosition();
        temp._lastroleid = 0;
        temp._currentDownTime = 0;
        temp._maphandle.CurrentStageAllWeight = 0;
    },
    
    onExit: function (temp) {

    },
    
    onTick: function (temp,dt) {
        if (require("Game").instance._isdown) {

            var paramlist = DataMgr.instance.GetTalbeByName("stageparam");
            var index = temp._maphandle.CurrentStageParamInfo?temp._maphandle.CurrentStageParamInfo.id:0;
            for (; index < paramlist.length; index++) {
                var element = paramlist[index];
                if (element.stageid == temp._maphandle.info.id) {
                    if (element.type == 1) {
                        if (temp._maphandle.playTime >= element.param) {
                            temp._maphandle.CurrentStageParamInfo = element;
                            var allweight = 0;
                            for (var index = 0; index <  temp._maphandle.CurrentStageParamInfo.roleweight.length; index++) {
                                var weight =  temp._maphandle.CurrentStageParamInfo.roleweight[index];
                                allweight += weight;
                            }
                            temp._maphandle.CurrentStageAllWeight = allweight;
                            break;
                        }
                    }
                    else if (element.type == 2) {
                        if (temp._maphandle.score >= element.param) {
                            temp._maphandle.CurrentStageParamInfo = element;
                            var allweight = 0;
                            for (var index = 0; index <  temp._maphandle.CurrentStageParamInfo.roleweight.length; index++) {
                                var weight =  temp._maphandle.CurrentStageParamInfo.roleweight[index];
                                allweight += weight;
                            }
                            temp._maphandle.CurrentStageAllWeight = allweight;
                            break;
                        }
                    }
                    break;
                }
            }



            if (temp._currentDownTime >= temp._maphandle.CurrentStageParamInfo.downspeed) {
                temp._currentDownTime = 0;
                var num = temp._maphandle.CurrentStageParamInfo.roleid.length;
                do {
                    var r = Math.ceil(Math.random()*(temp._maphandle.CurrentStageAllWeight));
                    var currentweight = 0;
                    var roleid = 0;
                    for (var index = 0; index < temp._maphandle.CurrentStageParamInfo.roleweight.length; index++) {
                        var weight = temp._maphandle.CurrentStageParamInfo.roleweight[index];
                        currentweight += weight;
                        if (r <= currentweight) {
                            roleid = temp._maphandle.CurrentStageParamInfo.roleid[index];
                            break;
                        }
                    }
                    
                } while (roleid == temp._lastroleid);
                temp._lastroleid = roleid;
                var cpos = temp._maphandle.GetPosByIndex(temp.idx);
                var drole = temp._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
                if (!drole) {
                    var didx = temp._maphandle.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
                    temp._maphandle.CreateRole(roleid,didx,require("RoleNode").StateType.DOWN);
                }
            }

            temp._currentDownTime += dt;

        }          
    },
});

RNStateCreate.instance = null;
RNStateCreate.GetInstance = function () {
    if (!RNStateCreate.instance) {
        RNStateCreate.instance = new RNStateCreate;
    }
    return RNStateCreate.instance;
}

//////////////////////////////////////////////////////////////////////////




RoleNodeState.RNStateDownBoom = RNStateDownBoom;
RoleNodeState.RNStateCreate = RNStateCreate;


module.exports = RoleNodeState;