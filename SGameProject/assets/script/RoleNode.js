
var MapLayoutHandle = require("MapLayoutHandle");
var Box2d = require("box2dweb-commonjs");
var Game = require("Game");
var StateMgr = require("StateMgr");
var RoleNodeState = require("RoleNodeState");

var StateType = cc.Enum({
    IDLE: 0,
    CHANGE: 1,
    SHAKE: 2,
    BOOM: 3,
    DOWN: 4,
    FLOAT: 5,
});

var RoleNode = cc.Class({
    extends: cc.Component,

    properties: {
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
        
        stateMgr: {
            default: null,
            visible: false,  
        },
        
        _shakeLineRole: [],
        _downToIdx: null,
        
        
        _layer: null,
        _maphandle: null,
    },
    
    _touchCallBack: function (event) {
        if (event.type == cc.Node.EventType.TOUCH_END) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            rolenode.bPress = false;
            if (rolenode._maphandle) {
                if (rolenode._maphandle.selectRole) {
                    rolenode._maphandle.selectRole.bPress = false;
                    if (rolenode.stateType == StateType.FLOAT) {
                        rolenode.changeState(StateType.IDLE);
                        rolenode.refreshState();
                    }
                }
            }
        }
        else if (event.type == cc.Node.EventType.TOUCH_CANCEL) {
            var node = event.currentTarget;
            var rolenode = node.getComponent(RoleNode);
            rolenode.bPress = false;
            if (rolenode._maphandle) {
                if (rolenode._maphandle.selectRole) {
                    rolenode._maphandle.selectRole.bPress = false;
                    if (rolenode.stateType == StateType.FLOAT) {
                        rolenode.changeState(StateType.IDLE);
                        rolenode.refreshState();
                    }
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
                rolenode.Log.string = "mx:"+mx+"my:"+my;
                var width = node.width;
                var height = node.height;
                var newppos = node.parent.convertToNodeSpace(cc.v2(mx,my)); 
                // rolenode.node.position = newppos;
                // return;
                if (rolenode._maphandle) {
                    if (rolenode._maphandle.selectRole) {
                        var topos = rolenode._maphandle.getPosByPixelPos(newppos);
                        var torole = rolenode._maphandle.getRoleByPos(topos);
                        if (torole && rolenode.stateType != StateType.FLOAT) {
                            var can = rolenode._maphandle.selectRole.checkCanChangePos(torole);
                            if (can) {
                                var can2 = rolenode._maphandle.selectRole.checkCanChangePos(torole);
                                var toidx1= torole.idx;
                                var toidx2 = rolenode.idx;
                                rolenode.resetPosition();
                                torole.resetPosition();
                                rolenode._maphandle.setRoleInIdx(rolenode,toidx1);
                                rolenode._maphandle.setRoleInIdx(torole,toidx2);
                                rolenode.changeState(StateType.CHANGE,toidx1);
                                torole.changeState(StateType.CHANGE,toidx2);
                                rolenode.node.zIndex = 1;
                                rolenode._maphandle.selectRole.bPress = false;
                                rolenode._maphandle.selectRole = null;
                            }
                        }
                        else{
                            rolenode.changeState(StateType.FLOAT);
                            if (torole && torole != rolenode) {
                                var ppos = rolenode._maphandle.findNearestNull(newppos,rolenode);
                                if (ppos) {
                                    rolenode.node.position = ppos;
                                    var newidx = rolenode._maphandle.getIndexByPos(rolenode._maphandle.getPosByPixelPos(ppos));
                                    if (newidx != rolenode.idx) {
                                        rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
                                        rolenode._maphandle.setRoleInIdx(rolenode,newidx);
                                        rolenode.refreshRound(true);
                                    }
                                }
                            }
                            else {
                                rolenode.stateType = StateType.FLOAT;
                                rolenode.node.position = newppos;
                                var newidx = rolenode._maphandle.getIndexByPos(rolenode._maphandle.getPosByPixelPos(newppos));
                                if (newidx != rolenode.idx) {
                                    rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
                                    rolenode._maphandle.setRoleInIdx(rolenode,newidx);
                                    rolenode.refreshRound(true);
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    
    refreshRound: function (brfnow) {
        var cpos = this._maphandle.getPosByIndex(this.idx);
        var urole = this._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
        var uurole = this._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-2));
        var drole = this._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
        this._maphandle.pushRefreshMap(urole);
        this._maphandle.pushRefreshMap(uurole);
        this._maphandle.pushRefreshMap(drole);
        this._maphandle.pushRefreshMap(lrole);
        this._maphandle.pushRefreshMap(rrole);
        this._maphandle.pushRefreshMap(lurole);
        this._maphandle.pushRefreshMap(rurole);
        this._maphandle.pushRefreshMap(ldrole);
        this._maphandle.pushRefreshMap(rdrole);
        if (brfnow) {
            urole?urole.refreshState():null;
            uurole?uurole.refreshState():null;
            drole?drole.refreshState():null;
            lrole?lrole.refreshState():null;
            rrole?rrole.refreshState():null;
            lurole?lurole.refreshState():null;
            rurole?rurole.refreshState():null;
            ldrole?ldrole.refreshState():null;
            rdrole?rdrole.refreshState():null;
        }
    },
    
    createStateMgr: function () {
        if (!this.stateMgr) {
            this.stateMgr = new StateMgr();
            this.stateMgr.temp = this;
        }
    },
    
    changeState: function (state,param,isSub) {
        this.stateType = state;
        if (this.stateMgr) {
            switch (state) {
                case StateType.IDLE:
                    this.stateMgr.changeState(RoleNodeState.NSStateIdle.GetInstance(),param,isSub);
                    break;
                case StateType.CHANGE:
                    this.stateMgr.changeState(RoleNodeState.NSStateChange.GetInstance(),param,isSub);
                    break;
                case StateType.SHAKE:
                    this.stateMgr.changeState(RoleNodeState.NSStateShake.GetInstance(),param,isSub);
                    break;
                case StateType.BOOM:
                    this.stateMgr.changeState(RoleNodeState.NSStateBoom.GetInstance(),param,isSub);
                    break;
                case StateType.DOWN:
                    this.stateMgr.changeState(RoleNodeState.NSStateDown.GetInstance(),param,isSub);
                    break;
                case StateType.FLOAT:
                    this.stateMgr.changeState(RoleNodeState.NSStateFloat.GetInstance(),param,isSub);
                    break;
                case null:
                    this.stateMgr.changeState(null,param,isSub);
                    break;
            
                default:
                    this.stateMgr.changeState(RoleNodeState.NSStateIdle.GetInstance(),param,isSub);                
                    break;
            }
        }
    },
    
    resetPosition: function () {
        var ppos = this._maphandle.getPixelPosByPos(this._maphandle.getPosByIndex(this.idx));  
        this.node.position = ppos;
    },
    
    compareShakeLineRole: function (linerole) {
          if (this._shakeLineRole.length != linerole.length) {
              this._shakeLineRole = linerole.slice(0);
              return false;
          }
          return true;
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
                        this.changeState(StateType.DOWN,toidx);  
                    break;
                }
                var cpre = true;
                var re = this.checkCanShake(function (re,linerole) {
                    if (re) {
                         for (var key in linerole) {
                            if (linerole.hasOwnProperty(key)) {
                                var element = linerole[key];
                                node._maphandle.pushRefreshMap(element);
                            }
                        }
                        cpre = node.compareShakeLineRole(linerole);
                    }
                });
                if (re) {
                    if (!cpre) {
                        this.changeState(StateType.SHAKE);
                        for (var key in this._shakeLineRole) {
                            if (this._shakeLineRole.hasOwnProperty(key)) {
                                var element = this._shakeLineRole[key];
                                element.changeState(StateType.SHAKE);
                            }
                        }
                    }
                    break;
                }
                this.changeState(StateType.IDLE);
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
    
    
    checkCanChangePos: function (role) {
        if (role instanceof RoleNode && this._maphandle && role != this 
        && (role.stateType == StateType.IDLE || role.stateType == StateType.SHAKE) 
        && (this.stateType == StateType.IDLE || this.stateType == StateType.SHAKE)
        ) {
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
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,this._touchCallBack);
        this._layer = this.node.parent.getComponent(cc.TiledLayer);
        this._maphandle = this.node.parent.getComponent(MapLayoutHandle);
        this.createStateMgr();
        this.Log = cc.find("Canvas/Game/stage1/Log").getComponent(cc.Label);
        this.Log.string = "good1";
        //this.buildBox2d();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.bodyA && this.bodyA.IsActive()) {
            this.node.position = this.convertToNode(this.bodyA.GetPosition());
            this.node.rotation = this.bodyA.GetAngle()*this.RADTODEG%360;
        }
        
        if (this.stateMgr) {
            this.stateMgr.onTick(dt);
        }
    },
    
    onDestroy: function () {
        if (this.bodyA) {
            Game.instance.world.DestroyBody(this.bodyA);
        }
    },
});


RoleNode.StateType = StateType;
