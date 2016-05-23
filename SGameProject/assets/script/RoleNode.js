
var MapLayoutHandle = require("MapLayoutHandle");
var Box2d = require("box2dweb-commonjs");
var Game = require("Game");
var StateMgr = require("StateMgr");
var NodeRoleState = require("NodeRoleState");

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
                                        var cpos = rolenode._maphandle.getPosByIndex(rolenode.idx);
                                        var urole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
                                        var drole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
                                        var lrole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
                                        var rrole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
                                        rolenode._maphandle.pushRefreshMap(urole);
                                        rolenode._maphandle.pushRefreshMap(drole);
                                        rolenode._maphandle.pushRefreshMap(lrole);
                                        rolenode._maphandle.pushRefreshMap(rrole);
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
                                    var cpos = rolenode._maphandle.getPosByIndex(rolenode.idx);
                                    var urole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
                                    var drole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
                                    var lrole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
                                    var rrole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
                                    var lurole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
                                    var rurole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
                                    var ldrole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
                                    var rdrole = rolenode._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
                                    rolenode._maphandle.pushRefreshMap(urole);
                                    rolenode._maphandle.pushRefreshMap(drole);
                                    rolenode._maphandle.pushRefreshMap(lrole);
                                    rolenode._maphandle.pushRefreshMap(rrole);
                                    rolenode._maphandle.pushRefreshMap(lurole);
                                    rolenode._maphandle.pushRefreshMap(rurole);
                                    rolenode._maphandle.pushRefreshMap(ldrole);
                                    rolenode._maphandle.pushRefreshMap(rdrole);
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
        var drole = this._maphandle.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this._maphandle.getRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this._maphandle.getRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
        this._maphandle.pushRefreshMap(urole);
        this._maphandle.pushRefreshMap(drole);
        this._maphandle.pushRefreshMap(lrole);
        this._maphandle.pushRefreshMap(rrole);
        this._maphandle.pushRefreshMap(lurole);
        this._maphandle.pushRefreshMap(rurole);
        this._maphandle.pushRefreshMap(ldrole);
        this._maphandle.pushRefreshMap(rdrole);
        if (brfnow) {
            urole.refreshState();
            drole.refreshState();
            lrole.refreshState();
            rrole.refreshState();
            lurole.refreshState();
            rurole.refreshState();
            ldrole.refreshState();
            rdrole.refreshState();
        }
    },
    
    createStateMgr: function () {
        if (!this.stateMgr) {
            this.stateMgr = new StateMgr(this);
        }
    },
    
    changeState: function (state,param,isSub) {
        this.stateType = state;
        if (this.stateMgr) {
            switch (state) {
                case StateType.IDLE:
                    this.stateMgr.changeState(NodeRoleState.NSStateIdle.GetInstance(),param,isSub);
                    break;
                case StateType.CHANGE:
                    this.stateMgr.changeState(NodeRoleState.NSStateChange.GetInstance(),param,isSub);
                    break;
                case StateType.SHAKE:
                    this.stateMgr.changeState(NodeRoleState.NSStateShake.GetInstance(),param,isSub);
                    break;
                case StateType.BOOM:
                    this.stateMgr.changeState(NodeRoleState.NSStateBoom.GetInstance(),param,isSub);
                    break;
                case StateType.DOWN:
                    this.stateMgr.changeState(NodeRoleState.NSStateDown.GetInstance(),param,isSub);
                    break;
                case StateType.FLOAT:
                    this.stateMgr.changeState(NodeRoleState.NSStateFloat.GetInstance(),param,isSub);
                    break;
                case null:
                    this.stateMgr.changeState(null,param,isSub);
                    break;
            
                default:
                    this.stateMgr.changeState(NodeRoleState.NSStateIdle.GetInstance(),param,isSub);                
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
                        this.startDown(toidx);
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
                        this.startShake();
                        for (var key in this._shakeLineRole) {
                            if (this._shakeLineRole.hasOwnProperty(key)) {
                                var element = this._shakeLineRole[key];
                                element.startShake();
                            }
                        }
                    }
                    break;
                }
                this.startIdle();
                break;
            }while (true)
            var afterstate = this.stateType;
            if (beforestate == StateType.IDLE && StateType.IDLE == afterstate) {
                this._maphandle.removeRefreshMap(this);
                this._downToIdx = null;
                this._shakeLineRole = [];
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
        if (this.stateType == StateType.IDLE) {
            return ;
        }
        this.stateType = StateType.IDLE;
        this.node.stopAllActions();
        this._shakeLineRole = [];
        this.resetPosition();
    },
    
    startChange: function (toidx) {
        if (this.stateType == StateType.CHANGE) {
            return ;
        }
        this._shakeLineRole = [];
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
        // if (this.stateType == StateType.SHAKE) {
        //     return ;
        // }
        this.stateType = StateType.SHAKE;
        this.node.stopAllActions();
        this.resetPosition();
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
        this.resetPosition();
        this._shakeLineRole = [];
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
            rolenode._maphandle.removeRefreshMap(rolenode);
        };
        be.parent = this.node;
        be.x = 0;
        be.y = 0;
    },
    
    
    RefreshDown: function (dt) {
        if (this._downToIdx && this._downToIdx >= 0 && this.stateType == StateType.DOWN) {
            var toppos = this._maphandle.getPixelPosByPos(this._maphandle.getPosByIndex(this._downToIdx));
            if (this.node.y <= toppos.y) { //到达才开始继续检查
                var toidx = this.checkCanDown();
                if (toidx && toidx != this._downToIdx) {
                    this._maphandle.setRoleInIdx(null,this.idx);
                    this._maphandle.setRoleInIdx(this,toidx);
                    this._downToIdx = toidx;
                    var pos = this._maphandle.getPosByIndex(this.idx);
                    var urole = this._maphandle.getRoleByPos(cc.v2(pos.x,pos.y-2));
                    this._maphandle.pushRefreshMap(urole);
                    if (urole) {
                        urole.refreshState();
                    }
                }
                else {
                    var toidx = this.checkCanDown();
                    this._downToIdx = null;
                    this.stateType = StateType.IDLE;
                    this.resetPosition();
                    this.refreshState();
                    return;
                }
            }
            this.node.y -= dt * 300;
        }

    },
    
    startDown: function (toidx) {
        // if (this.stateType == StateType.DOWN) {
        //     return ;
        // }
        //this.resetPosition();
        this._shakeLineRole = [];
        this.stateType = StateType.DOWN;
        this.node.stopAllActions();
        this._maphandle.setRoleInIdx(null,this.idx);
        this._maphandle.setRoleInIdx(this,toidx);
        this._downToIdx = toidx;
        // var ppos = this._maphandle.getPixelPosByPos(this._maphandle.getPosByIndex(toidx));
        // // var length = this.node.position.y - ppos.y;
        // // var time = length/10;
        // var action = cc.moveTo(0.2, ppos);
        // //action.easing(cc.easeIn(3.0));
        // var callfun = cc.callFunc(function (params) {
        //     this.stateType = StateType.IDLE;
        //     if (this.bodyA) {
        //         this.bodyA.SetActive(true);
        //         var wppos = this.convertToWorld();
        //         this.bodyA.SetPosition(wppos);
        //     }
        //     this.refreshState();
        // },this);
        // var sqe = cc.sequence(action,callfun);
        // this.node.runAction(sqe);
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
        this.changeState(StateType.IDLE);
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
        this.RefreshDown(dt);
    },
    
    onDestroy: function () {
        if (this.bodyA) {
            Game.instance.world.DestroyBody(this.bodyA);
        }
    },
});


RoleNode.StateType = StateType;
