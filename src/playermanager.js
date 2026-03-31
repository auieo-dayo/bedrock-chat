export default class PlayerManager {
    constructor() {
        this.list = new Map()
    }
    add(nametag,xuid) {
        this.list.set(nametag,xuid)
        if (typeof this._onevent == "function") this._onevent(nametag,1)
    }
    remove(nametag) {
        this.list.delete(nametag)
        if (typeof this._onevent == "function") this._onevent(nametag,0) 
    }
    getSize() {
        return this.list.size
    }
    onevent(callback) {
        if (typeof callback == "function") this._onevent = callback
    }
}