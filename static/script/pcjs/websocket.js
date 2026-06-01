function formatDate(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + (month = month < 10 ? ("0" + month) : month) + "-" + (date = date < 10 ? ("0" + date) : date) + " " + (hour = hour < 10 ? ("0" + hour) : hour) + ":" + (minute = minute < 10 ? ("0" + minute) : minute) + ":" + (second = second < 10 ? ("0" + second) : second);
}

var output;
var websocket;

function init() {
    output = document.getElementById("output");
}

function addsocket() {
    var wsaddr = $("#wsaddr").val();
    if (wsaddr == '') {
        pcjson_com_msg($("#wsaddr"), "请填写Websocket测试地址");
        return false;
    }
    StartWebSocket(wsaddr);
}

function closesocket() {
    if (websocket) {
        websocket.close();
    }
    else {
        writeStatus('error', 'Websocket未连接，无需进行断开操作！');
    }
}

function StartWebSocket(wsUri) {
    websocket = new WebSocket(wsUri);
    websocket.addEventListener('open', onOpen);
    websocket.addEventListener('close', onClose);
    websocket.addEventListener('message', onMessage);
    websocket.addEventListener('error', onError);
}

function onOpen(evt) {
    writeStatus('error', '连接成功，现在你可以发送信息进行测试了！');
}
function onClose(evt) {
    writeStatus('error', 'Websocket连接已断开！');
}
function onMessage(evt) {
    writeMessage('blue', '服务端回应 ' + formatDate(new Date()), evt.data);
}
function onError(evt) {
    writeStatus('error', '发生错误: ' + (evt && evt.data ? evt.data : '连接失败'));
}
function SendMessage() {
    var message = $("#message").val();
    if (message == '') {
        pcjson_com_msg($("#message"), "请先填写要测试发送的消息");
        $("#message").focus();
        return false;
    }
    if (typeof websocket === "undefined") {
        pcjson_com_msg($("#message"), "Websocket还没有连接或者连接失败，请进行检测");
        return false;
    }
    if (websocket.readyState == 3) {
        pcjson_com_msg($("#message"), "Websocket已经关闭，请重新连接");
        return false;
    }
    $("#message").val('');
    writeMessage('green', '你发送的信息 ' + formatDate(new Date()), message);
    websocket.send(message);
}

function appendOutput(entry) {
    var target = output || document.getElementById('output');
    if (!target) return;
    var doScroll = target.scrollTop == target.scrollHeight - target.clientHeight;
    target.appendChild(entry);
    if (doScroll) {
        target.scrollTop = target.scrollHeight - target.clientHeight;
    }
}

function writeStatus(type, message) {
    var div = document.createElement('div');
    var span = document.createElement('span');
    span.style.color = type === 'error' ? 'red' : type;
    span.textContent = message;
    div.appendChild(span);
    appendOutput(div);
}

function writeMessage(color, title, message) {
    var div = document.createElement('div');
    var titleSpan = document.createElement('span');
    titleSpan.style.color = color;
    titleSpan.textContent = title;
    div.appendChild(titleSpan);
    div.appendChild(document.createElement('br'));
    var bodySpan = document.createElement('span');
    bodySpan.textContent = String(message == null ? '' : message);
    div.appendChild(bodySpan);
    appendOutput(div);
}

function writeToScreen(message) {
    writeStatus('black', String(message == null ? '' : message));
}

function en(event) {
    var evt = event || window.event;
    if (evt && evt.keyCode == 13) {
        SendMessage();
    }
}

$(function () {
    init();
    $("#demo1").click(function () {
        var src = (document.location.protocol == "Net:") ? "ws://echo.websocket.org" : "wss://echo.websocket.org";
        var wsaddr = document.getElementById('wsaddr');
        if (wsaddr) wsaddr.value = src;
    });
});

function Empty() {
    $("#wsaddr").val("");
    $("#message").val("");
    var target = document.getElementById('output');
    if (target) target.textContent = '';
}
