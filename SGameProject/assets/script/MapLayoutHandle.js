var MapLayoutHandle = cc.Class({
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
        samenum: 3,
        
        selectRole: {
            default: null,
            visible: false,
        },
        
        
        _map: [],
        mapWidth: {
            default: 0,
            visible: false,
        },
        mapHeight: {
            default: 0,
            visible: false,
        },
        tileWidth: {
            default: 0,
            visible: false,  
        },
        tileHeight: {
            default: 0,
            visible: false,  
        },
        
    },

    // use this for initialization
    onLoad: function () {

    },
    
    getPosByIndex:  function (idx) {
        idx ++;
        var pos = cc.v2(idx%this.mapWidth-1,Math.floor(idx/this.mapWidth));
        return pos;
    },
    
    getIndexByPos:  function (pos) {
        return pos.x + pos.y * this.mapWidth;
    },
    
    getPosByPixelPos:  function (ppos) {
        var widx = Math.floor(ppos.x/this.tileWidth);
        var hidx = this.mapHeight - 1 - Math.floor(ppos.y/this.tileHeight);
        
        return cc.v2(widx,hidx);
    },
    
    getRoleByPos:  function (pos) {
        return this._map[this.getIndexByPos(pos)];
    },
    
    checkBom: function (idx,type) {
        var rolenode = this._map[idx];
        //return true;
        if (rolenode || type) {
            var ctnode = rolenode;
            if (ctnode|| type) {
                var ctype = ctnode?ctnode.type:type;
                var backtype = [this.samenum - 1];
                var bBom = true;
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx - index - 1]?
                    (this._map[idx - index - 1].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                }
                if (bBom) {
                    return true;
                }
                bBom = true
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx + index + 1]?
                    (this._map[idx + index + 1].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                }
                if (bBom) {
                    return true;
                }
                bBom = true
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx - this.mapWidth *(index + 1)]?
                    (this._map[idx - this.mapWidth *(index + 1)].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                }
                if (bBom) {
                    return true;
                }
                bBom = true
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx + this.mapWidth *(index + 1)]?
                    (this._map[idx + this.mapWidth *(index + 1)].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                }
                if (bBom) {
                    return true;
                }
            }
        }
        
        return false;
    },
    
    
    loadMap: function () {
        var map = this.node.getComponent(cc.TiledLayer);
        this.mapWidth = this.node.parent.getComponent(cc.TiledMap).getMapSize().width;
        this.mapHeight = this.node.parent.getComponent(cc.TiledMap).getMapSize().height;
        this.tileWidth = this.node.parent.getComponent(cc.TiledMap).getTileSize().width;
        this.tileHeight = this.node.parent.getComponent(cc.TiledMap).getTileSize().height;
        var tiles = map.getTiles();
        for (var i in tiles) {
            var bnot = tiles[i];
            if (bnot == 0) {
                var pos = map.getPositionAt(this.getPosByIndex(i))
                var num = this.pre.length;
                var type = 0;
                var canRTimes = 10000;
                do{
                    canRTimes --;
                    if (canRTimes <= 0) {
                        break;
                    }
                    var r = Math.ceil(Math.random()*(num-1)+1);
                    var pre = this.pre[r-1];
                    type = r;
                }while(this.checkBom(i,r));
                var nd = cc.instantiate(pre);
                nd.parent = this.node;
                nd.x = pos.x;
                nd.y = pos.y;
                var rolenode = nd.getComponent(require("RoleNode"));
                rolenode.type = type;
                rolenode.pos = i;
                this._map[rolenode.pos] = rolenode;
            }
        }   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
