(function (canvas, getMoveInfoFunc) {

    let start_p = [], // [[x, y], ...]
        start_rad = NaN, // 起始线弧度 2个点时有效
        start_distance = 0, // 距离 2个点时有效
        start_middle = [], // 中点 2个点时有效
        offsetX = 0, offsetY = 0,
        // end 不能检测到是几个触摸点 这里要自己保存
        pre = {rad: 0, scale: 1},
        run = {rad: 0, scale: 1},
        end = {rad: 0, scale: 1}
    ;

    addTouchListener(canvas, 'start', 2, function(e) {
        // 这里要new对象 因为赋值是共用同一份内存
        pre = {rad: end.rad, scale: end.scale};
        run = {rad: 0, scale: 1};
        start_p = getTouches(e.touches);
        start_distance = calcDistance(start_p[0], start_p[1]); // ok
        start_middle = calcMiddle(start_p[0], start_p[1]);
        start_rad = calcLineRad(start_p[0], start_p[1]);
    });
    
    addTouchListener(canvas, 'move', 2, function(e) {
        showTouchAxis(e.touches);
        try {
        let p = getTouches(e.touches); // 点
        let mid = calcMiddle(p[0], p[1]);
        // todo 待计算
        let centerX = (mid[0] + start_middle[0]) / 2;
        let centerY = (mid[1] + start_middle[1]) / 2;

        offsetX += centerX;
        offsetY += centerY;

        document.getElementById('touchAxis2').innerText = `move2 --> center(${centerX.toFixed(0)}, ${centerY.toFixed(0)}) offset(${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})`;
            // `(${p[0][0].toFixed(0)},${p[0][1].toFixed(0)}) / (${p[1][0].toFixed(0)},${p[1][1].toFixed(0)}) => ${calcScale(start_distance, p[0], p[1]).toFixed(0)}`;

        getMoveInfoFunc(
            window.innerWidth/2,
            window.innerHeight/2,
            end.rad = pre.rad + (run.rad = calcTwoLineRad(start_rad, p[0], p[1])), // 弧度
            end.scale = pre.scale * (run.scale = calcScale(start_distance, p[0], p[1])), // 缩放 ok
            0, 0
            // offsetX += centerX,
            // offsetY += centerY,
        );
        } catch(e) {
            document.getElementById('touchAxis').innerText = e;
        }
    });

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

    function getTouches(touches) {
        let p = [];
        for (let i = 0; i < touches.length; i++) {
            p.push([touches[i].clientX, touches[i].clientY]);
        }
        return p;
    }

})(canvas, touch2MoveCall)