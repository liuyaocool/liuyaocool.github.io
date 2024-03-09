const {createApp} = Vue;
const vm = createApp({
    data() {
        let editSize = [300, 600],
            paddingr = [0.25, 0, 0.25, 0];
        return {
            coor: [0, 0, 1, 1],
            cmp_coor: [],
            svg: {
                editPath: '',
                editP1Fixed: [0, 450],
                editP1: [0, editSize[1]*0.75],
                editP2Fixed: [300, 150],
                editP2: [editSize[0], editSize[1]],
                editWidth: editSize[0],
                editHeight: editSize[1],
                editPadding: [editSize[1]/4, 0, editSize[1]/4, 0],
                editLines: [
                    [0, 450, 300, 150, {"stroke": 'gray', "stroke-width": '3px'}], //对角线 [x1, y1, x2, y2]
                    [0, 450, 300, 450, {"stroke": 'gray', "stroke-width": '1px'}], // x坐标轴 [同上]
                    [0, 450, 0, 150, {"stroke": 'gray', "stroke-width": '2px'}], // y坐标轴 [同上]
                ],
                libwidth: 100,
                libheight: 100,
                libpadding: [15, 15, 15, 15],
                movePath: 'M10 90 C90 10 90 106 90 10',
                movewidth: 60,
                moveheight: 60,
                movepadding: [10, 10, 10, 10],
                comparePath: 'M10 50 C10 50 50 10 50 10',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            panel: {
                et: '[\n["name", ".95, -0.04, .85, 1.49"]\n]',
                show: '',
                json: '',
            },
            move: {
                class: '',
                duration: 1.1,
                current_func: 'cubic-bezier(0, 0, 1, 1)',
                compare_func: 'cubic-bezier(0, 0, 1, 1)',
            },
            libSelIdx: 0,
            library: [],
        };
    },
    methods: {
        init() {
            let lib = localStorage.curves ? JSON.parse(localStorage.curves) : [
                ['linear', '0,0,1,1'],
                ['easeInSine', '0.47, 0, 0.745, 0.715'],
                ['easeOutSine', '0.39, 0.575, 0.565, 1'],
                ['easeInOutSine', '0.445, 0.05, 0.55, 0.95'],
                ['easeInQuad', '0.55, 0.085, 0.68, 0.53'],
                ['easeOutQuad', '0.25, 0.46, 0.45, 0.94'],
                ['easeInOutQuad', '0.455, 0.03, 0.515, 0.955'],
                ['easeInCubic', '0.55, 0.055, 0.675, 0.19'],
                ['easeOutCubic', '0.215, 0.61, 0.355, 1'],
                ['easeInOutCubic', '0.645, 0.045, 0.355, 1'],
                ['easeInQuart', '0.895, 0.03, 0.685, 0.22'],
                ['easeOutQuart', '0.165, 0.84, 0.44, 1'],
                ['easeInOutQuart', '0.77, 0, 0.175, 1'],
                ['easeInQuint', '0.755, 0.05, 0.855, 0.06'],
                ['easeOutQuint', '0.23, 1, 0.32, 1'],
                ['easeInOutQuint', '0.86, 0, 0.07, 1'],
                ['easeInExpo', '0.95, 0.05, 0.795, 0.035'],
                ['easeOutExpo', '0.19, 1, 0.22, 1'],
                ['easeInOutExpo', '1, 0, 0, 1'],
                ['easeInCirc', '0.6, 0.04, 0.98, 0.335'],
                ['easeOutCirc', '0.075, 0.82, 0.165, 1'],
                ['easeInOutCirc', '0.785, 0.135, 0.15, 0.86'],
                ['easeInBack', '0.6, -0.28, 0.735, 0.045'],
                ['easeOutBack', '0.175, 0.885, 0.32, 1.275'],
                ['easeInOutBack', '0.68, -0.55, 0.265, 1.55'],
                ['ease', '.25,.1,.25,1'],
                ['ease-in', '.42,0,1,1'],
                ['ease-out', '0,0,.58,1'],
                ['ease-in-out', '.42,0,.58,1']
            ];
            let a;
            for (var i = 0; i < lib.length; i++) {
                if (!lib[i][2]) {
                    a = lib[i][1].split(',');
                    lib[i][2] = bezierToSvg(this.svg.libwidth, this.svg.libheight,
                        this.svg.libpadding, a[0]*1, a[1]*1, a[2]*1, a[3]*1)[0];
                }
                this.library.push(lib[i]);
            }
            this.chooseLibrary(0);
            this.setCoor((location.hash ? location.hash.substr(1) : '1,-0.01,1,1.42').split(','));
            this.applyCoor();
        },
        limitEditX(x) {
            return Math.min(
                this.svg.editWidth-this.svg.editPadding[1],
                Math.max(this.svg.editPadding[3], x));
        },
        setEditP1(x, y) {
            this.svg.editP1 = [this.limitEditX(x), y];
            this.updateCoor();
        },
        setEditP2(x, y) {
            this.svg.editP2 = [this.limitEditX(x), y];
            this.updateCoor();
        },
        updateCoor() {
            this.setCoor(svgToBezier(this.svg.editWidth, this.svg.editHeight, this.svg.editPadding,
                this.svg.editP1Fixed, this.svg.editP1, this.svg.editP2));
        },
        setCoor(coor) {
            this.coor = coor.map(v => (v / 10).toFixed(3) * 1000 / 100);
            this.svg.movePath = bezierToSvg(this.svg.movewidth, this.svg.moveheight,
                this.svg.movepadding, this.coor[0], this.coor[1], this.coor[2], this.coor[3])[0];
            let editInfo = bezierToSvg(this.svg.editWidth, this.svg.editHeight, this.svg.editPadding,
                this.coor[0], this.coor[1], this.coor[2], this.coor[3]);
            this.svg.editPath = editInfo[0];
            this.svg.editP1 = editInfo[1];
            this.svg.editP2 = editInfo[2];
        },
        applyCoor() {
            let coorStr = this.coor.join(',');
            this.move.current_func = 'cubic-bezier(' + coorStr + ')';
            location.hash = coorStr;
        },
        move_toggle() {
            this.move.class = this.move.class ? '' : ' moved ';
        },
        chooseLibrary(idx) {
            this.libSelIdx = idx;
            let bpos = this.library[idx][1].split(',');
            this.cmp_coor = bpos;
            this.move.compare_func = 'cubic-bezier(' + this.library[idx][1] + ')';
            this.svg.comparePath = bezierToSvg(this.svg.movewidth, this.svg.moveheight,
                this.svg.movepadding, bpos[0]*1, bpos[1]*1, bpos[2]*1, bpos[3]*1)[0];
        },
        addLibrary(data) {
            this.library.push(data);
            localStorage.curves = JSON.stringify(this.library);
        },
        deleteLibrary(idx) {
            // 只有几个固定的方法可以触发双向绑定
            this.library.splice(idx, 1);
            localStorage.curves = JSON.stringify(this.library);
            // 如果当前是选中的 则选中第一个
            if (this.libSelIdx == idx) {
                this.chooseLibrary(0);
            }
        }
    }
}).mount('#app');

vm.init();


document.getElementById('editP1').onmousedown = function(e) {
    let x = e.screenX, y = e.screenY;
    let oldp1 = [vm.svg.editP1[0], vm.svg.editP1[1]];
    document.onmousemove = function (e) {
        vm.setEditP1(oldp1[0]+e.screenX-x, oldp1[1]+e.screenY-y)
    }
    document.onmouseup = e => {
        document.onmousemove = document.onmouseup = null;
        vm.applyCoor();
    }
}
document.getElementById('editP2').onmousedown =  function(e) {
    let x = vm.svg.editP2[0]-e.screenX, y = vm.svg.editP2[1]-e.screenY;
    document.onmousemove =  e => vm.setEditP2(x+e.screenX, y+e.screenY);
    document.onmouseup = e => {
        document.onmousemove = document.onmouseup = null;
        vm.applyCoor();
    }
};

/**
 * 贝塞尔参数 转换为svg path
 * svg座标 左上为 (0,0)
 * @param w svg 宽度
 * @param h svg 高度
 * @param padding 边距 [上，右，下，左]
 * @param sx 开始点移动点 x比例 (0~1)
 * @param sy 开始点移动点 y比例 all
 * @param ex 结束点移动点 x比例 (0~1)
 * @param ey 结束点移动点 y比例 all
 * @returns {string}
 */
function bezierToSvg(w, h, padding, sx, sy, ex, ey) {
    // 边距
    w -= padding[3] + padding[1];
    h -= padding[2] + padding[0];
    let ps = [padding[3], h+padding[0]], // 开始点座标
        pe = [w+padding[3], padding[0]], // 结束点座标
        psm = [Math.floor(w*sx)+padding[3], Math.floor(h*(sy-1)*-1)+padding[0]], // 开始点移动点座标
        pem = [Math.floor(w*ex)+padding[3], Math.floor(h*(ey-1)*-1)+padding[0]]; // 结束点移动点座标
    return [`M${ps[0]} ${ps[1]} C${psm[0]} ${psm[1]} ${pem[0]} ${pem[1]} ${pe[0]} ${pe[1]}`, psm, pem];
}

/**
 * svg坐标转换为贝塞尔参数
 * svg座标 左上为 (0,0)
 * @param w svg 宽度
 * @param h svg 高度
 * @param padding 边距 [上，右，下，左]
 * @param pz svg开始点坐标
 * @param p1 开始点移动点坐标
 * @param p2 结束点移动点坐标
 * @return {[]}
 */
function svgToBezier(w, h, padding, pz, p1, p2) {
    w -= padding[3] + padding[1];
    h -= padding[2] + padding[0];
    return [
        (p1[0] - pz[0]) / w,
        (pz[1] - p1[1]) / h,
        (p2[0] - pz[0]) / w,
        (pz[1] - p2[1]) / h
    ];
}


// ---------------- test ---------------
var prefix = (function (style) {
    let prefixes = ['', '-moz-', '-ms-', '-o-', '-webkit-'];
    for (var i = prefixes.length; i--;) {
        var prefix = prefixes[i];
        style.setProperty(prefix + 'transition', '1s', null);
        if (style.cssText) {
            return prefix;
        }
    }
    return null;
})(document.createElement('a').style);



var favicon = document.createElement('canvas'),
    faviconCtx = favicon.getContext('2d'),
    pixelDepth = window.devicePixelRatio || 1;
favicon.width = favicon.height = 16 * pixelDepth;

function saveLibrary() {
    let coorStr = vm.coor.join(',');
    if (prompt('If you want, you can give it a short name', coorStr)) {
        vm.addLibrary([name, coorStr]);
    }
};

function importBezier() {
    try {
        var newCurves = JSON.parse(vm.panel.json);
    } catch (e) {
        alert('input not a json');
        return;
    }
    for (let i = 0; i < newCurves.length; i++) {
        vm.addLibrary(newCurves[i]);
    }
    vm.panel.show = '';
};

function updateDelayed() {
    // Draw dynamic favicon
    var size = 16 * pixelDepth;
    faviconCtx.clearRect(0, 0, size, size);
    faviconCtx.fillStyle = '#0ab';
    roundRect(faviconCtx, 0, 0, size, size, 2);
    faviconCtx.fill();
    faviconCtx.drawImage(current, 0, 0, size, size);
    document.querySelector('link[rel="shortcut icon"]').setAttribute('href', favicon.toDataURL());
}

function roundRect(ctx, a, b, d, e, c) {
    ctx.beginPath();
    ctx.moveTo(a + c, b);
    ctx.lineTo(a + d - c, b);
    ctx.quadraticCurveTo(a + d, b, a + d, b + c);
    ctx.lineTo(a + d, b + e - c);
    ctx.quadraticCurveTo(a + d, b + e, a + d - c, b + e);
    ctx.lineTo(a + c, b + e);
    ctx.quadraticCurveTo(a, b + e, a, b + e - c);
    ctx.lineTo(a, b + c);
    ctx.quadraticCurveTo(a, b, a + c, b);
    ctx.closePath()
    return ctx;
}
