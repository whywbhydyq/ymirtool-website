setJS(["/static/script/json/cjson.js","/static/script/json/sliver.js"], function () {
  window.Empty = function Empty() {
    var content = document.getElementById("content");
    if (content) { content.value = ""; }
    var canvas = document.getElementById("Canvas");
    if (canvas) { canvas.textContent = ""; }
    if (content && typeof content.select === "function") { content.select(); }
  };
});
