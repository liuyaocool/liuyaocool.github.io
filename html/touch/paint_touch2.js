(function () {

    let start_p = [], // [[x, y], ...]
        start_rad = NaN, // 起始线弧度 2个点时有效
        start_distance = 0, // 距离 2个点时有效
        start_middle = [], // 中点 2个点时有效
        canvas_fixed = [], // 计算 canvas变换的固定点 座标
        offsetX = 0, offsetY = 0,
        // end 不能检测到是几个触摸点 这里要自己保存
        pre = {rad: 0, scale: 1},
        run = {rad: 0, scale: 1}
    ;

    window.touchstart2 = function(e) {
        // 这里要new对象 因为赋值是共用同一份内存
        run = {rad: 0, scale: 1};
        start_p = getTouches(e.touches);
        start_distance = calcDistance(start_p[0], start_p[1]); // ok
        start_middle = calcMiddle(start_p[0], start_p[1]);
        start_rad = calcLineRad(start_p[0], start_p[1]);
        canvas_fixed = calcCanvasFixed(start_middle);
    }

    window.touchmove2 = function (e) {
        try {
        let p = getTouches(e.touches); // 点

        let scale = pre.scale * (run.scale = calcScale(start_distance, p[0], p[1])); // 缩放 ok

        let mid = calcMiddle(p[0], p[1]);        
        let centerX = (mid[0] + start_middle[0]) / 2;
        let centerY = (mid[1] + start_middle[1]) / 2;


        offsetX += centerX;
        offsetY += centerY;

        document.getElementById('touchAxis2').innerText = `move2 --> center(${centerX.toFixed(0)}, ${centerY.toFixed(0)}) offset(${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})`;
            // `(${p[0][0].toFixed(0)},${p[0][1].toFixed(0)}) / (${p[1][0].toFixed(0)},${p[1][1].toFixed(0)}) => ${calcScale(start_distance, p[0], p[1]).toFixed(0)}`;

        touch2MoveCall(
            start_canvas_center[0],
            start_canvas_center[1],
            pre.rad + (run.rad = calcTwoLineRad(start_rad, p[0], p[1])), // 弧度ok
            scale,
            0, 0
            // offsetX += centerX,
            // offsetY += centerY,
        );
        } catch(e) {
            document.getElementById('touchAxis').innerText = e;
        }
    };

    window.touchend2 = function(e) {
        pre.rad += run.rad;
        pre.scale += run.scale;
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

    function calcMiddle(p1, p2) {
        return [(p2[0] + p1[0]) / 2, (p2[1] + p1[1]) / 2];
    }

    function calcCanvasFixed(screenPoint) {
        let fixed = [];
        

        return fixed;
    }

    function getTouches(touches) {
        let p = [];
        for (let i = 0; i < touches.length; i++) {
            p.push([touches[i].clientX, touches[i].clientY]);
        }
        return p;
    }

})()