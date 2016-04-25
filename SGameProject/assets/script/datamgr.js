cc.Class({
    extends: cc.Component,
    properties: {
        m_table : [],
    },
    
    GetInstance: function () {
        var _instance = _instance || {};
        if (_instance == null) {
            _instance = new this;
        }
        return _instance;
    },

    GetTalbeByName : function (tablename) {
        if (this.m_table[tablename] == null) {
            var mod = require(tablename + ".js");
            if (mod) {
                var tb = mod.LoadFromeJson(tablename + ".json");
                this.m_table[tablename] = tb;
            }
        }
        return this.m_table[tablename];
    },
});
