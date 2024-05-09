
/**
 * 以top距离为x, left距离为y 可实线座标系匹配
 * 可以做两层画布 一层绘制(可实时清空 实线画园效果) 一层显示效果
 */

const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    hisPainter = [], // [{type: data}]
    painterTypes = {
        "line": LinePainter
    },
    // 初始变换数据： 弧度 缩放 canvas偏移 canvas变换固定点
    pre = {rad: 0, scale: 1, offset: [0, 0], fixed: [0, 0]},
    tmp_p = [];

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

function getTouchAxis(touch) {
    // 这里获得的座标都是相对于屏幕的
    let p = [0, 0];
    tmp_p[0] = touch.clientY;
    tmp_p[1] = touch.clientX;
    // convertScreepToCanvas(p, pre.fixed, tmp_p, pre.scale, pre.rad, pre.offset);
    return p;
}

function touchstart1(e) {
    [x, y] = getTouchAxis(e.touches[0]);
    curPainter = new painterTypes[curType](ctx, null).start(x, y);
    redoPainter = [];
}

function touchmove1(e) {
    [x, y] = getTouchAxis(e.touches[0]);
    if (curPainter) curPainter.move(curColor, x, y);
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

function touchFunction(evName, e) {
    showTouchAxis(e.touches, `${evName}(${touchingLen}):`);
    switch(touchingLen) {
        case 1:
        case 2: 
            window[`${evName}${touchingLen}`](e);
            break;
    }
}

function touchend(e) {
    touchFunction('touchend', e);
    touchingLen = 0; // 多个手指会触发多次end事件
}
canvas.addEventListener('touchstart', function(e) {
    // addEventListener 绑定多个处理函数， 多个函数操作同一变量会覆盖
    touchingLen = e.touches.length;
    touchFunction('touchstart', e);
});
canvas.addEventListener('touchmove', function(e) {
    if (e.touches.length != touchingLen) {
        touchend(e);
    } else {
        touchFunction('touchmove', e);
    }
});
canvas.addEventListener('touchend', touchend);

function showTouchAxis(touches, pre) {
    let a = '';
    for (let i = 0; i < touches.length; i++) {
        a += `${Math.round(touches[i].clientX)},${Math.round(-touches[i].clientY)}/`;
    }
    document.getElementById('touchAxis1').innerText = `${pre || ''}${a}`;
}

// 双指触摸回调
function touch2MoveCall(x, y, rad, scale, offsetX, offsetY) {
    canvas.style.transformOrigin = `${x}px ${y}px`;
    canvas.style.transform = `scale(${scale}) rotate(${rad}rad)`;
    canvas.style.left = `${offsetX}px`;
    canvas.style.top = `${offsetY}px`;

    // document.getElementById('touchAxis').innerText = `[${x}, ${y}] scale=${scale} rad=${rad} [${offsetX}, ${offsetY}]`;
}


// 转换: 屏幕点 -> 原始画布点
function convertScreepToCanvas(p, fixed, screenP, scale, rad, offset) {
    // 1. 新固定点 逆偏移
    p[0] = screenP[0] - offset[0];
    p[1] = screenP[1] - offset[1];
    // 2. 新固定点 逆缩放, 且旧固定点平移到原点(方便步骤3)
    p[0] = (p[0] - fixed[0]) / scale;
    p[1] = (p[1] - fixed[1]) / scale;
    // 3. 新固定点 逆旋转
    // 3.1 参数准备
    let rcos = Math.cos(rad), rsin = Math.sin(rad);
    // 3.2 计算旋转后的坐标, +fixed(旧固定点复位)
    [x, y] = [p[0], p[1]];
    p[0] = x * rcos - y * rsin;
    p[1] = x * rsin + y * rcos;
    // 4. 恢复固定点
    p[0] += fixed[0] + offset[0];
    p[1] += fixed[1] + offset[1];
}