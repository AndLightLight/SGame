var DataMgr = require("DataMgr")


var NodeParam = cc.Class({
        name: "NodeParam",
        properties: {
            preid: 0,
            num: 0,
        },   
    }
);

var PoolMgr = cc.Class({
    extends: cc.Component,

    properties: {
        _nodeList:{
            default: {},
        },

        PreIdList: {
            default: [],
            type: NodeParam,
        }
    },

    InitPre: function () {
        for (var index = 0; index < this.PreIdList.length; index++) {
            var element = this.PreIdList[index];
            var preid = element.preid;
            var num = element.num;

            var haspre = DataMgr.instance.IsPrefabLoadById(preid);
            if (haspre) {
                var pre = DataMgr.instance.GetPrefabById(preid);
                for (var index = 0; index < num; index++) {
                    var newnode = cc.instantiate(pre);
                    this.RemoveNodeByPreId(preid,newnode);                        
                }
            }
        }
    },

    GetNodeByPreId: function (preid) {
        if (!this._nodeList[preid]) {
            this._nodeList[preid] = [];
        }
        var pre_nodeList = this._nodeList[preid];
        var newnode = pre_nodeList.pop();
        if (!newnode) {
            var pre = DataMgr.instance.GetPrefabById(preid);
            if (!pre) {
                return;
            }
            newnode = cc.instantiate(pre);
        }
        newnode.active = true;
        return newnode;
    },

    RemoveNodeByPreId: function (preid,node) {
        node.removeFromParent();
        node.active = false;
        if (!this._nodeList[preid]) {
            this._nodeList[preid] = [];
        }
        var pre_nodeList = this._nodeList[preid];
        pre_nodeList.push(node);      
    },

    ClearPool: function () {
        for (var key in this._nodeList) {
            if (this._nodeList.hasOwnProperty(key)) {
                var elementlist = this._nodeList[key];
                for (var index = 0; index < elementlist.length; index++) {
                    var element = elementlist[index];
                    element.destroy();
                }
            }
        }
        
        this._nodeList = {};
    },

    // use this for initialization
    onLoad: function () {
        if (!PoolMgr.instance) {
            PoolMgr.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
