var StateMgr = cc.Class({

    properties: {
        currentState: null,
        stateList: [],
        temp: null,
    },
    
    ctor: function () {

    },
    
    ChangeState: function (state,param,isSub) {
        if (state) {
            if (isSub == true) {
                this.stateList.push(state);
                this.currentState = state;
                this.currentState.onEnter(this.temp,param);
            }
            else {
                if (this.currentState != state) {
                    var oldstate = this.stateList.pop();
                    if (oldstate) {
                        oldstate.onExit(this.temp);
                    }
                    this.stateList.push(state);
                    this.currentState = state;
                    this.currentState.onEnter(this.temp,param);
                }
            }
        }
        else {
            var oldstate = this.stateList.pop();
            if (state) {
                oldstate.onExit(this.temp);
            }
            if (this.stateList.length > 0) {
                this.currentState = this.stateList[this.stateList.length - 1];
            }
            else {
                this.currentState = null;
            }
        }
    },
    
    onTick: function (dt) {
        for (var index = 0; index < this.stateList.length; index++) {
            var element = this.stateList[index];
            element.onTick(this.temp,dt);
        }
    }
});


module.exports = StateMgr;