var DataMgr = require("DataMgr");
var MapLayoutHandle = cc.Class({
    extends: cc.Component,

    properties: {
        
        selectRole: {
            default: null,
            visible: false,
        },
        
        guid: {
            default: 0,
            visible: false,
        },
        
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

        score: {
            default: 0,
            visible: false,
        },

        pause: {
            default: false,
            visible: false,
        },

        stage: {
            default: null,
            visible: false,
        },
        
        info: null,

        _map: [],
        
    },
   

    // use this for initialization
    onLoad: function () {
        this.guid = 0;
        this.loadMap();
    },
    
    getPosByIndex:  function (idx) {
        var pos = cc.v2(idx%this.mapWidth,Math.floor(idx/this.mapWidth));
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
                var ctype = ctnode?ctnode.info.type:type;
                var lefttype = this._map[idx - 1]?this._map[idx - 1].info.type:0;
                var righttype = this._map[idx + 1]?this._map[idx + 1].info.type:0;
                var uptype = this._map[idx - this.mapWidth]?this._map[idx - this.mapWidth].info.type:0;
                var downtype = this._map[idx + this.mapWidth]?this._map[idx + this.mapWidth].info.type:0;
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

    out: function () {
        this.stage.destroy();
    },

    addScore: function (score) {
        this.score += score;
    },

    getMapCenterPPos: function () {
        return cc.v2(this.mapWidth*this.tileWidth/2,this.mapHeight*this.tileHeight/2);
    },

    findTenWordRole: function (idx) {
        var rolelist = [];
        var pos = this.getPosByIndex(idx);
        for (var i = 0;i < this.mapWidth;i ++) {
            var role = this.getRoleByPos(cc.v2(i,pos.y));
            if (role) {
                rolelist[rolelist.length] = role;
            }
        }
        for (var i = 0;i < this.mapHeight;i ++) {
            var role = this.getRoleByPos(cc.v2(pos.x,i));
            if (role) {
                rolelist[rolelist.length] = role;                
            }
        }

        return rolelist;
    },

    checkInBorder: function (ppos) {
        var cpos = this.getPosByPixelPos(ppos);
        var borderRect = new cc.rect(this.info.borderX == -1?0:this.info.borderX, 
        this.info.borderY == -1?0:this.info.borderY, 
        this.info.borderWidth == -1?this.mapWidth:this.info.borderWidth-1, 
        this.info.borderHeight == -1?this.mapHeight:this.info.borderHeight-1);
        return cc.rectContainsPoint(borderRect, cpos);
    },
    
    findNearestNull: function (ppos,role) {
        var cpos = this.getPosByPixelPos(ppos);
        var urole = this.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
        var drole = this.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
        var ulen,dlen,llen,rlen,lulen,rulen,ldlen,rdlen,lest,reppos;
        if (!urole || urole == role) {
            var uppos = this.getPixelPosByPos(cc.v2(cpos.x,cpos.y-1));
            if (this.checkInBorder(uppos)) {
                ulen = uppos.sub(ppos).mag();
            }
            
        }
        if (!drole || drole == role) {
            var dppos = this.getPixelPosByPos(cc.v2(cpos.x,cpos.y+1));
                        if (this.checkInBorder(dppos)) {                 dlen = dppos.sub(ppos).mag();             }
        }
        if (!lrole || lrole == role) {
            var lppos = this.getPixelPosByPos(cc.v2(cpos.x-1,cpos.y));
                        if (this.checkInBorder(lppos)) {                 llen = lppos.sub(ppos).mag();             }
        }
        if (!rrole || rrole == role) {
            var rppos = this.getPixelPosByPos(cc.v2(cpos.x+1,cpos.y));
                        if (this.checkInBorder(rppos)) {                 rlen = rppos.sub(ppos).mag();             }
        }
        if (!lurole || lurole == role) {
            var luppos = this.getPixelPosByPos(cc.v2(cpos.x-1,cpos.y-1));
                        if (this.checkInBorder(luppos)) {                 lulen = luppos.sub(ppos).mag();             }
        }
        if (!rurole || rurole == role) {
            var ruppos = this.getPixelPosByPos(cc.v2(cpos.x+1,cpos.y-1));
                        if (this.checkInBorder(ruppos)) {                 rulen = ruppos.sub(ppos).mag();             }
        }
        if (!ldrole || ldrole == role) {
            var ldppos = this.getPixelPosByPos(cc.v2(cpos.x-1,cpos.y+1));
                        if (this.checkInBorder(ldppos)) {                 ldlen = ldppos.sub(ppos).mag();             }
        }
        if (!rdrole || rdrole == role) {
            var rdppos = this.getPixelPosByPos(cc.v2(cpos.x+1,cpos.y+1));
                        if (this.checkInBorder(rdppos)) {                 rdlen = rdppos.sub(ppos).mag();             }
        }
        ulen?(lest = ulen,reppos = uppos):null;
        dlen?(lest?(dlen < lest?(lest = dlen,reppos = dppos):null):(lest = dlen,reppos = dppos)):null;
        llen?(lest?(llen < lest?(lest = llen,reppos = lppos):null):(lest = llen,reppos = lppos)):null;
        rlen?(lest?(rlen < lest?(lest = rlen,reppos = rppos):null):(lest = rlen,reppos = rppos)):null;
        lulen?(lest?(lulen < lest?(lest = lulen,reppos = luppos):null):(lest = lulen,reppos = luppos)):null;
        rulen?(lest?(rulen < lest?(lest = rulen,reppos = ruppos):null):(lest = rulen,reppos = ruppos)):null;
        ldlen?(lest?(ldlen < lest?(lest = ldlen,reppos = ldppos):null):(lest = ldlen,reppos = ldppos)):null;
        rdlen?(lest?(rdlen < lest?(lest = rdlen,reppos = ruppos):null):(lest = rdlen,reppos = ruppos)):null;
        
        return reppos;
    },
    
    checkCanShake: function (idx,type,callback) {
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
        
        var retype = rolenode?rolenode.info.type:type;

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
        
        var relinerole = [];
        for (var index = 0; index < linerole.length; index++) {
            var element = linerole[index];
            if (element.isShakeStateRequire()) {
                relinerole.push(element);
            }
        }
        
        var typeinfo = DataMgr.instance.GetInfoByTalbeNameAndId("roletype",retype);
        var bneednum = false
        var mergeroleid = 0;
        for (var i = 0;i < typeinfo.mergeNeedNum.length;i ++) {
            if (typeinfo.mergeNeedNum[i]) {
                if (linerole.length + offset >= typeinfo.mergeNeedNum[i]) {
                    bneednum = true;
                    mergeroleid = typeinfo.mergeToRole[i];
                }
            }
        }
        
        if (bneednum && retype != 0) {
            result = true;
        }
        
        if (callback) {
            callback(result,relinerole);
        }
        
        return {"result":result,"linerole":relinerole,"mergeroleid":mergeroleid};
    },
    
    
    checkCanDown: function (role) {
        if (!role) {
            return null;
        }
        var cpos = this.getPosByIndex(role.idx);
        var drole = this.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
        if (drole) {
            var ldidx = this.getIndexByPos(cc.v2(cpos.x-1,cpos.y+1));
            var rdidx = this.getIndexByPos(cc.v2(cpos.x+1,cpos.y+1));
            var rrole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
            var lrole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
            if (!this._map[ldidx] && !lrole) {
                var r = Math.ceil(Math.random()*1+0);
                if (r) {
                    //return ldidx;
                }
            }
            if (!this._map[rdidx] && !rrole) {
                var r = Math.ceil(Math.random()*1+0);
                if (!r) {
                   //return rdidx;
                }
            }
        }
        else {
            return this.getIndexByPos(cc.v2(cpos.x,cpos.y+1));
        }

        return null;
    },


    createRole: function (roleid,idx,state) {
        var roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
        if (roleinfo) {
            this.guid ++;
            var ppos = this.getPixelPosByPos(this.getPosByIndex(idx));
            var pre = DataMgr.instance.GetPrefabById(roleinfo.prefabid);
            if (!pre) {
                return;
            }
            var nd = cc.instantiate(pre);
            nd.x = ppos.x;
            nd.y = ppos.y;
            nd.parent = this.node;
            var rolenode = nd.getComponent(require("RoleNode"));
            rolenode.info = roleinfo;
            rolenode.guid = this.guid;
            this.setRoleInIdx(rolenode,idx);
            rolenode.changeState(state);
            if (roleinfo.bornBuff) {
                require("BuffMgr").instance.addBuff(rolenode,rolenode,roleinfo.bornBuff);
            }
        }
    },


    removeRole: function (role) {
        role.node.destroy();
        role._brefresh = false;
        var oldrole = this.getRoleByPos(this.getPosByIndex(role.idx));
        if (oldrole && oldrole.guid == role.guid) {
            this.setRoleInIdx(null,role.idx);
        }
    },
    
    
    loadMap: function () {
        var map = this.node.getComponent(cc.TiledLayer);
        map.enabled = false;
        var mapparent = this.node.parent.getComponent(cc.TiledMap);
        this.stage = mapparent.node.parent;
        this.mapWidth = this.node.parent.getComponent(cc.TiledMap).getMapSize().width;
        this.mapHeight = this.node.parent.getComponent(cc.TiledMap).getMapSize().height;
        this.tileWidth = this.node.parent.getComponent(cc.TiledMap).getTileSize().width;
        this.tileHeight = this.node.parent.getComponent(cc.TiledMap).getTileSize().height;
        var tiles = map.getTiles();
        // var tileset = map.getTileset();
        // var pro = map.getProperties();
        var test = 2;
        for (var i = 0;i < tiles.length;i ++) {
            i = Number(i);
            var bnot = tiles[i];
                // if (test <= 0) {
                //     break;
                // }
                // test --;
                
                var type = 0;
                var roleid = 1;
                var roleinfo = null;
                if (bnot == 0) {
                    var num = this.info.roleid.length;
                    var canRTimes = 10000;
                    do{
                        canRTimes --;
                        if (canRTimes <= 0) {
                            break;
                        }
                        var r = Math.ceil(Math.random()*(num-1)+1);
                        roleid = this.info.roleid[r-1];
                        roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
                        type = roleinfo.type;
                    }while(this.checkCanShake(i,type).result);
                    
                }else{
                    var tilepro = mapparent.getPropertiesForGID(bnot);
                    if (tilepro) {
                        roleid = Number(tilepro.id);
                        roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
                    }
                    
                }
                this.createRole(roleid,i,require("RoleNode").StateType.IDLE);
        }   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },

    onDestroy: function () {
        this.selectRole = null;
        
        this.guid = 0;
        
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.tileWidth = 0;
        this.tileHeight = 0;

        this.score = 0;
        
        this.info = null;

        this._map = null;

        require("BuffMgr").instance.clearBuff();
    }
});
