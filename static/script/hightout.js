

let link = document.createElement('link');
link.setAttribute('type','text/css');
link.setAttribute('rel','stylesheet');
link.setAttribute('href','/static/script/hljs/styles/monokai.css');
document.body.appendChild(link);

let script = document.createElement('script');
script.setAttribute('src','/static/script/hljs/highlight.pack.js');
script.setAttribute('type', 'text/javascript');
document.body.appendChild(script);


$(function(){
	setTimeout(function (){
		hljs.initHighlightingOnLoad();
	},1000)

});
function is_hide(attr){
	attr = (typeof(attr) == "undefined" || title == '') ? "pre" : attr;
	$(attr).hide();
}
$("pre").hide();
function hightout(Bd1) {
    var pre = document.querySelector('pre');
    var result = document.getElementById('result');
    if (pre) { pre.style.display = ''; }
    if (result) {
        result.textContent = Bd1 == null ? '' : String(Bd1);
    }
}
function is_show(attr){
	attr = (typeof(attr) == "undefined" || title == '') ? "pre" : attr;
	$(attr).show();
}
function ClearAll() {
    $("#content").val("");
    $("#content").select();
	$("#result").text('');
	$("pre").hide();
}
