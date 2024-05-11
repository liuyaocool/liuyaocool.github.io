class LinePainter {
    constructor(ctx, viewCtx) {
        this.ctx = ctx;
        this.viewCtx = viewCtx;
        this.ps = [];
    }

    start(left, top, color) {
        this.ps.push([left, top, color]);
        this.ctx.beginPath();
        this.ctx.moveTo(left, top);
        return this;
    }

    move(color, left, top) {

        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        let preP = this.ps[this.ps.length-1];
        this.ctx.moveTo(preP[0], preP[1]);
        this.ctx.strokeStyle = color;
        this.ctx.lineTo(left, top);

        this.ps.push([left, top, color]);
        return this;
    }

    end() {
        this.ctx.stroke();
        this.ctx.closePath();
        return this;
    }

    repaint() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.ps[0][0], this.ps[0][1]);
        for (let i = 1; i < this.ps.length; i++) {
            this.ctx.strokeStyle = this.ps[i][2];
            ctx.lineTo(this.ps[i][0], this.ps[i][1]);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        return this;
    }
}
