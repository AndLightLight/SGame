
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
    BOOMDOWN: 7,
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

        guid: {
            default: 0,
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

        //downboomparam
        _boomdownToIdx: null,
        
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
                        rolenode.ChangeState(StateType.IDLE);
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
                        rolenode.ChangeState(StateType.IDLE);
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
                //rolenode.Log.string = "mx:"+mx+"my:"+my;
                var width = node.width;
                var height = node.height;
                var newppos = node.parent.convertToNodeSpace(cc.v2(mx,my)); 
                // rolenode.node.position = newppos;
                // return;
                if (rolenode._maphandle) {
                    if (rolenode._maphandle.selectRole) {
                        var topos = rolenode._maphandle.GetPosByPixelPos(newppos);
                        var torole = rolenode._maphandle.GetRoleByPos(topos);
                        if (torole && rolenode.stateType != StateType.FLOAT) {
                            var can = rolenode._maphandle.selectRole.CheckCanChangePos(torole);
                            if (can) {
                                var can2 = rolenode._maphandle.selectRole.CheckCanChangePos(torole);
                                var toidx1= torole.idx;
                                var toidx2 = rolenode.idx;
                                rolenode.ResetPosition();
                                torole.ResetPosition();
                                rolenode._maphandle.SetRoleInIdx(rolenode,toidx1);
                                rolenode._maphandle.SetRoleInIdx(torole,toidx2);
                                rolenode.ChangeState(StateType.CHANGE,toidx1);
                                torole.ChangeState(StateType.CHANGE,toidx2);
                                rolenode.node.zIndex = 1;
                                rolenode._maphandle.selectRole.bPress = false;
                                rolenode._maphandle.selectRole = null;
                            }
                        }
                        else{
                            if (rolenode.IsFloatStateRequire()) {
                                rolenode.ChangeState(StateType.FLOAT);
                                var binboder = rolenode._maphandle.CheckInBorder(newppos);
                                if (binboder) {
                                    if ((torole && torole != rolenode) ) {
                                        var ppos = rolenode._maphandle.FindNearestNull(newppos,rolenode);
                                        if (ppos) {
                                            rolenode.node.position = ppos;
                                            var newidx = rolenode._maphandle.GetIndexByPos(rolenode._maphandle.GetPosByPixelPos(ppos));
                                            if (newidx != rolenode.idx) {
                                                rolenode._maphandle.SetRoleInIdx(null,rolenode.idx);
                                                rolenode._maphandle.SetRoleInIdx(rolenode,newidx);
                                                rolenode.RefreshRound();
                                            }
                                        }
                                    }
                                    else {
                                        rolenode.stateType = StateType.FLOAT;
                                        rolenode.node.position = newppos;
                                        var newidx = rolenode._maphandle.GetIndexByPos(rolenode._maphandle.GetPosByPixelPos(newppos));
                                        if (newidx != rolenode.idx) {
                                            rolenode.RefreshRound();
                                            rolenode._maphandle.SetRoleInIdx(null,rolenode.idx);
                                            rolenode._maphandle.SetRoleInIdx(rolenode,newidx);
                                            rolenode.RefreshRound();
                                        }
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    
    RefreshRound: function () {
        var cpos = this._maphandle.GetPosByIndex(this.idx);
        var urole = this._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y-1));
        var uurole = this._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y-2));
        var drole = this._maphandle.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this._maphandle.GetRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this._maphandle.GetRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this._maphandle.GetRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this._maphandle.GetRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this._maphandle.GetRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this._maphandle.GetRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
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
    
    ChangeState: function (state,param,isSub) {
        this.stateType = state;
        if (this.stateMgr) {
            switch (state) {
                case StateType.IDLE:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateIdle.GetInstance(),param,isSub);
                    break;
                case StateType.CHANGE:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateChange.GetInstance(),param,isSub);
                    break;
                case StateType.SHAKE:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateShake.GetInstance(),param,isSub);
                    break;
                case StateType.BOOM:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateBoom.GetInstance(),param,isSub);
                    break;
                case StateType.DOWN:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateDown.GetInstance(),param,isSub);
                    break;
                case StateType.FLOAT:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateFloat.GetInstance(),param,isSub);
                    break;
                case StateType.MERGE:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateMerge.GetInstance(),param,isSub);
                    break;
                case null:
                    this.stateMgr.ChangeState(null,param,isSub);
                    break;
            
                default:
                    this.stateMgr.ChangeState(RoleNodeState.RNStateIdle.GetInstance(),param,isSub);
                    break;
            }
        }
    },
    
    ResetPosition: function () {
        var ppos = this._maphandle.GetPixelPosByPos(this._maphandle.GetPosByIndex(this.idx));
        this.node.position = ppos;
    },
    
    CompareShakeLineRole: function (linerole,mergetoroleid) {
          if (this._shakeLineRole.length != linerole.length) {
              this._shakeLineRole = linerole.slice(0);
              this._mergetoroleid = mergetoroleid;
              return false;
          }
          return true;
    },
    
    CheckCanChangePos: function (role) {
        if (role instanceof RoleNode && this._maphandle && role != this 
        && this.IsChangeStateRequire()
        && role.IsChangeStateRequire()
        ) {
            var rpos = this._maphandle.GetPosByIndex(role.idx);
            var cpos = this._maphandle.GetPosByIndex(this.idx);
            
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
    
    
    CheckCanShake: function (callback) {
        if (this.IsShakeStateRequire()) {
            return this._maphandle.CheckCanShake(this.idx,this.info.type,function (re,linerole) {
                if (callback) {
                    callback(re,linerole);
                }
            });
        }
        
        return {"result":false,"linerole":[]};
    },
    
    CheckCanDown: function (callback) {
        if (this.IsDownStateRequire()) {
            var toidx = this._maphandle.CheckCanDown(this);
            if (toidx) {
                return toidx;
            }
        }
        
        return null;
    },

    IsBoomDownStateRequire: function () {
        if (this.info.bShake == true && this.stateType != StateType.CHANGE 
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    IsShakeStateRequire: function () {
        if (this.info.bShake == true && this.stateType != StateType.DOWN && this.stateType != StateType.CHANGE 
        && this.stateType != StateType.BOOM
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    IsFloatStateRequire: function () {
        if (this.info.bFloat == true && this.stateType != StateType.CHANGE && this.stateType != StateType.BOOM
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    IsChangeStateRequire: function () {
        if (this.info.bChange == true && this.stateType != StateType.BOOM && this.stateType != StateType.CHANGE
        && this.stateType != StateType.FLOAT
        && this.stateType != StateType.MERGE) {
            return true;
        }
        return false;
    },
    
    IsDownStateRequire: function () {
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
        
        // var lognode = new cc.Node('log2');
        // var logcp = lognode.addComponent(cc.Label);
        // lognode.parent = this.node;
        // lognode.x = 0;
        // lognode.y = 0;
        // this.selflog = logcp;
        // this.selflog.string = this.stateType;
        // this.selflog.node.active = false;

        //this.buildBox2d();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this._maphandle) {
            if (!this._maphandle.pause) {
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
            }
        }
    },
    
    onDestroy: function () {
        if (this.bodyA) {
            Game.instance.world.DestroyBody(this.bodyA);
        }


    },
});


RoleNode.FindLowestRole = function (rolelist) {
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
