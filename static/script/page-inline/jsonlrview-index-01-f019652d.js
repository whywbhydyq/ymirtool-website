setJS(["/static/script/json/message.js","/static/script/json/jsonjs.js","/static/script/json/jquery.xml2json.js","/static/script/json/jquery.json2xml.js","/static/script/json/json2.js","/static/script/json/jsonlint.js","/static/script/json/jsonsrc.js"], function () {
  window.Empty = function Empty() {
    var content = document.getElementById("content");
    if (content) { content.value = ""; }
    var canvas = document.getElementById("Canvas");
    if (canvas) { canvas.textContent = ""; }
    if (content && typeof content.select === "function") { content.select(); }
  };
});
