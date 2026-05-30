$(function () {
    var content = $("#content").val();
    if (content == "") {
        content = "baidu.com";
        $("#imgcode").JsBarcode(content);
    }
});

function gen_code() {
    var content = $("#content").val();
    if (content == "") {
        JsonsMessageBox($("#content"), "请输入条形码内容");
    } else {
        $("#imgcode").JsBarcode(content);
    }
}

$("#btnresult").click(function () {
    gen_code();
});

function empty() {
    $("#content").val("");
    $('#imgcode').attr("src", "");
}
