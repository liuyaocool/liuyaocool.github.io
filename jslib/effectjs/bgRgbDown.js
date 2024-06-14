(function() {
    let bgid = 'adjkfhj984fhndbgiug8tguy';
    let bgc = document.createElement('canvas');
    bgc.id = bgid;
    bgc.style.position = 'fixed';
    bgc.style.top = '0px';
    bgc.style.left = '0px';
    bgc.style['z-index'] = -1;
    document.body.appendChild(bgc);
    let bgCanvas = document.getElementById(bgid),
        ctx = bgCanvas.getContext('2d'),
        accelleration = .05,
        lineAlpha = .02,
        range = 25,
        repaintColor = 'rgba(0, 0, 0, .04)',
        w, h, total, size, occupation, colors, dots, dotsVel;

    function anmiInit() {
        w = bgCanvas.width = window.innerWidth,
        h = bgCanvas.height = window.innerHeight,
        //parameters
        total = (w / 8) | 0,
        //afterinitial calculations
        size = w / total,
        occupation = w / total,
        colors = [],
        dots = [],
        dotsVel = [];
        //setting the colors' hue
        //and y level for all dots
        var portion = 360 / total;
        for (var i = 0; i < total; ++i) {
            colors[i] = portion * i;

            dots[i] = h;
            dotsVel[i] = 10;
        }
    }
    

    function anim() {
        window.requestAnimationFrame(anim);

        ctx.fillStyle = repaintColor;
        ctx.fillRect(0, 0, w, h);

        for (var i = 0; i < total; ++i) {
            var currentY = dots[i] - 1;
            dots[i] += dotsVel[i] += accelleration;

            for (var j = i + 1; j < i + range && j < total; ++j) {
                if (Math.abs(dots[i] - dots[j]) <= range * size) {
                    ctx.strokeStyle = 'hsla(hue, 80%, 50%, alp)'
                        .replace('hue', (colors[i] + colors[j] + 360) / 2 - 180)
                        .replace('alp', lineAlpha);
                    ctx.beginPath();
                    ctx.moveTo(i * occupation, dots[i]);
                    ctx.lineTo(j * occupation, dots[j]);
                    ctx.stroke();
                }
            }

            if (dots[i] > h && Math.random() < .01) {
                dots[i] = dotsVel[i] = 0;
            }
        }
    }

    window.addEventListener('resize', function(event) {
        anmiInit();
    });

    anmiInit();
    anim();
})()
