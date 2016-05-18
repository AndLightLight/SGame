
var MapLayoutHandle = require("MapLayoutHandle");
var Box2d = require("box2dweb-commonjs");
var Game = require("Game");

var StateType = cc.Enum({
    IDLE: 0,
    CHANGE: 1,
    SHAKE: 2,
    BOOM: 3,
    DOWN: 4,
});

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
        boomEffect: {
          default: null,
          type: cc.Prefab,  
        },
        
        idx:{
            default: -1,
            visible: false,
        },
        
        
        bPress: {
            default: false,
            visible: false,
        },
        
        stateType: {
            default: StateType.IDLE,
            visible: false,
        },
        
        
        _layer: null,
        _maphandle: null,
    },
    
    _touchCallBack: function (event) {
        if (event.type == cc.Node.EventType.TOUCH_END) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            rolenode.bPress = false;
            rolenode.buildBox2d();
            if (rolenode._maphandle) {
                if (rolenode._maphandle.selectRole) {
                    rolenode._maphandle.selectRole.bPress = false;
                }
            }
        }
        else if (event.type == cc.Node.EventType.TOUCH_START) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            if (rolenode._maphandle) {
                if (rolenode._maphandle.selectRole) {
                    rolenode._maphandle.selectRole.bPress = false;
                }
                rolenode._maphandle.selectRole = rolenode;
                rolenode._maphandle.selectRole.bPress = true;
            }
        }
        else if (event.type == cc.Node.EventType.TOUCH_MOVE) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            if (rolenode.bPress) {
                var mx = event.getLocation().x;
                var my = event.getLocation().y;
                var width = node.width;
                var height = node.height;
                var newppos = node.parent.convertToNodeSpace(cc.v2(mx,my)); 
                if (rolenode._maphandle) {
                    if (rolenode._maphandle.selectRole) {
                        var topos = rolenode._maphandle.getPosByPixelPos(newppos);
                        var torole = rolenode._maphandle.getRoleByPos(topos);
                        if (torole) {
                            var can = rolenode._maphandle.selectRole.checkCanChangePos(torole);
                            if (can) {
                                var can2 = rolenode._maphandle.selectRole.checkCanChangePos(torole);
                                var toidx1= torole.idx;
                                var toidx2 = rolenode.idx;
                                rolenode._maphandle.setRoleInIdx(rolenode,toidx1);
                                rolenode._maphandle.setRoleInIdx(torole,toidx2);
                                rolenode.startChange(toidx1);
                                torole.startChange(toidx2);
                                rolenode.node.zIndex = 1;
                                rolenode._maphandle.selectRole.bPress = false;
                                rolenode._maphandle.selectRole = null;
                            }
                        }
                    }
                }
            }
        }
    },
    
    refreshState: function () {
        if (this.stateType == StateType.IDLE || this.stateType == StateType.SHAKE) {
            var beforestate = this.stateType;
            var node = this;
            do {
                var toidx = this.checkCanDown();
                if (toidx) {
                    var cpos = this._maphandle.getPosByIndex(this.idx);
                    var urole = this._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
                    var lurole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
                    var rurole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
                    this._maphandle.pushRefreshMap(urole);
                    this._maphandle.pushRefreshMap(lurole);
                    this._maphandle.pushRefreshMap(rurole);
                    this.startDown(toidx);
                    break;
                }
                var re = this.checkCanShake(function (re,linerole) {
                    for (var key in linerole) {
                        if (linerole.hasOwnProperty(key)) {
                            var element = linerole[key];
                            node._maphandle.pushRefreshMap(element);
                        }
                    }
                });
                if (re) {
                    this.startShake();
                    break;
                }
                this.startIdle();
                break;
            }while (true)
            var afterstate = this.stateType;
            if (beforestate == StateType.IDLE && StateType.IDLE == afterstate) {
                this._maphandle.removeRefreshMap(this);
            }
        }
        else if (this.stateType == StateType.CHANGE) {
            
        }
        else if (this.stateType == StateType.SHAKE) {
            
        }
        else if (this.stateType == StateType.BOOM) {
            
        }
        else if (this.stateType == StateType.DOWN) {
            
        }
        
    },
    startIdle: function () {
        this.stateType = StateType.IDLE;
        this.node.stopAllActions();
    },
    
    startChange: function (toidx) {
        if (this.stateType == StateType.CHANGE) {
            return ;
        }
        this.stateType = StateType.CHANGE;
        this.node.stopAllActions();
        if (this.bodyA) {
             this.bodyA.SetActive(false);
            var wppos = this.convertToWorld();
            this.bodyA.SetPosition(wppos);
        }
        var ppos = this._maphandle.getPixelPosByPos(this._maphandle.getPosByIndex(toidx));
        var action = cc.moveTo(0.5, ppos);
        var callfun = cc.callFunc(function (params) {
            this.stateType = StateType.IDLE;
            if (this.bodyA) {
                this.bodyA.SetActive(true);
                var wppos = this.convertToWorld();
                this.bodyA.SetPosition(wppos);
            }
            
            this.node.zIndex = 0;
            this.refreshState();
        },this);
        var sqe = cc.sequence(action,callfun);
        this.node.runAction(sqe);
    },
    
    startShake: function () {
        if (this.stateType == StateType.SHAKE) {
            return ;
        }
        this.stateType = StateType.SHAKE;
        this.node.stopAllActions();
        var right = cc.moveBy(0.1, 2, 0);
        var left = cc.moveBy(0.1, -2, 0);
        var sqerl = cc.sequence(right,left);
        var rep = cc.repeat(sqerl,10);
        
        var callfun = cc.callFunc(function (params) {
            this.startBoom();
        },this);
        var sqe = cc.sequence(rep,callfun);
        this.node.runAction(sqe);
    },
    
    startBoom: function () {
        if (this.stateType == StateType.BOOM) {
            return ;
        }
        this.stateType = StateType.BOOM;
        this.node.stopAllActions();
        var be = cc.instantiate(this.boomEffect);
        var bea = be.getComponent(require("AnimationCallBack"));
        bea.callBack = function () {
            var node = this.node.parent;
            node.destroy();
            var rolenode = node.getComponent(RoleNode);
            rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
            var cpos = rolenode._maphandle.getPosByIndex(rolenode.idx);
            var urole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
            var lurole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
            var rurole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
            rolenode._maphandle.pushRefreshMap(urole);
            rolenode._maphandle.pushRefreshMap(lurole);
            rolenode._maphandle.pushRefreshMap(rurole);
            rolenode._maphandle.removeRefreshMap(this);
        };
        be.parent = this.node;
        be.x = 0;
        be.y = 0;
    },
    
    startDown: function (toidx) {
        if (this.stateType == StateType.DOWN) {
            return ;
        }
        this.stateType = StateType.DOWN;
        this.node.stopAllActions();
        this._maphandle.setRoleInIdx(null,this.idx);
        this._maphandle.setRoleInIdx(this,toidx);
        var ppos = this._maphandle.getPixelPosByPos(this._maphandle.getPosByIndex(toidx));
        var action = cc.moveTo(0.2, ppos);
        //action.easing(cc.easeIn(3.0));
        var callfun = cc.callFunc(function (params) {
            this.stateType = StateType.IDLE;
            if (this.bodyA) {
                this.bodyA.SetActive(true);
                var wppos = this.convertToWorld();
                this.bodyA.SetPosition(wppos);
            }
            this._maphandle.checkCanShake(this.idx,null,function (re,linerole) {
                if (re) {
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        element.startShake();
                    }
                }
            });
        },this);
        var sqe = cc.sequence(action,callfun);
        this.node.runAction(sqe);
    },
    
    
    checkCanChangePos: function (role) {
        if (role instanceof RoleNode && this._maphandle && role != this && role.stateType == StateType.IDLE && this.stateType == StateType.IDLE) {
            var rpos = this._maphandle.getPosByIndex(role.idx);
            var cpos = this._maphandle.getPosByIndex(this.idx);
            
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
    
    
    checkCanShake: function (callback) {
        if (this.isShakeStateRequire()) {
            return this._maphandle.checkCanShake(this.idx,this.type,function (re,linerole) {
                callback(re,linerole);
            });
        }
        
        return false;
    },
    
    checkCanDown: function (callback) {
        if (this.isDownStateRequire()) {
            var toidx = this._maphandle.checkCanDown(this);
            if (toidx) {
                return toidx;
            }
        }
        
        return null;
    },
    
    isShakeStateRequire: function () {
        if (this.stateType != StateType.DOWN && this.stateType != StateType.CHANGE && this.stateType != StateType.BOOM) {
            return true;
        }
        return false;
    },
    
    isDownStateRequire: function () {
        if (this.stateType != StateType.BOOM && this.stateType != StateType.CHANGE) {
            return true;
        }
        return false;
    },
    
    convertToWorld:function(){
        var leftDownPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        return cc.v2(leftDownPos.x/this.SCALE,(this.visibleSize.height-leftDownPos.y)/this.SCALE);
    },
    
    convertToNode:function(worldPoint){
        var leftUpPos = cc.pMult(worldPoint,this.SCALE);
        var leftDownPosInWorldPixel = cc.v2(leftUpPos.x,(this.visibleSize.height-leftUpPos.y));
        var leftDownPos =  this.node.parent.convertToNodeSpaceAR(leftDownPosInWorldPixel);
        return leftDownPos;
    },
    
    buildBox2d: function () {
        if (!this.bodyA) {
            var visibleSize = cc.director.getVisibleSize();
            this.visibleSize = visibleSize;
            
            var SCALE = 30;
            this.SCALE = SCALE;
            
            var DEGTORAD = Math.PI/180;
            
            var RADTODEG = 180/Math.PI;
            this.RADTODEG = RADTODEG;
            
            var worldPoint = this.convertToWorld();
            
            var bodyDef = new Box2d.b2BodyDef();
                bodyDef.type = Box2d.b2Body.b2_dynamicBody;
                if (this.type == 0) {
                    bodyDef.type = Box2d.b2Body.b2_staticBody;
                }
                bodyDef.position.Set(worldPoint.x,worldPoint.y);
                bodyDef.angle = 0*DEGTORAD;
                // bodyDef.linearVelocity = new Box2d.b2Vec2(1,0);
                // bodyDef.angularVelocity = -10;
                
                var bodyA = Game.instance.world.CreateBody(bodyDef);
                this.bodyA = bodyA;
                
            var fixDef = new Box2d.b2FixtureDef();
                fixDef.shape = new Box2d.b2PolygonShape();
                fixDef.shape.SetAsBox(this.node.width/2/SCALE,this.node.height/2/SCALE);
                fixDef.density = 1.0;
                fixDef.friction = 0.0;
                fixDef.restitution = 0.0;
                
                bodyA.CreateFixture(fixDef);    
        }    
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_END,this._touchCallBack);
        this.node.on(cc.Node.EventType.TOUCH_START,this._touchCallBack);
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this._touchCallBack);
        this._layer = this.node.parent.getComponent(cc.TiledLayer);
        this._maphandle = this.node.parent.getComponent(MapLayoutHandle);
        
        //this.buildBox2d();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.bodyA && this.bodyA.IsActive()) {
            this.node.position = this.convertToNode(this.bodyA.GetPosition());
            this.node.rotation = this.bodyA.GetAngle()*this.RADTODEG%360;
        }
    },
    
    onDestroy: function () {
        if (this.bodyA) {
            Game.instance.world.DestroyBody(this.bodyA);
        }
    },
});


RoleNode.StateType = StateType;
