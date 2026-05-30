//Native 转换 Unicode
    function Native2Unicode() {var a_s=$("#content").val();var out='';if ('' == a_s) { alert('请输入Native字符串'); return; }for (var i=0; i<$("#content").val().length; i++)out = out + '&#' + a_s.charCodeAt(i) + ';';hightout(out);}
    //Unicode 转换 Native
    function Unicode2Native() { var a_s=$("#content").val();var code = a_s.match(/&#(\d+);/g);var out='';if (code == null) { alert('请输入正确的Unicode代码！'); $("#content").focus();return; }for (var i=0; i<code.length; i++)out = out +  String.fromCharCode(code[i].replace(/[&#;]/g, ''));hightout(out);}
