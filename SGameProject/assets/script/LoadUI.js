var LoadUI = cc.Class({
    extends: cc.Component,

    properties: {
        StartLoading: {
            visible: false,  
            get: function () {
                return this._isLoading;
            },
            set: function (v) {
                this._isLoading = v;
                this.node.active = v;
            },
        },

        loadingBar: {
            default: null,
            type: cc.ProgressBar,
        },
        
        _isLoading: false,
        
        totalLoadNum: 0,
        currentLoadNum: 0,
        callBack: null,
    },

    // use this for initialization
    onLoad: function () {
        if (!LoadUI.instance) {
            LoadUI.instance = this;
        }
        else {
            cc.log("error: singlon class creat more then onece!")
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.StartLoading) {
            this.loadingBar.progress = this.currentLoadNum/this.totalLoadNum;
            if (this.totalLoadNum <= this.currentLoadNum) {
                this.node.active = false;
                this.StartLoading = false;
                this.totalLoadNum = 0;
                this.currentLoadNum = 0;
                if (this.callBack) {
                    this.callBack();
                }
                this.callBack = null;
            }
        }
    },
});
