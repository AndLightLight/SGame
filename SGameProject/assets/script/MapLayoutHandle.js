cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        pre: [cc.Prefab],
        map: [],
        samenum: 3,
        width: 15,
        height: 15,
        bload: false,
    },

    // use this for initialization
    onLoad: function () {

    },
    
    checkBom: function (idx) {
        var box = this.map[idx];
        if (box) {
            var ctnode = box.getComponent(require("boxnode"));
            if (ctnode) {
                var ctype = ctnode.type;
                var backtype = [samenum - 1];
                for (var index = 0; index < samenum - 1; index++) {
                    backtype[index] = this.map[idx - index - 1]?
                    (this.map[idx - index - 1].getComponent(require("boxnode"))?
                    (this.map[idx - index - 1].getComponent(require("boxnode")).type):0):0;
                    if (backtype[index] != ctype) {
                        return false;
                    }
                }
                for (var index = 0; index < samenum - 1; index++) {
                    backtype[index] = this.map[idx + index + 1]?
                    (this.map[idx + index + 1].getComponent(require("boxnode"))?
                    (this.map[idx + index + 1].getComponent(require("boxnode")).type):0):0;
                    if (backtype[index] != ctype) {
                        return false;
                    }
                }
                for (var index = 0; index < samenum - 1; index++) {
                    backtype[index] = this.map[idx - this.width *(index + 1)]?
                    (this.map[idx - this.width *(index + 1)].getComponent(require("boxnode"))?
                    (this.map[idx - this.width *(index + 1)].getComponent(require("boxnode")).type):0):0;
                    if (backtype[index] != ctype) {
                        return false;
                    }
                }
                for (var index = 0; index < samenum - 1; index++) {
                    backtype[index] = this.map[idx + this.width *(index + 1)]?
                    (this.map[idx + this.width *(index + 1)].getComponent(require("boxnode"))?
                    (this.map[idx + this.width *(index + 1)].getComponent(require("boxnode")).type):0):0;
                    if (backtype[index] != ctype) {
                        return false;
                    }
                }
                
                return true;
            }
        }
        
        return false;
    },
    
    getPosByIndex: function (idx) {
        idx ++;
        var pos = new cc.v2(idx%this.width-1,idx/this.width);
        return pos;
    },
    
    start: function () {
        //var layout = this.node.getChildByName("havetile");
        var map = this.node.getComponent(cc.TiledLayer);
        var tiles = map.getTiles();
        for (var i in tiles) {
            var bnot = tiles[i];
            if (bnot == 0) {
                var pos = map.getPositionAt(this.getPosByIndex(i))
                var num = this.pre.length;
                var r = Math.ceil(Math.random()*(num-1)*num);
                var pre = this.pre[r-1];
                var nd = cc.instantiate(pre);
                nd.parent = this.node;
                nd.x = pos.x;
                nd.y = pos.y;
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.bload == false) {
            var map = this.node.getComponent(cc.TiledLayer);
            var tiles = map.getTiles();
            for (var i in tiles) {
                this.bload = true;
                var bnot = tiles[i];
                if (bnot == 0) {
                    var pos = map.getPositionAt(this.getPosByIndex(i))
                    var num = this.pre.length;
                    var r = Math.ceil(Math.random()*(num-1)*num);
                    var pre = this.pre[r-1];
                    var nd = cc.instantiate(pre);
                    nd.parent = this.node;
                    nd.x = pos.x;
                    nd.y = pos.y;
                }
            }         
        }
        else{
            var map = this.node.getComponent(cc.TiledLayer);
            var tiles = map.getTiles();
        }

    },
});
