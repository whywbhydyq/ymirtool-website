setJS(["/static/script/codemirror/codemirror.min.js","/static/script/codemirror/formatting.js","/static/script/codemirror/css.js","/static/script/codemirror/placeholder.js","/static/script/codemirror/fullscreen.js","/static/script/codemirror/clike.js","/static/script/codemirror/javascript.js","/static/script/codemirror/xml.js","/static/script/codemirror/python.js","/static/script/codemirror/htmlmixed.js","/static/script/codemirror/beautify.js","/static/script/codemirror/beautify-css.js","/static/script/codemirror/beautify-html.js","/static/script/codemirror/allformat_html.js"], function () {
  $(function () {
    var code = document.getElementById("code");
    if (!code || !window.CodeMirror || !window.the) return;
    window.the.editor = CodeMirror.fromTextArea(code, {
      lineNumbers: true,
      mode: "text/javascript"
    });
  });
});
