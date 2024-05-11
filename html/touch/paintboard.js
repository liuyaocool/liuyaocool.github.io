const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    hisPainter = [], // [{type: data}]
    painterTypes = {
        "line": LinePainter
    },
    start = { distance: 0, touch_middle: [0, 0] },
    // canvas变换数据： 缩放 偏移 变换固定点
    pre = {scale: 1, offset: [0, 0], fixed: [0, 0]},
    tmp = {p: [0,0], touch_middle: [0, 0], fixed: [0,0]}, // 方法栈临时变量
    run = {
        fixed: [0,0],
        screenp: [[0, 0], [0, 0]],
        touch_middle: [0, 0]
    };

let redoPainter = [],
    curType = 'line',
    curColor = '#ffffff',
    curPainter = null, // 切换图形时初始化
    touchingLen = 0; // 触摸点个数

// ctx.strokeStyle = '#ff0000'; // 画笔颜色
ctx.lineWidth = 1; // 画笔粗细
ctx.lineCap = 'round'; // 画笔形状
// 设置canvas大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function reset() {
    pre.scale = 1;
    pre.offset = [0, 0];
    pre.fixed = [0, 0];
    canvasTransform();
}

function touchstart1(e) {
    convertScreepToCanvas(tmp.p, run.screenp[0], pre.fixed, pre.scale, pre.offset);
    curPainter = new painterTypes[curType](ctx, null).start(tmp.p[0], tmp.p[1], curColor);
    redoPainter = [];
}

function touchmove1(e) {
    convertScreepToCanvas(tmp.p, run.screenp[0], pre.fixed, pre.scale, pre.offset);
    if (curPainter) curPainter.move(curColor, tmp.p[0], tmp.p[1]);
}

function touchend1(e) {
    if (curPainter) {
        hisPainter.push(curPainter.end());
        curPainter = null;
    }
}

// 前进
function redo() {
    let p = redoPainter.pop();
    if (!p) return;
    p.repaint();
    hisPainter.push(p);
}
// 回退
function undo() {
    let p = hisPainter.pop();
    if (!p) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redoPainter.push(p);
    for (let i = 0; i < hisPainter.length; i++) {
        hisPainter[i].repaint();
    }
}

// 双指触摸回调
function canvasTransform() {
    canvas.style.transformOrigin = `${pre.fixed[0]}px ${pre.fixed[1]}px`;
    canvas.style.transform = `scale(${pre.scale})`;
    canvas.style.left = `${pre.offset[0]}px`;
    canvas.style.top = `${pre.offset[1]}px`;
}

function touchstart2(e) {
    // 两指距离
    start.distance = calcDistance(run.screenp[0], run.screenp[1]) / pre.scale;
    // 当前两指中点
    calcMiddle(tmp.touch_middle, run.screenp[0], run.screenp[1]);
    // 计算 将当前两指中点变换为第一次变换时的 即 第一次变换时的中心点
    // 重新计算fixed
    convertScreepToCanvas(tmp.fixed, tmp.touch_middle, pre.fixed, pre.scale, pre.offset);
    pre.fixed[0] = (start.touch_middle[0] = tmp.fixed[0]);
    pre.fixed[1] = (start.touch_middle[1] = tmp.fixed[1]);
}

function touchmove2(e) {
    // 获得两指中点
    calcMiddle(tmp.touch_middle, run.screenp[0], run.screenp[1]);
    // 两指距离
    let distance = calcDistance(run.screenp[0], run.screenp[1]);
    // 与第一次对比 获得缩放
    pre.scale = distance / start.distance;
    // 与第一次对比 获得偏移
    pre.offset[0] = tmp.touch_middle[0] - start.touch_middle[0];
    pre.offset[1] = tmp.touch_middle[1] - start.touch_middle[1];

    canvasTransform();
};

function touchend2(e) {
};

// 转换: 屏幕点 -> 原始画布点
function convertScreepToCanvas(p, screenP, fixed, scale, offset) {
    for (let i = 0; i < 2; i++) {
        // 1. 还原偏移
        p[i] = screenP[i] - offset[i];
        // 2. fixed 移动至原点
        p[i] -= fixed[i];
        // 3. 还原缩放
        p[i] /= scale;
        // 4. 恢复 fixed
        p[i] += fixed[i];
    }
}

function calcDistance(p1, p2) {
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function calcMiddle(p, p1, p2) {
    p[0] = (p2[0] + p1[0]) / 2;
    p[1] = (p2[1] + p1[1]) / 2;
}

function touchFunction(evName, e) {
    for (let i = 0; i < e.touches.length; i++) {
        if (!run.screenp[i]) run.screenp[i] = [];
        run.screenp[i][0] = e.touches[i].clientX;
        run.screenp[i][1] = e.touches[i].clientY;
    }
    switch(touchingLen) {
        case 1:
        case 2: 
            window[`${evName}${touchingLen}`](e);
            break;
    }
    e.preventDefault();
}

function touchstart(e) {
    // addEventListener 绑定多个处理函数， 多个函数操作同一变量会覆盖
    touchingLen = e.touches.length;
    touchFunction('touchstart', e);
}
function touchmove(e) {
    if (e.touches.length != touchingLen) {
        touchend(e);
    } else {
        touchFunction('touchmove', e);
    }
}
function touchend(e) {
    touchFunction('touchend', e);
    touchingLen = 0; // 多个手指会触发多次end事件
}

canvas.addEventListener('touchstart', touchstart);
canvas.addEventListener('touchmove', touchmove);
canvas.addEventListener('touchend', touchend);

let pcClick = false;
function convertPcToTouch(e) {
    e.touches = [{clientX: e.clientX, clientY:e.clientY}];
    return e;
}
canvas.addEventListener('mousedown', e => {
    touchstart(convertPcToTouch(e));
    pcClick = true;
});
canvas.addEventListener('mousemove', e => {
    if (!pcClick) return;
    touchmove(convertPcToTouch(e));
});
function mouseOver(e) {
    if (!pcClick) return;
    touchend(convertPcToTouch(e));
    pcClick = false;
}
canvas.addEventListener('mouseleave', mouseOver);
canvas.addEventListener('mouseup', mouseOver);
canvas.addEventListener('wheel', e => {
    console.log(e);
});