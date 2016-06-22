var DataMgr = cc.Class({
    extends: cc.Component,
    properties: {
        jsonPath: "json/",
        jsonHz: "",
        jsonConfig: [cc.String],
        
        
        loadUI: {
            default: null,
            type: require("LoadUI"),  
        },

        m_table: {
            default: {},
            visible: false,
        },

        m_preLoadTable: {
            default: {},
            visible: false,
        },
    },

    IsPrefabLoadById: function (id,callback) {
        if (this.m_preLoadTable && this.m_preLoadTable[id]) {
            return this.m_preLoadTable[id]?true:false;
        }
        return false;
    },
    
    
    GetPrefabById: function (id,callback) {
        if (this.m_preLoadTable && this.m_preLoadTable[id]) {
            if (callback) {
                callback(this.m_preLoadTable[id])
            }
            return this.m_preLoadTable[id];
        }
        this.LoadPrefabById(id,callback);
        return null;
    },
    
    
    LoadPrefabById: function (id,callback) {
        var prepath = this.GetInfoByTalbeNameAndId("preload" , id);
        if (prepath) {
             cc.loader.loadRes(prepath.prefabpath,function (err,prefab) {
                if (err) {
                    cc.log("prefab load error: " + err);
                }
                else {
                    DataMgr.instance.m_preLoadTable[Number(id)] = cc.loader.getRes(prepath.prefabpath);
                    if (callback) {
                        callback(prefab);
                    }
                }
                
            })
        }
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
        if (this.m_table[tablename][id-1] == null) {
            cc.log("table have no id: " + tablename + ".json" + "id" + id);
            return null;
        }
        return this.m_table[tablename][id-1];
    },
    
        // use this for initialization
    onLoad: function () {
        if (!DataMgr.instance) {
            DataMgr.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }

        var resArray = [];
        this.loadNum = 0;
        this.preLoadNum = 0;
        this.preLoadLength = 0;
        for (var i = 0;i < this.jsonConfig.length;i ++) {
            resArray[i] = this.jsonPath + this.jsonConfig[i] + this.jsonHz;
            DataMgr.instance.loadUI.totalLoadNum ++;
            cc.loader.loadRes(resArray[i],function (err,res) {
                DataMgr.instance.loadUI.currentLoadNum ++;
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
        // this.loadUI.totalLoadNum ++;
        // cc.loader.loadRes(this.jsonPath + "preload" + this.jsonHz,function (err,res) {
        //     this.loadUI.currentLoadNum ++;
        //     if (err) {
        //             cc.log("json load error : " + err);
        //     }
        //     else{
        //         var m_table = DataMgr.instance.m_table;
        //         m_table["preload"] = res;
        //         for (var key in res) {
        //             if (res.hasOwnProperty(key)) {
        //                 var element = res[key];
        //                 DataMgr.instance.preLoadLength ++;
        //                 this.loadUI.totalLoadNum ++;
        //                 cc.loader.loadRes(element.prefabpath,function (err,prefab) {
        //                     this.loadUI.currentLoadNum ++;
        //                     if (err) {
        //                         cc.log("prefab load error: " + err);
        //                         DataMgr.instance.preLoadNum ++;
        //                     }
        //                     else {
        //                         DataMgr.instance.preLoadNum ++;
        //                     }
        //                     if (DataMgr.instance.preLoadNum >= DataMgr.instance.preLoadLength) {
        //                         var object = DataMgr.instance.m_table["preload"];
        //                         for (var key in object) {
        //                             if (object.hasOwnProperty(key)) {
        //                                 var element = object[key];
        //                                 DataMgr.instance.m_preLoadTable[Number(element.id)] = cc.loader.getRes(element.prefabpath);
        //                             }
        //                         }
        //                     }
        //                 })
        //             }
        //         } 
        //     }
        // });
        
        this.loadUI.StartLoading = true;
    },


    onDestroy: function () {
        this.m_preLoadTable = null;
        this.m_table = null;
    },
    
    
});