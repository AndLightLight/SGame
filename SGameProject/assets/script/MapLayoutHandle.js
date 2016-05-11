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
    
    setRoleInIdx: function (role,idx) {
        if (role instanceof require("RoleNode") || role == null) {
            idx = Number(idx);
            this._map[idx] = role;
            if (role) {
                role.idx = idx;
            }
        }else{
            cc.log("not rolenode type");
        }
    },
    
    checkBom: function (idx,type,callback) {
        var rolenode = this._map[idx];
        var linerole = [];
        var result = false;
        if (rolenode) {
            linerole[0] = rolenode;
        }
        //return true;
        if (rolenode || type) {
            var ctnode = rolenode;
            if (ctnode|| type) {
                var ctype = ctnode?ctnode.type:type;
                var backtype = [this.samenum - 1];
                var bBom = true;
                var leftnum = 0;
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx - index - 1]?
                    (this._map[idx - index - 1].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                    leftnum ++;
                    linerole[linerole.length] = this._map[idx - index - 1];
                }
                // if (bBom) {
                //     return true;
                // }
                // bBom = true
                var rightnum = 0
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx + index + 1]?
                    (this._map[idx + index + 1].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                    rightnum ++;
                    linerole[linerole.length] = this._map[idx + index + 1];
                }
                // if (bBom) {
                //     return true;
                // }
                // bBom = true
                var upnum = 0;
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx - this.mapWidth *(index + 1)]?
                    (this._map[idx - this.mapWidth *(index + 1)].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                    upnum ++;
                    linerole[linerole.length] = this._map[idx - this.mapWidth *(index + 1)];
                }
                // if (bBom) {
                //     return true;
                // }
                // bBom = true
                var downnum = 0;
                for (var index = 0; index < this.samenum - 1; index++) {
                    backtype[index] = this._map[idx + this.mapWidth *(index + 1)]?
                    (this._map[idx + this.mapWidth *(index + 1)].type):0;
                    if (backtype[index] != ctype) {
                        bBom = false;
                        break;
                    }
                    downnum ++;
                    linerole[linerole.length] = this._map[idx + this.mapWidth *(index + 1)];
                }
                // if (bBom) {
                //     return true;
                // }
                
                if (leftnum + rightnum >= this.samenum-1) {
                    result = true;
                }
                if (upnum + downnum >= this.samenum-1) {
                    result = true;
                }
            }
        }
        cc.log("idx:"+idx+"leftnum:"+leftnum+"rightnum:"+rightnum+"upnum:"+upnum+"downnum:"+downnum)
        if (callback) {
            callback(result,linerole);
        }
        
        return result;
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
                this.setRoleInIdx(rolenode,i);
            }
        }   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
