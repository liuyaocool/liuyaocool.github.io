class LinePainter {
    constructor(ctx, viewCtx) {
        this.ctx = ctx;
        this.viewCtx = viewCtx;
        this.ps = [];
    }

    start(left, top) {
        this.ps.push([left, top]);
        this.ctx.beginPath();
        this.ctx.moveTo(left, top);
        return this;
    }

    move(color, left, top) {
        this.ps.push([left, top]);
        this.ctx.strokeStyle = color;
        this.ctx.lineTo(left, top);
        this.ctx.stroke();
        return this;
    }

    end() {
        this.ctx.closePath();
        return this;
    }

    repaint() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.ps[0][0], this.ps[0][1]);
        for (let i = 1; i < this.ps.length; i++) {
            ctx.lineTo(this.ps[i][0], this.ps[i][1]);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        return this;
    }
}
