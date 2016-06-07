var DataMgr = require("DataMgr");
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    useSkill: function (role,skillid) {
        var skillinfo = DataMgr.instance.GetInfoByTalbeNameAndId("skill",skillid);
        if (skillinfo) {
            if (skillinfo.targettype == 1) {
                
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
