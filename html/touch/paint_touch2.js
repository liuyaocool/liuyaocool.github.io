(function () {

    const start = {
            p: [[0, 0], [0, 0]],
            rad: 0, // 起始线弧度
            distance: 0, // 距离
            touch_middle: [0, 0], // 屏幕中点
        },
        // 初始变换数据： 弧度 缩放 canvas偏移 canvas变换固定点
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
        try {
        // 2. 转换原canvas点到新canvas点
        convertOffset(run.offset, start.touch_middle, run.fixed);

        document.getElementById('touchAxis2').innerText = `start2: ${window.innerWidth} ${window.innerHeight} rad: ${radToAngle(pre.rad)}
        screen: ${start.touch_middle[0]}px ${start.touch_middle[1]}px
        run fixed: ${run.fixed[0]}, ${run.fixed[1]}
        `;
        // test
        document.getElementById('point').style.left = `${start.touch_middle[0]}px`;
        document.getElementById('point').style.top = `${start.touch_middle[1]}px`;

        ctx.beginPath();
        ctx.fillStyle = '#00FF00';
        // 绘制一个圆形路径
        ctx.arc(run.fixed[0], run.fixed[1], 7, 0, Math.PI * 2);
        // 填充路径
        ctx.fill();
        ctx.closePath();

        } catch(e) {
            document.getElementById('touchAxis2').innerText = `start2 error: ${e.message} ${e.stack}`;            
        }
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



        document.getElementById('touchAxis3').innerText = `move2: scale=${scale.toFixed(2)} rad=${rad.toFixed(2)} angle=${radToAngle(rad).toFixed(2)}`;
        // document.getElementById('touchAxis2').innerText = `move2: scale=${scale}
        // logg: ${logg}
        // offset(${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})
        // run offset(${run.offset[0].toFixed(0)}, ${run.offset[1].toFixed(0)})
        // pre fixed(${pre.fixed[0].toFixed(2)}, ${pre.fixed[1].toFixed(2)})
        // run fixed(${run.fixed[0].toFixed(2)}, ${run.fixed[1].toFixed(2)})
        // tmp mid(${tmp.touch_middle[0].toFixed(0)}, ${tmp.touch_middle[1].toFixed(0)})
        // `;

        touch2MoveCall(run.fixed[0], run.fixed[1], rad, scale, offsetX, offsetY);
        } catch(ex) {
            showTouchAxis(e, `${ex.message}\n${ex.stack}`);
        }
    };

    window.touchend2 = function(e) {
        pre.rad += run.rad;
        pre.scale *= run.scale;
        // pre.offset[0] = run.offset[0];
        // pre.offset[1] = run.offset[1];
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

    // 将弧度转换为角度
    function radToAngle(rad) {
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

    // 转换: 屏幕点 -> 原始画布点
    function convertFixed(p, fixed, screenP, scale, rad, offset) {
        // 1. 新固定点 逆偏移
        p[0] = screenP[0] - offset[0];
        p[1] = screenP[1] - offset[1];
        // 2. 新固定点 逆缩放, 且旧固定点平移到原点(方便步骤3)
        p[0] = (p[0] - fixed[0]) / scale;
        p[1] = (p[1] - fixed[1]) / scale;
        // 3. 新固定点 逆旋转
        // 3.1 参数准备
        let rcos = Math.cos(rad), rsin = Math.sin(rad),
            [x, y] = [p[0], p[1]];// 后边第一行会改变p[0]的值 这里先保存
        // 3.2 计算旋转后的坐标, +fixed(旧固定点复位)
        p[0] = x * rcos - y * rsin + fixed[0];
        p[1] = x * rsin + y * rcos + fixed[1];
    }

    function convertOffset(p, screenP, runFixed) {
        // 当前屏幕点的座标 - 当前屏幕点在原始屏幕(即 画布)座标极为偏移
        p[0] = screenP[0] - runFixed[0];
        p[1] = screenP[1] - runFixed[1];
    }

    function getTouches(p, touches) {
        p[0][0] = touches[0].clientX;
        p[0][1] = -touches[0].clientY;
        p[1][0] = touches[1].clientX;
        p[1][1] = -touches[1].clientY;
    }

})()
