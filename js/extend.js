Array.prototype.removeAll = function(item) {
    let l = 0, idx = 0;
    for(let i = 0; i < this.length; i++) {
        if(this[i] !== item) {
            this[idx++] = this[i];
        } else {
            l++;
        }
    }
    this.length -= l;
    return l;
}