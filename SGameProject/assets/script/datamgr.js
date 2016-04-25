var DataMgr = cc.Class({
    extends: cc.Component,
    properties: {
        m_table : [],
    },
    
    GetInstance: function () {

    },

    GetTalbeByName : function (tablename) {
        if (this.m_table[tablename] == null) {
            var mod = require(tablename);
            if (mod) {
                var tb = mod.LoadFromeJson(tablename + ".json");
                this.m_table[tablename] = tb;
            }
        }
        return this.m_table[tablename];
    },
});


DataMgr._instance;
DataMgr.GetInstance = function (){
    if (DataMgr._instance == null) {
        DataMgr._instance = new DataMgr;
    }
    return DataMgr._instance;
};