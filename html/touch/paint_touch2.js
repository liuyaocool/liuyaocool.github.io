(function () {

    const start = {
            p: [[0, 0], [0, 0]],
            rad: 0, // 起始线弧度
            distance: 0, // 距离
            touch_middle: [0, 0], // 屏幕中点
        },
        // 开始变换数据： 弧度 缩放 canvas偏移 canvas变换固定点
        pre = {rad: 0, scale: 1, offset: [0, 0], fixed: [0, 0]},
        run = {rad: 0, scale: 1, offset: [0, 0]},
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
        convertFixed(pre.fixed, start.touch_middle, pre.scale, pre.rad, pre.offset);
        // 2. 转换原canvas点到新canvas点
        convertOffset(pre.offset);
    }

    window.touchmove2 = function (e) {
        try {
        getTouches(tmp.p, e.touches); // 点

        let scale = pre.scale * (run.scale = calcScale(start.distance, tmp.p[0], tmp.p[1])); // 缩放 ok
        let rad = pre.rad + (run.rad = calcTwoLineRad(start.rad, tmp.p[0], tmp.p[1])); // 角度

        calcMiddle(tmp.touch_middle, tmp.p[0], tmp.p[1]);
        let offsetX = pre.offset[0] + (run.offset[0] = (tmp.touch_middle[0] + start.touch_middle[0]) / 2 / scale);
        let offsetY = pre.offset[1] + (run.offset[1] = (tmp.touch_middle[1] + start.touch_middle[1]) / 2 / scale);

        document.getElementById('touchAxis2').innerText = `move2:
        offset(${run.offset[0].toFixed(0)}, ${run.offset[1].toFixed(0)})
        fixed(${pre.fixed[0].toFixed(2)}, ${pre.fixed[1].toFixed(2)})
        `;

        touch2MoveCall(pre.fixed[0], pre.fixed[1], rad, scale, offsetX, offsetY);
        } catch(ex) {
            showTouchAxis(e, `${ex.message}\n${ex.stack}`);
        }
    };

    window.touchend2 = function(e) {
        pre.rad += run.rad;
        pre.scale *= run.scale;
    };

    function calcLineRad(p1, p2) {
        // y与坐标轴方向相反 故取反
        var x = p2[0] - p1[0], y = p1[1] - p2[1];
        // 使用反三角函数计算角度（以弧度表示）
        var angle_radian = Math.atan2(y, x);
        return angle_radian < 0 ? angle_radian + 2 * Math.PI : angle_radian;
    }

    // 计算两条线段的弧度
    function calcTwoLineRad(rad, p1, p2) {
        // 计算两条线段的夹角（弧度） ?? 前 - 后
        return rad - calcLineRad(p1, p2);
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

    function convertFixed(p, screenP, scale, rad, offset) {
        p[0] = screenP[0];
        p[1] = screenP[1];
        // p[0] = ;
        // p[1] = ;
    }

    function convertOffset(p, screenP, scale, rad, offset) {

    }

    function getTouches(p, touches) {
        p[0][0] = touches[0].clientX;
        p[0][1] = touches[0].clientY;
        p[1][0] = touches[1].clientX;
        p[1][1] = touches[1].clientY;
    }

})()