(function() {
    const randInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function germ(e, offsetX, offsetY) {
        let mouseX, mouseY;
        let event = e;
        if (!e) {
            event = window.event;
            mouseX = window.innerWidth/2;
            mouseY = window.innerHeight/2;
        }
        if (event && (event.pageX || event.pageY)) {
            mouseX = event.pageX;
            mouseY = event.pageY;
        }
        else if (event && (event.clientX || event.clientY))    {
            mouseX = event.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
            mouseY = event.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
        }

        mouseX += offsetX || 0;
        mouseY += offsetY || 0;

        console.log(`${mouseX}/${window.pageXOffset} : ${mouseY}/${window.pageYOffset }`);

        germAdd(mouseX, mouseY);
    }

    window.germAdd = function(mouseX, mouseY) {
        let pp = '';
        for (let i=0; i<randInt(1,3); i++) {
            let x = 50;
            let y = 55;
            let w = randInt(5, 15);
            let h = randInt(2, 10);
            let d1 = `M ${x} ${y} q ${randInt(w/10, w/1.1)} ${h} ${w} 0`;
            let d2 = `M ${x} ${y + randInt(0,h)} q ${randInt(w/10, w/1.1)} -${h} ${w} 0`;
            let rot = randInt(0,360);
            let fadeOut = randInt(1500,2500);
            let sw = randInt(50, 200)/100;
            let p = `<g transform="rotate(${randInt(0,360)} 50 50)">
            <path d="${d1}" stroke="rgb(0, ${randInt(130, 255)}, ${randInt(0, 150)})" stroke-width="${sw}" fill="none" stroke-linecap="round" transform="rotate(${rot} ${x} ${y + 5})">
                <animate attributeName="d" values="${d1}; ${d2}; ${d1}" dur="${randInt(600,1500)}ms" begin="${randInt(-1500,-600)}ms" repeatCount="indefinite" keyTimes="0;${randInt(25, 75)/100};1" keySplines="${randInt(0,100)/100} ${randInt(0,100)/100} ${randInt(0,100)/100} ${randInt(0,100)/100}; ${randInt(0,100)/100} ${randInt(0,100)/100} ${randInt(0,100)/100} ${randInt(0,100)/100}" calcMode="spline" />
                <animateTransform attributeName="transform" attributeType="XML" type="rotate" values="${rot} ${x} ${y}; ${rot} ${x} ${y + randInt(10,25)}" dur="${fadeOut}ms" begin="0s" fill="freeze" repeatCount="none" />
                <animate attributeName="stroke-width" values="${sw}; 0" dur="${fadeOut}ms" begin="0s" fill="freeze" repeatCount="none" keyTimes="0;1" keySplines="0.75 0 0.75 0" calcMode="spline" />
                            </g>`;
            pp += p;
        }
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("style", `pointer-events: none;width: 100%; height: 100%; position: fixed; height: 100px; width: 100px; transform: translate(-50%,-50%); left: ${mouseX}px; top: ${mouseY}px; z-index: 99999`);
        svg.innerHTML = pp;
        document.body.appendChild(svg);
        setTimeout(() => {svg?.remove();}, 2500);
    }

    // document.addEventListener("mousemove", (event) => {germ(event)});
    document.addEventListener("touchmove", (event) => germ(event));
    document.addEventListener("pointermove", (e) => germAdd(e.clientX, e.clientY));
})()