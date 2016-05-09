
var MapLayoutHandle = require("MapLayoutHandle");

var RoleNode = cc.Class({
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
        type: 0,
        
        pos:{
            default: -1,
            visible: false,
        },
        
        
        bdown: {
            default: false,
            visible: false,
        },
        
        
        _layer: null,
        _maphandle: null,
    },
    
    _touchCallBack: function (event) {
        if (event.type == cc.Node.EventType.TOUCH_END) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            rolenode.bdown = false;
            if (rolenode._maphandle) {
                if (rolenode._maphandle.selectRole) {
                    rolenode._maphandle.selectRole.bdown = false;
                }
            }
        }
        else if (event.type == cc.Node.EventType.TOUCH_START) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            if (rolenode._maphandle) {
                if (rolenode._maphandle.selectRole) {
                    rolenode._maphandle.selectRole.bdown = false;
                }
                rolenode._maphandle.selectRole = rolenode;
                rolenode._maphandle.selectRole.bdown = true;
            }
        }
        else if (event.type == cc.Node.EventType.TOUCH_MOVE) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            if (rolenode.bdown) {
                var mx = event.getLocation().x;
                var my = event.getLocation().y;
                var width = node.width;
                var height = node.height;
                var newpos = node.parent.convertToNodeSpace(cc.v2(mx + width/2,my + height/2)); 
                // node.x = newpos.x;
                // node.y = newpos.y;
                if (rolenode._maphandle) {
                    if (rolenode._maphandle.selectRole) {
                        var topos = rolenode._maphandle.getPosByPixelPos(newpos);
                        var torole = rolenode._maphandle.getRoleByPos(topos);
                        if (torole) {
                            var can = rolenode._maphandle.selectRole.checkCanChangePos(torole);
                            if (can) {
                                rolenode.startChange(rolenode._maphandle.selectRole.pos);
                                rolenode._maphandle.selectRole.startChange(rolenode.pos);
                                rolenode._maphandle.selectRole.bdown = false;
                                rolenode._maphandle.selectRole = null;
                            }
                        }
                    }
                }
            }
        }
    },
    
    startChange: function (topos) {
        var pos = this._layer.getPositionAt(topos);
        var action = cc.moveTo(2, pos);
        this.node.runAction(action);
    },
    
    checkCanChangePos: function (role) {
        if (role instanceof RoleNode && this._maphandle && role != this) {
            var rpos = this._maphandle.getPosByIndex(role.pos);
            var cpos = this._maphandle.getPosByIndex(this.pos);
            
            if (rpos.x == cpos.x) {
                if (Math.abs(rpos.y - cpos.y) == 1) {
                    return true;
                }
            }
            if (rpos.y == cpos.y) {
                if (Math.abs(rpos.x - cpos.x) == 1) {
                    return true;
                }
            }
        }
        
        return false;
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_END,this._touchCallBack);
        this.node.on(cc.Node.EventType.TOUCH_START,this._touchCallBack);
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this._touchCallBack);
        this._layer = this.node.parent.getComponent(cc.TiledLayer);
        this._maphandle = this.node.parent.getComponent(MapLayoutHandle);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
