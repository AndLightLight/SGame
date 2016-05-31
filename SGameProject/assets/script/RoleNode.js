
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
    MERGE: 6,
});

var RoleNode = cc.Class({
    extends: cc.Component,

    properties: {
        info: {
            default: null,
            visible: false,
        },
        
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
        
        //shakeparam
        _shakeLineRole: [],
        _mergetoroleid: 0,
        
        //downparam
        _downToIdx: null,
        
        
        _layer: null,
        _maphandle: null,
        
        _brefresh: false,
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
                            if (rolenode.isFloatStateRequire()) {
                                rolenode.changeState(StateType.FLOAT);
                                if (torole && torole != rolenode) {
                                    var ppos = rolenode._maphandle.findNearestNull(newppos,rolenode);
                                    if (ppos) {
                                        rolenode.node.position = ppos;
                                        var newidx = rolenode._maphandle.getIndexByPos(rolenode._maphandle.getPosByPixelPos(ppos));
                                        if (newidx != rolenode.idx) {
                                            rolenode._maphandle.setRoleInIdx(null,rolenode.idx);
                                            rolenode._maphandle.setRoleInIdx(rolenode,newidx);
                                            rolenode.refreshRound();
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
                                        rolenode.refreshRound();
                                    }
                                }                               
                            }
                        }
                    }
                }
            }
        }
    },
    
    refreshRound: function () {
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
        urole?urole._brefresh = true:null;
        uurole?uurole._brefresh = true:null;
        drole?drole._brefresh = true:null;
        lrole?lrole._brefresh = true:null;
        rrole?rrole._brefresh = true:null;
        lurole?lurole._brefresh = true:null;
        rurole?rurole._brefresh = true:null;
        ldrole?ldrole._brefresh = true:null;
        rdrole?rdrole._brefresh = true:null;
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
                    this.stateMgr.changeState(RoleNodeState.RNStateIdle.GetInstance(),param,isSub);
                    break;
                case StateType.CHANGE:
                    this.stateMgr.changeState(RoleNodeState.RNStateChange.GetInstance(),param,isSub);
                    break;
                case StateType.SHAKE:
                    this.stateMgr.changeState(RoleNodeState.RNStateShake.GetInstance(),param,isSub);
                    break;
                case StateType.BOOM:
                    this.stateMgr.changeState(RoleNodeState.RNStateBoom.GetInstance(),param,isSub);
                    break;
                case StateType.DOWN:
                    this.stateMgr.changeState(RoleNodeState.RNStateDown.GetInstance(),param,isSub);
                    break;
                case StateType.FLOAT:
                    this.stateMgr.changeState(RoleNodeState.RNStateFloat.GetInstance(),param,isSub);
                    break;
                case StateType.MERGE:
                    this.stateMgr.changeState(RoleNodeState.RNStateMerge.GetInstance(),param,isSub);
                    break;
                case null:
                    this.stateMgr.changeState(null,param,isSub);
                    break;
            
                default:
                    this.stateMgr.changeState(RoleNodeState.RNStateIdle.GetInstance(),param,isSub);                
                    break;
            }
        }
    },
    
    resetPosition: function () {
        var ppos = this._maphandle.getPixelPosByPos(this._maphandle.getPosByIndex(this.idx));  
        this.node.position = ppos;
    },
    
    compareShakeLineRole: function (linerole,mergetoroleid) {
          if (this._shakeLineRole.length != linerole.length) {
              this._shakeLineRole = linerole.slice(0);
              this._mergetoroleid = mergetoroleid;
              return false;
          }
          return true;
    },
    
    checkCanChangePos: function (role) {
        if (role instanceof RoleNode && this._maphandle && role != this 
        && this.isChangeStateRequire()
        && role.isChangeStateRequire()
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
            return this._maphandle.checkCanShake(this.idx,this.info.type,function (re,linerole) {
                if (callback) {
                    callback(re,linerole);
                }
            });
        }
        
        return {"result":false,"linerole":[]};
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
        if (this.info.bShake == true && this.stateType != StateType.DOWN && this.stateType != StateType.CHANGE 
        && this.stateType != StateType.BOOM
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    isFloatStateRequire: function () {
        if (this.info.bFloat == true && this.stateType != StateType.CHANGE && this.stateType != StateType.BOOM
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    isChangeStateRequire: function () {
        if (this.info.bChange == true && this.stateType != StateType.BOOM && this.stateType != StateType.CHANGE
        && this.stateType != StateType.FLOAT
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    isDownStateRequire: function () {
        if (this.info.bDown == true && this.stateType != StateType.BOOM && this.stateType != StateType.CHANGE
        && this.stateType != StateType.FLOAT
        && this.stateType != StateType.MERGE) {
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
                // if (this.info.type == 0) {
                //     bodyDef.type = Box2d.b2Body.b2_staticBody;
                // }
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
        var lognode = new cc.Node('log2');
        var logcp = lognode.addComponent(cc.Label);
        lognode.parent = this.node;
        lognode.x = 0;
        lognode.y = 0;
        this.selflog = logcp;
        this.selflog.string = this.stateType;
        this.selflog.node.active = false;
        //this.buildBox2d();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.bodyA && this.bodyA.IsActive()) {
            this.node.position = this.convertToNode(this.bodyA.GetPosition());
            this.node.rotation = this.bodyA.GetAngle()*this.RADTODEG%360;
        }
        
        if (this.stateMgr) {
            if (this._brefresh == true) {
                //this.selflog.string = this.stateType;
                this.stateMgr.onTick(dt);
            }
        }
    },
    
    onDestroy: function () {
        if (this.bodyA) {
            Game.instance.world.DestroyBody(this.bodyA);
        }
    },
});


RoleNode.findLowestRole = function (rolelist) {
    var rrole;
    if (rolelist) {
        for (var key in rolelist) {
            if (rolelist.hasOwnProperty(key)) {
                var element = rolelist[key];
                rrole?((rrole.idx < element.idx)?rrole = element:null):rrole = element;
            }
        }
    }
    return rrole;
},


RoleNode.StateType = StateType;
