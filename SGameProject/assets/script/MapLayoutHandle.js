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
    
    
    getPixelPosByPos:  function (pos) {
        var map = this.node.getComponent(cc.TiledLayer)
        var ppos = map.getPositionAt(pos);
        ppos.x = ppos.x + this.tileWidth/2;
        ppos.y = ppos.y + this.tileHeight/2;
        return ppos;
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
    
    GetOneLineRole: function (idx,type,linerole) {
        var rolenode = this._map[idx];
        if (rolenode || type) {
            var ctnode = rolenode;
            if (ctnode|| type) {
                var ctype = ctnode?ctnode.type:type;
                var lefttype = this._map[idx - 1]?this._map[idx - 1].type:0;
                var righttype = this._map[idx + 1]?this._map[idx + 1].type:0;
                var uptype = this._map[idx - this.mapWidth]?this._map[idx - this.mapWidth].type:0;
                var downtype = this._map[idx + this.mapWidth]?this._map[idx + this.mapWidth].type:0;
                if (lefttype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx-1)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx - 1];
                        this.GetOneLineRole(idx-1,type,linerole);
                    }
                }
                if (righttype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx+1)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx + 1];
                        this.GetOneLineRole(idx+1,type,linerole);
                    }
                }
                if (uptype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx - this.mapWidth)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx - this.mapWidth];
                        this.GetOneLineRole(idx - this.mapWidth,type,linerole);
                    }
                }
                if (downtype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx + this.mapWidth)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx + this.mapWidth];
                        this.GetOneLineRole(idx + this.mapWidth,type,linerole);
                    }
                }
            }
        }
    },
    
    checkBom: function (idx,type,callback) {
        var rolenode = this._map[idx];
        var linerole = [];
        var result = false;
        if (rolenode) {
            linerole[0] = rolenode;
        }
        
        var DirType = cc.Enum({
           N: 0,
           U: 1,
           D: 2,
           L: 3,
           R: 4,
        });
        

        this.GetOneLineRole(idx,type,linerole);
        
        var log = "idx:"+idx+"linerole:";
        for (var index = 0; index < linerole.length; index++) {
            var element = linerole[index];
            log = log + "  " + element.idx;
        }
        
        //cc.log(log);
        
        var offset = 1;
        if (rolenode) {
            offset = 0;
        }
        
        if (linerole.length + offset >= this.samenum) {
            result = true;
        }
        
        if (callback) {
            callback(result,linerole);
        }
        
        return result;
        
        // if (rolenode || type) {
        //     var ctnode = rolenode;
        //     if (ctnode|| type) {
        //         var ctype = ctnode?ctnode.type:type;
        //         var backtype = [this.samenum - 1];
        //         var leftnum = 0;
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx - index - 1]?
        //             (this._map[idx - index - 1].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             leftnum ++;
        //         }
        //         var rightnum = 0
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx + index + 1]?
        //             (this._map[idx + index + 1].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             rightnum ++;
        //         }
        //         var upnum = 0;
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx - this.mapWidth *(index + 1)]?
        //             (this._map[idx - this.mapWidth *(index + 1)].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             upnum ++;
        //         }
        //         var downnum = 0;
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx + this.mapWidth *(index + 1)]?
        //             (this._map[idx + this.mapWidth *(index + 1)].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             downnum ++;
        //         }
        //         if (leftnum + rightnum >= this.samenum-1) {
        //             result = true;
        //         }
        //         if (upnum + downnum >= this.samenum-1) {
        //             result = true;
        //         }
        //     }
        // }
        //cc.log("idx:"+idx+"leftnum:"+leftnum+"rightnum:"+rightnum+"upnum:"+upnum+"downnum:"+downnum)
        // if (callback) {
        //     callback(result,linerole);
        // }
        
        // return result;
    },
    
    
    loadMap: function () {
        var map = this.node.getComponent(cc.TiledLayer);
        this.mapWidth = this.node.parent.getComponent(cc.TiledMap).getMapSize().width;
        this.mapHeight = this.node.parent.getComponent(cc.TiledMap).getMapSize().height;
        this.tileWidth = this.node.parent.getComponent(cc.TiledMap).getTileSize().width;
        this.tileHeight = this.node.parent.getComponent(cc.TiledMap).getTileSize().height;
        var tiles = map.getTiles();
        var test = 10;
        for (var i in tiles) {
            var bnot = tiles[i];
            if (bnot == 0) {
                if (test <= 0) {
                    break;
                }
                test --;
                cc.director.getScheduler().schedule(function () {
                                    var ppos = this.getPixelPosByPos(this.getPosByIndex(i))
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
                    cc.log("canRTimes:"+canRTimes+"r:"+r+"idx:"+i);
                }while(this.checkBom(i,r));
                var nd = cc.instantiate(pre);
                nd.parent = this.node;
                nd.x = ppos.x;
                nd.y = ppos.y;
                var rolenode = nd.getComponent(require("RoleNode"));
                rolenode.type = type;
                this.setRoleInIdx(rolenode,i);
                }, this, 3*(i-15));

            }
        }   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
