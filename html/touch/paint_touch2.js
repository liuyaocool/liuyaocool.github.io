(function () {

    const start = {
            p: [[0, 0], [0, 0]],
            rad: 0, // 起始线弧度
            distance: 0, // 距离
            touch_middle: [0, 0], // 屏幕中点
        },
        // 初始变换数据： 弧度 缩放 canvas偏移 canvas变换固定点
        pre = {rad: 0, scale: 1, offset: [0, 0], fixed: [0, 0]},
        run = {rad: 0, scale: 1, offset: [0, 0], fixed: [0, 0]},
        tmp = {
            p: [[0, 0], [0, 0]],
            touch_middle: [0, 0]
        }
    ;
    function resetRun() {
        run.rad = 0;
        run.scale = 1;
        run.offset[0] = 0;
        run.offset[1] = 0;
    }

    window.touchstart2 = function(e) {
        resetRun();
        getTouches(start.p, e.touches);
        calcMiddle(start.touch_middle, start.p[0], start.p[1]);
        start.distance = calcDistance(start.p[0], start.p[1]);
        start.rad = calcLineRad(start.p[0], start.p[1]);
        /**
         * 切换变换中点 
         */
        // 1. 从屏幕点变换到canvas点
        convertFixed(run.fixed, pre.fixed, start.touch_middle, pre.scale, pre.rad, pre.offset);
        // 2. 转换原canvas点到新canvas点
        convertOffset(run.offset, run.fixed, start.touch_middle, pre.offset);


        // test
        document.getElementById('point').style.top = `${start.touch_middle[1]}px`;
        document.getElementById('point').style.left = `${start.touch_middle[0]}px`;

        ctx.beginPath();
        ctx.fillStyle = '#00FF00';
        // 绘制一个圆形路径
        ctx.arc(run.fixed[0], run.fixed[1], 7, 0, Math.PI * 2);
        // 填充路径
        ctx.fill();
        ctx.closePath();
    }

    window.touchmove2 = function (e) {
        try {
        getTouches(tmp.p, e.touches); // 点

        let scale = pre.scale * (run.scale = calcScale(start.distance, tmp.p[0], tmp.p[1])); // 缩放 ok
        let rad = pre.rad + (run.rad = calcTwoLineRad(start.rad, tmp.p[0], tmp.p[1])); // 角度

        calcMiddle(tmp.touch_middle, tmp.p[0], tmp.p[1]);
        // 不用除以scale: 这里offset是绝对定位，不受缩放影响
        let offsetX = pre.offset[0] + (run.offset[0] = (tmp.touch_middle[0] - start.touch_middle[0]));
        let offsetY = pre.offset[1] + (run.offset[1] = (tmp.touch_middle[1] - start.touch_middle[1]));

        document.getElementById('touchAxis2').innerText = `move2: scale=${scale}
        logg: ${logg}
        offset(${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})
        run offset(${run.offset[0].toFixed(0)}, ${run.offset[1].toFixed(0)})
        pre fixed(${pre.fixed[0].toFixed(2)}, ${pre.fixed[1].toFixed(2)})
        run fixed(${run.fixed[0].toFixed(2)}, ${run.fixed[1].toFixed(2)})
        tmp mid(${tmp.touch_middle[0].toFixed(0)}, ${tmp.touch_middle[1].toFixed(0)})
        `;

        touch2MoveCall(run.fixed[0], run.fixed[1], rad, scale, offsetX, offsetY);
        } catch(ex) {
            showTouchAxis(e, `${ex.message}\n${ex.stack}`);
        }
    };

    window.touchend2 = function(e) {
        pre.rad += run.rad;
        pre.scale *= run.scale;
        pre.offset[0] = run.offset[0];
        pre.offset[1] = run.offset[1];
        pre.fixed[0] = run.fixed[0];
        pre.fixed[1] = run.fixed[1];
    };

    function calcLineRad(p1, p2) {
        // 确定座标系即可 方向相反不影响计算
        var x = p2[0] - p1[0], y = p2[1] - p1[1];
        // 使用反三角函数计算角度（以弧度表示）
        var angle_radian = Math.atan2(y, x);
        return angle_radian < 0 ? angle_radian + 2 * Math.PI : angle_radian;
    }

    // 计算两条线段的弧度
    function calcTwoLineRad(rad, p1, p2) {
        // 计算两条线段的夹角（弧度）
        return calcLineRad(p1, p2) - rad;
    }

    // 计算两条线段的角度
    function radToAngle(rad) {
        // 将弧度转换为角度
        return rad * (180 / Math.PI);
    }

    function calcScale(distanceLine1, p1, p2) {
        return calcDistance(p1, p2) / distanceLine1;
    }

    function calcDistance(p1, p2) {
        let dx = p2[0] - p1[0];
        let dy = p2[1] - p1[1];
        return Math.sqrt(dx * dx + dy * dy).toFixed(0) * 1;
    }

    function calcMiddle(p, p1, p2) {
        p[0] = (p2[0] + p1[0]) / 2;
        p[1] = (p2[1] + p1[1]) / 2;
    }

    let logg = '';
    function convertFixed(p, fixed, screenP, scale, rad, offset) {
        // p[0] = screenP[0];
        // p[1] = screenP[1];
        // 思路 转换座标
        logg = `rad=${rad} `;
        // 1. 固定点 平移后的屏幕座标
        let fix_screen = [fixed[0] + offset[0], fixed[1] + offset[1]];
        // 2. 屏幕点到固定点连线 到 已经旋转的弧度 间的弧度
        let screen_p_oldrad_rad = calcTwoLineRad(rad, [fix_screen[0], fix_screen[1]], screenP);
        let distance = calcDistance(fix_screen, screenP); // 斜边长
        // 计算邻边的长度
        const adjacent = distance * Math.cos(screen_p_oldrad_rad);
        // 计算对边的长度
        const opposite = distance * Math.sin(screen_p_oldrad_rad);

        calcDistance([fix_screen_x, fix_screen_y], )
        let px = screenP[0] - (fixed[0] + offset[0]),
            py = screenP[1] - (fixed[1] + offset[1]);
        logg += `1(${px}, ${py})`
        // 2. 根据座标轴旋转角度， 逆转座标点的斜率, chatgpt写的
        px = px * Math.cos(rad) - py * Math.sin(rad);
        py = px * Math.sin(rad) + py * Math.cos(rad);
        logg += `2(${px}, ${py})`
        // 3. 缩放 得到真实点座标
        px /= scale;
        py /= scale;
        logg += `3(${px}, ${py})`
        // 4. 加上固定点
        px += fixed[0];
        py += fixed[1];
        logg += `4(${px}, ${py})`
        // 赋值
        p[0] = px;
        p[1] = py;
    }

    function convertOffset(p, canvasP, screenP, offset) {
        p[0] = offset[0];
        p[1] = offset[1];
        // p[0] = (canvasP[0] - screenP[0]) - offset[0];
        // p[1] = (canvasP[1] - screenP[1]) - offset[1];
    }

    function getTouches(p, touches) {
        p[0][0] = touches[0].clientX;
        p[0][1] = touches[0].clientY;
        p[1][0] = touches[1].clientX;
        p[1][1] = touches[1].clientY;
    }

})()
