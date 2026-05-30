var line_color = '#000';
var line_size = 3;
var childrens = [];
var c = document.querySelector('#canvas');
var ctx = c ? c.getContext('2d') : null;
var cs = null;
var isDraw = false;
var xx = 0;
var yy = 0;
var mouseDot;

function ymirHuabanReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

function ymirHuabanNumber(value, fallback) {
    var parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function ymirHuabanInitControls() {
    document.querySelectorAll('.tool .color div').forEach(function (node) {
        node.addEventListener('click', function () {
            document.querySelectorAll('.tool .color div').forEach(function (item) { item.classList.remove('active'); });
            node.classList.add('active');
            line_color = node.getAttribute('data-color') || line_color;
            if (mouseDot) mouseDot.fill = line_color;
        });
    });

    document.querySelectorAll('.tool .size div').forEach(function (node) {
        node.addEventListener('click', function () {
            document.querySelectorAll('.tool .size div').forEach(function (item) { item.classList.remove('active'); });
            node.classList.add('active');
            line_size = ymirHuabanNumber(node.getAttribute('data-size'), line_size);
            if (mouseDot) mouseDot.radius = Math.max(line_size / 2, 3);
        });
    });
}

function clearAll() {
    if (!cs) return;
    cs.reset();
    cs.mouse.hide();
    mouseDot = cs.display.arc({
        x: -100,
        y: -100,
        radius: Math.max(line_size / 2, 3),
        start: 0,
        end: 360,
        fill: line_color,
        shadow: '0 0 5px #333'
    });
    cs.addChild(mouseDot);
}

function add_child(d) {
    childrens.push(d);
}

function drawBegin(x, y) {
    if (!cs) return;
    isDraw = true;
    xx = x;
    yy = y;
    var dot = cs.display.arc({
        x: x,
        y: y,
        radius: line_size / 2,
        start: 0,
        end: 360,
        fill: line_color
    });
    cs.addChild(dot);
    add_child(dot);
}

function drawMove(x, y) {
    if (!cs || !mouseDot) return;
    if (isDraw) {
        var line = cs.display.line({
            start: { x: xx, y: yy },
            end: { x: x, y: y },
            stroke: '' + line_size + 'px ' + line_color,
            cap: 'round'
        });
        cs.addChild(line);
        add_child(line);
        xx = x;
        yy = y;
    } else {
        mouseDot.moveTo(x, y);
        cs.addChild(mouseDot);
        cs.draw.redraw();
    }
}

function re_draw() {
    if (!cs) return;
    var child = childrens.pop();
    if (child) {
        cs.removeChild(child);
        cs.draw.redraw();
    }
}

function saveImageInfo() {
    var mycanvas = document.getElementById('canvas');
    if (!mycanvas) return;
    var image = mycanvas.toDataURL('image/png');
    var w = window.open('about:blank', 'image_from_atool');
    if (!w || !w.document) return;
    w.document.title = 'image_from_atool';
    if (w.document.body) {
        w.document.body.textContent = '';
        var img = w.document.createElement('img');
        img.src = image;
        img.alt = 'image_from_atool';
        w.document.body.appendChild(img);
    }
}

ymirHuabanReady(function () {
    if (!c || !window.oCanvas) return;
    c.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    cs = oCanvas.create({
        canvas: '#canvas',
        background: '#fff',
        fps: 30,
        disableScrolling: true
    });
    clearAll();
    cs.bind('mousedown', function () { drawBegin(cs.mouse.x, cs.mouse.y); })
        .bind('touchstart tap', function () { drawBegin(cs.touch.x, cs.touch.y); })
        .bind('mouseup touchend', function () { isDraw = false; })
        .bind('mousemove', function () { drawMove(cs.mouse.x, cs.mouse.y); })
        .bind('touchmove', function () { drawMove(cs.touch.x, cs.touch.y); });
    ymirHuabanInitControls();
});
