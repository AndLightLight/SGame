var DataMgr = require("DataMgr");
var PoolMgr = require("PoolMgr");
var SkillMgr = cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        if (!SkillMgr.instance) {
            SkillMgr.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
    },

    UseSkill: function (role,skillid) {
        var skillinfo = DataMgr.instance.GetInfoByTalbeNameAndId("skill",skillid);
        if (skillinfo) {
            var torolelist = [];
            if (skillinfo.targettype == 1) {
                torolelist = role._maphandle.FindTenWordRole(role.idx);
            }
            else if (skillinfo.targettype == 2) {
                torolelist = role._maphandle.GetRoundRoleByIdx(role.idx);
                torolelist[torolelist.length] = role;
            }

            for (var key in torolelist) {
                if (torolelist.hasOwnProperty(key)) {
                    var element = torolelist[key];
                    if (element.info.bShake && element != role) {
                        require("BuffMgr").instance.AddBuff(role,element,skillinfo.givebuffid);                        
                    }
                }
            }
            if (skillinfo.selfbuffid) {
                require("BuffMgr").instance.AddBuff(role,role,skillinfo.selfbuffid);     
            }
            

            for (var i = 0;i < skillinfo.animationprefab.length;i ++) {
                var preid = skillinfo.animationprefab[i];
                var pre = DataMgr.instance.GetPrefabById(preid);
                if (!pre) {
                    continue;
                }
                var useX = skillinfo.useX[i];
                var useY = skillinfo.useY[i];

                //var aninode = cc.instantiate(pre);
                var aninode = PoolMgr.instance.GetNodeByPreId(preid);
                var anic = aninode.getComponent(require("AnimationCallBack"));
                var ani = aninode.getComponent(cc.Animation);
                ani.play();
                anic.preid = preid;
                anic.callBack = function () {
                    PoolMgr.instance.RemoveNodeByPreId(this.preid,this.node);
                };

                var fpos = role._maphandle.GetPixelPosByPos(role._maphandle.GetPosByIndex(role.idx));
                var apos = role._maphandle.GetMapCenterPPos();
                if (useX) {
                    apos.x = fpos.x;
                }
                if (useY) {
                    apos.y = fpos.y;
                }

                aninode.position = apos;
                aninode.parent = role.node.parent;
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
