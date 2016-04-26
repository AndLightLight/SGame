var DataMgr = cc.Class({
    extends: cc.Component,
    properties: {
        jsonPath: "project/assets/resources/json/",
        jsonHz: ".json",
        jsonConfig: [],
    },
    
    
    _loadCallBack: function (err,res) {
        if (err) {
            for (var i = 0;i < err.length;i ++){
                cc.log("json load error : " + err[i]);
            }
        }
        else{
            var jsonConfig = DataMgr.GetInstance().jsonConfig;
            var jsonPath = DataMgr.GetInstance().jsonPath;
            var jsonHz = DataMgr.GetInstance().jsonHz;
            var m_table = DataMgr.GetInstance().m_table;
            for (var i = 0;i < jsonConfig.length;i ++) {
                var tb = res.getContent(jsonPath + jsonConfig[i] + jsonHz);
                if (tb) {
                    m_table[jsonConfig[i]] = tb;    
                }
                else{
                    cc.log("table not load: " + jsonConfig[i]);
                }
            }
        }
    },

    GetTalbeByName : function (tablename) {
        if (this.m_table[tablename] == null) {
            cc.log("table is not load: " + tablename + ".json");
        }
        return this.m_table[tablename];
    },
    
    Init: function () {
        this.jsonConfig = [
            "act",
            "Action",
            "b被动技能",
        ];
        this.m_table = {};
        var resArray = [];
        for (var i = 0;i < this.jsonConfig.length;i ++) {
            resArray[i] = this.jsonPath + this.jsonConfig[i] + this.jsonHz;
        }
        cc.loader.load(resArray,this._loadCallBack)
    },
    
    
});


DataMgr._instance;
DataMgr.GetInstance = function (){
    if (DataMgr._instance == null) {
        DataMgr._instance = new DataMgr;
    }
    return DataMgr._instance;
};