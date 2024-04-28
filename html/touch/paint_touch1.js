
/**
 * 可以做两层画布 一层绘制(可实时清空 实线画园效果) 一层显示效果
 */

const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    hisPainter = [], // [{type: data}]
    painterTypes = {
        "line": LinePainter
    };

let redoPainter = [],
    curType = 'line',
    curColor = '#ffffff',
    curPainter = null, // 切换图形时初始化
    scale = 1,
    touchingLen = 0;

// ctx.strokeStyle = '#ff0000'; // 画笔颜色
ctx.lineWidth = 1; // 画笔粗细
ctx.lineCap = 'round'; // 画笔形状
// 设置canvas大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function getTouchAxis(touch) {
    // 这里获得的座标都是相对于屏幕的 ?
    let a = canvas.getBoundingClientRect();
    return [(touch.clientX - a.x) / scale, (touch.clientY - a.y) / scale];
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
canvas.addEventListener('touchstart', function(e) {
    // addEventListener 绑定多个处理函数， 多个函数操作同一变量会覆盖
    touchingLen = e.touches.length;
    touchFunction('touchstart', e);
});
canvas.addEventListener('touchmove', function(e) {
    touchFunction('touchmove', e);
});
canvas.addEventListener('touchend', function(e) {
    touchFunction('touchend', e);
});


function showTouchAxis(touches, pre) {
    let a = '';
    for (let i = 0; i < touches.length; i++) {
        a += `${Math.round(touches[i].clientX)},${Math.round(touches[i].clientY)}/`;
    }
    document.getElementById('touchAxis').innerText = `${pre || ''}${a}`;
}

// 双指触摸回调
function touch2MoveCall(x, y, rad, scale, offsetX, offsetY) {
    canvas.style.transformOrigin = `${x}px ${y}px`;
    canvas.style.transform = `scale(${scale}) rotate(${rad}rad)`;
    canvas.style.left = `${offsetX}px`;
    canvas.style.top = `${offsetY}px`;

    // document.getElementById('touchAxis').innerText = `[${x}, ${y}] scale=${scale} rad=${rad} [${offsetX}, ${offsetY}]`;
}
