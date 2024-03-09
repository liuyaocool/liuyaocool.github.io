let keyWidth = 50;
let keyboards = [
    ['Esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Delete'],
    ['~','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
    ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','|'],
    ['CapsLock','A','S','D','F','G','H','J','K','L',';','"','Enter'],
    ['Shift','Z','X','C','V','B','N','M','《','》','？','Shift'],
    ['Ctrl','Win','Alt','Space','Alt','PtrSc','Ctrl',]
];
let keyCodes = [
    ['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Delete'],
    ['Backquote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','Backspace'],
    ['Tab','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'],
    ['CapsLock','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Enter'],
    ['ShiftLeft','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','ShiftRight'],
    ['ControlLeft','MetaLeft','AltLeft','Space','AltRight','PrintScreen','ControlRight',]
];
let keyWidthMap = {
    'Escape': keyWidth * 1.3,
    'Tab': keyWidth * 1.4,
    'CapsLock': keyWidth * 1.7,
    'ShiftLeft': keyWidth * 2.3,
    'Delete': keyWidth * 1.1,
    'Backspace': keyWidth * 1.4,
    'Enter': keyWidth * 1.82,
    'ShiftRight': keyWidth * 2.34,
    'Space': keyWidth * 9.24,
}

let keyLineHtmls = [];
let k, kw, id, keyLine;
for (let i = 0; i < keyboards.length; i++) {
    keyLine = '';
    for (let j = 0; j < keyboards[i].length; j++) {
        id = keyCodes[i][j];
        k = keyboards[i][j];
        kw = keyWidthMap[id] ? keyWidthMap[id] : keyWidth;
        keyLine += `<key id="${id}" style="width:${kw}px;height:${keyWidth}px; 
                        margin:${0.04*keyWidth}px;line-height:${keyWidth}px;">${k}</key>`;
    }
    keyLineHtmls.push(keyLine);
}
document.body.innerHTML += keyLineHtmls.join('<br>');

document.onkeydown = function (ev) {
    // console.log(ev);
    console.log(ev.code);
    let style = document.getElementById(ev.code);
    if (!style) return;
    style = style.style;
    if (style.backgroundColor == 'green') {
        style.backgroundColor = 'lightgreen';
    } else {
        style.backgroundColor = 'green';
    }
}

document.onkeyup = function (ev) {
    // console.log(ev);
    console.log(ev.code);
    let ele = document.getElementById(ev.code);
    if (!ele) return;
    ele.style.backgroundColor = '';
}