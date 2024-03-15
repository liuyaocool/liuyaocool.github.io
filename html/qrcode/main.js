
document.getElementById('result').onpaste = function(ev) {
    let it = ev.clipboardData.items;
    if (it.length < 1 || (it = it[0]).kind != 'file' || !it.type.match(/^image\//i)) {
        return;
    }
    analyzeLocal(it.getAsFile());
}

function analyzeChoose() {
    fileChooser(null, file => analyzeLocal(file));
}

function analyzeLocal(file) {
    document.getElementById('result').value = '解析中。。。';
    analyze(file, text => {
        document.getElementById('result').value = text
    }, path => document.getElementById('uploadPic').src = path);
}

const qrcode = new QRCode(document.getElementById("qrcode"), {
    width: 300,
    height: 300,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
}); 

function generate() {
    qrcode.makeCode(document.getElementById('url').value);
}

function analyze(file, getResFunc, getPathFunc) {
    if (!file || !isFunc(getResFunc)) return;
    var fr = new FileReader();
    fr.onload = function (ev) {
        let image = new Image();
        image.onload = function (ev1) {
            let cvs = document.createElement('canvas'),
                ctx = cvs.getContext('2d'),
                w = image.width, h = image.height,
                text;
            cvs.width = w;
            cvs.height = h;
            ctx.drawImage(image, 0, 0);
            text = jsQR(ctx.getImageData(0, 0, w, h).data, w, h);
            if(text) {
                getResFunc(text.data)
                return;
            };
            window.qrCli.decode(ev.target.result).then(function (result) {
                getResFunc(result[0]);
            }).catch(e => {
                console.error(e)
                getResFunc(e);
            });
        }
        let src = (image.src = ev.target.result);
        if (isFunc(getPathFunc)) getPathFunc(src);
        // Jimp.read(ev.target.result).then(img => {
        //     console.log(img);
        //     console.log(jsQR(img.bitmap.data, img.bitmap.width, img.bitmap.height));
        // });
    };        
    fr.readAsDataURL(file);
}
