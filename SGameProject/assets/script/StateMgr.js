var StateMgr = cc.Class({
    //extends: cc.Component,

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
        currentState: null,
        stateList: null,
        temp: null,
    },
    
    ctor: function (temp) {
        this.temp = temp;
    },

    // use this for initialization
    // onLoad: function () {
        
    // },
    
    changeState: function (state,param,isSub) {
        if (state) {
            if (isSub == true) {
                this.stateList.push(state);
                this.currentState = state;
                this.currentState.onEnter(this.temp,param);
            }
            else {
                if (this.currentState != state) {
                    var state = this.stateList.pop();
                    if (state) {
                        state.onExit(this.temp);
                    }
                    this.stateList.push(state);
                    this.currentState = state;
                    this.currentState.onEnter(this.temp,param);
                }
            }
        }
        else {
            var state = this.stateList.pop();
            if (state) {
                state.onExit(this.temp);
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
            element.onTick(this.temp);
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});


module.export = StateMgr;