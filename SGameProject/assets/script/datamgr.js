var DataMgr = cc.Class({
    extends: cc.Component,
    properties: {
        jsonPath: "json/",
        jsonHz: ".json",
        jsonConfig: [cc.String],
    },
    
    
    GetPrefabById: function (id) {
        if (this.m_preLoadTable) {
            return this.m_preLoadTable[id];
        }
        return null;
    },
    
    

    GetTalbeByName : function (tablename) {
        if (this.m_table[tablename] == null) {
            cc.log("table is not load: " + tablename + ".json");
            return null;
        }
        return this.m_table[tablename];
    },
    
    GetInfoByTalbeNameAndId : function (tablename , id) {
        if (this.m_table[tablename] == null) {
            cc.log("table is not load: " + tablename + ".json");
            return null;
        }
        if (this.m_table[tablename][id.toString()] == null) {
            cc.log("table have no id: " + tablename + ".json" + "id" + id);
            return null;
        }
        return this.m_table[tablename][id.toString()];
    },
    
        // use this for initialization
    onLoad: function () {
        DataMgr.instance = this;
        this.m_table = {};
        this.m_preLoadTable = {};
        var resArray = [];
        this.loadNum = 0;
        this.preLoadNum = 0;
        this.preLoadLength = 0;
        for (var i = 0;i < this.jsonConfig.length;i ++) {
            resArray[i] = this.jsonPath + this.jsonConfig[i] + this.jsonHz;
            cc.loader.loadRes(resArray[i],function (err,res) {
                if (err) {
                        cc.log("json load error : " + err);
                        DataMgr.instance.loadNum++
                }
                else{
                    DataMgr.instance.loadNum++;   
                }
                if (DataMgr.instance.loadNum >= DataMgr.instance.jsonConfig.length) {
                    for (var index = 0; index < DataMgr.instance.jsonConfig.length; index++) {
                        var element = DataMgr.instance.jsonConfig[index];
                        var url = DataMgr.instance.jsonPath + DataMgr.instance.jsonConfig[index] + DataMgr.instance.jsonHz;
                        var tbcontent = cc.loader.getRes(url);
                        DataMgr.instance.m_table[DataMgr.instance.jsonConfig[index]] = tbcontent;
                    }
                }
            },);
        }
        
        cc.loader.loadRes(this.jsonPath + "preload" + this.jsonHz,function (err,res) {
                if (err) {
                        cc.log("json load error : " + err);
                }
                else{
                    var m_table = DataMgr.instance.m_table;
                    m_table["preload"] = res;
                    for (var key in res) {
                        if (res.hasOwnProperty(key)) {
                            var element = res[key];
                            DataMgr.instance.preLoadLength ++;
                            cc.loader.loadRes(element.prefabpath,function (err,prefab) {
                                if (err) {
                                    cc.log("prefab load error: " + err);
                                    DataMgr.instance.preLoadNum ++;
                                }
                                else {
                                    DataMgr.instance.preLoadNum ++;
                                }
                                if (DataMgr.instance.preLoadNum >= DataMgr.instance.preLoadLength) {
                                    var object = DataMgr.instance.m_table["preload"];
                                    for (var key in object) {
                                        if (object.hasOwnProperty(key)) {
                                            var element = object[key];
                                            DataMgr.instance.m_preLoadTable[Number(element.id)] = cc.loader.getRes(element.prefabpath);
                                        }
                                    }
                                }
                            })
                        }
                    } 
                }
            });
    },
    
    
});