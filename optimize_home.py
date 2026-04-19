import os

out = '.'
fp = os.path.join(out, 'index.html')

html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8"/>
    <meta name="robots" content="index, follow"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Ymir Tool - 150+免费在线工具箱 | JSON格式化/MD5/代码美化</title>
    <meta name="description" content="Ymir Tool免费在线工具箱，提供JSON格式化、MD5加密、Base64编解码、代码格式化、文本处理、单位换算等150+工具。无需安装，打开即用，数据浏览器本地处理保障隐私安全。"/>
    <meta name="keywords" content="在线工具,JSON格式化,MD5加密,Base64,代码格式化,开发者工具,文本处理,单位换算,编码转换"/>
    <link rel="canonical" href="https://ymirtool.com/"/>
    <meta property="og:title" content="Ymir Tool - 你的在线工具箱"/>
    <meta property="og:description" content="150+免费在线开发者工具，无需安装，打开即用"/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="https://ymirtool.com/"/>
    <meta property="og:site_name" content="Ymir Tool"/>
    <meta property="og:image" content="https://ymirtool.com/static/images/og.svg"/>
    <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
    <link rel="preconnect" href="https://cdn.staticfile.org" crossorigin/>
    <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin/>
    <link href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet"/>
    <link href="/static/style/font-fix.css" rel="stylesheet"/>
    <link href="/static/style/tool.css" rel="stylesheet"/>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1653188471819736" crossorigin="anonymous"></script>
    <link rel="preload" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/fonts/glyphicons-halflings-regular.woff2" as="font" type="font/woff2" crossorigin/>
    <meta name="baidu-site-verification" content="codeva-UksONlLJGB" />
    <script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"Ymir Tool","url":"https://ymirtool.com/","description":"免费在线工具箱，提供150+开发者工具","datePublished":"2026-01-01","dateModified":"2026-07-18"}
    </script>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="Ymir Tool - 150+免费在线工具箱"/>
    <meta name="twitter:description" content="JSON格式化、MD5加密、代码格式化等150+免费工具，无需安装，打开即用"/>
    <meta name="twitter:image" content="https://ymirtool.com/static/images/og.svg"/>
    <style>
    *{box-sizing:border-box}
    body{margin-top:50px;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif}
    .navbar{min-height:50px}
    .hero{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f3460 100%);color:#fff;padding:28px 0 22px;margin-top:-20px;text-align:center;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 30% 50%,rgba(59,130,246,0.12) 0%,transparent 50%);pointer-events:none}
    .hero h1{font-size:26px;font-weight:700;margin:0 0 8px;letter-spacing:.5px;position:relative}
    .hero h1 span{background:linear-gradient(90deg,#3b82f6,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .hero p.lead{font-size:14px;color:rgba(255,255,255,0.6);max-width:500px;margin:0 auto 14px;position:relative}
    .search-box{max-width:460px;margin:0 auto;position:relative}
    .search-box input{width:100%;padding:11px 18px 11px 42px;border:2px solid rgba(59,130,246,0.4);border-radius:10px;font-size:14px;background:rgba(255,255,255,0.08);color:#fff;outline:none;transition:all .25s;font-weight:500}
    .search-box input::placeholder{color:rgba(255,255,255,0.5)}
    .search-box input:focus{background:rgba(255,255,255,0.14);border-color:rgba(59,130,246,0.7);box-shadow:0 0 0 3px rgba(59,130,246,0.15)}
    .search-box .search-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.5);font-size:16px}
    .quick-section{padding:18px 0 8px}
    .quick-section .container{max-width:1100px}
    .quick-title{font-size:13px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-left:2px}
    .quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .quick-link{display:flex;align-items:center;justify-content:center;padding:10px 12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:600;color:#334155;text-decoration:none;transition:all .2s;min-height:40px}
    .quick-link:hover{background:#3b82f6;color:#fff;border-color:#3b82f6;transform:translateY(-1px);box-shadow:0 3px 10px rgba(59,130,246,0.2)}
    .cat-section{padding:10px 0 15px}
    .cat-section .container{max-width:1100px}
    .cat-card{background:#fff;border-radius:8px;padding:14px 16px 12px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04);border:1px solid #e8ecf1;border-left:3px solid #3b82f6;transition:all .2s}
    .cat-card:hover{box-shadow:0 2px 8px rgba(0,0,0,0.07)}
    .cat-header{display:flex;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9}
    .cat-dot{width:7px;height:7px;border-radius:50%;margin-right:8px;flex-shrink:0}
    .cat-header h3{margin:0;font-size:14px;font-weight:700;color:#1e293b}
    .cat-header .cat-count{margin-left:auto;font-size:11px;color:#94a3b8;font-weight:500}
    .cat-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:5px}
    .cat-links a{display:flex;align-items:center;justify-content:center;padding:6px 8px;background:#f8fafc;color:#334155;border-radius:6px;font-size:13px;text-decoration:none;transition:all .15s;border:1px solid #f1f5f9;font-weight:500;min-height:32px;text-align:center;line-height:1.3}
    .cat-links a:hover{background:#3b82f6;color:#fff;border-color:#3b82f6;transform:translateY(-1px);box-shadow:0 2px 8px rgba(59,130,246,0.2)}
    .cat-links a.hot{color:#dc2626;font-weight:700;border-color:#fecaca;background:#fef2f2}
    .cat-links a.hot:hover{background:#dc2626;color:#fff;border-color:#dc2626}
    .cat-links a.new{color:#16a34a;font-weight:700;border-color:#bbf7d0;background:#f0fdf4}
    .cat-links a.new:hover{background:#16a34a;color:#fff;border-color:#16a34a}
    .features{padding:20px 0;background:#f5f6fa;border-top:1px solid #e8ecf1}
    .features .container{max-width:1100px}
    .feat-item{text-align:center;padding:12px 10px}
    .feat-item .feat-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:20px}
    .feat-item h4{font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px}
    .feat-item p{font-size:12px;color:#64748b;line-height:1.5}
    .hide-link{display:none}
    @media(max-width:768px){
    .hero h1{font-size:20px}
    .hero p.lead{font-size:12px}
    .quick-grid{grid-template-columns:repeat(2,1fr)}
    .cat-links{grid-template-columns:repeat(3,1fr)}
    .cat-links a{font-size:11px;padding:5px 4px;min-height:28px}
    .cat-card{padding:10px 12px 8px}
    }
    </style>
</head>
<body>
<div class="navbar navbar-default navbar-static-top navbar-fixed-top">
    <div class="jz container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar"><span class="sr-only">Ymir Tool</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button>
            <a class="navbar-brand" href="/" title="Ymir Tool"><em class="logo_ico glyphicon glyphicon-wrench"></em> Ymir Tool</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse" role="navigation">
            <ul class="nav navbar-nav" id="top_menu">
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">JSON工具<span class="caret"></span></a><ul class="dropdown-menu ul-list"><li><a href="/json/">Json格式化</a></li><li><a href="/jsonudview/">Json格式化(上下)</a></li><li><a href="/jsonlrview/">Json格式化(左右)</a></li><li><a href="/jsonzip/">Json在线压缩转义</a></li><li role="separator" class="divider"></li><li><a href="/json2cs/">Json生成C#实体类</a></li><li><a href="/json2java/">Json生成Java实体类</a></li><li><a href="/json2go/">Json生成Go结构体</a></li><li><a href="/sql2java/">SQL转Java实体类</a></li><li><a href="/json2xml/">XML和Json在线互转</a></li><li><a href="/excel2json/">Excel/CSV转Json格式</a></li><li><a href="/json2excel/">Json转Excel/CSV格式</a></li><li><a href="/json2get/">JSON和GET参数互转</a></li><li><a href="/json2yaml/">JSON转YAML</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">格式化转换<span class="caret"></span></a><ul class="dropdown-menu ul-list"><li><a href="/formathtml/">HTML格式化/压缩</a></li><li><a href="/formatcss/">CSS格式化/压缩</a></li><li><a href="/formatjs/">JS格式化/压缩</a></li><li><a href="/endecodejs/">JS加密/解密</a></li><li><a href="/confundirjs/">JS代码混合加密</a></li><li><a href="/formatsql/">SQL压缩/格式化</a></li><li><a href="/formatphp/">PHP代码格式化</a></li><li><a href="/formatxml/">XML压缩/格式化</a></li><li role="separator" class="divider"></li><li><a href="/htmloutjs/">Html/JS互转</a></li><li><a href="/htmlescape/">Html转义工具</a></li><li><a href="/html2cj/">Html转C#/JSP</a></li><li><a href="/html2php/">Html转PHP代码</a></li><li><a href="/html2all/">Html转ASP/Perl</a></li><li><a href="/htmlfromcsv/">Excel转HTML表格</a></li><li><a href="/htmltable/">Html表格生成器</a></li><li><a href="/htmlmarkdown/">HTML/MarkDown互转</a></li><li role="separator" class="divider"></li><li><a href="/regex/">正则表达式测试</a></li><li><a href="/regexcode/">正则生成代码</a></li><li><a href="/formatfilter/">Html过滤工具</a></li><li><a href="/runjs/">运行Js/html/css</a></li><li><a href="/xpath/">Xpath工具</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">加密解密<span class="caret"></span></a><ul class="dropdown-menu ul-list"><li><a href="/md5/">MD5加密工具</a></li><li><a href="/base64/">Base64加密/解密</a></li><li><a href="/escape/">Escape加密/解密</a></li><li><a href="/deencrypt/">对称加密/解密</a></li><li><a href="/aesencrypt/">AES加密/解密</a></li><li><a href="/desencrypt/">DES加密/解密</a></li><li><a href="/shaencrypt/">SHA/SHA256加密</a></li><li><a href="/allencrypt/">散列/哈希加密大全</a></li><li><a href="/morse/">摩尔斯电码加解密</a></li><li role="separator" class="divider"></li><li><a href="/password/">密码生成器</a></li><li><a href="/uuid/">UUID在线生成</a></li><li><a href="/guid/">GUID在线生成</a></li><li><a href="/barcode/">条形码生成器</a></li><li><a href="/img2base64/">图片转Base64</a></li><li><a href="/unicode/">Unicode/ASCII转换</a></li><li><a href="/ascii/">ASCII编码/解码</a></li><li><a href="/urlencode/">URL编码/解码</a></li><li><a href="/keyboardcode/">KeyCode键盘按键码</a></li><li><a href="/keyboardtest/">键盘测试工具</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">文本数字<span class="caret"></span></a><ul class="dropdown-menu ul-list"><li><a href="/autoformat/">文章自动排版</a></li><li><a href="/jianfan/">简繁字体转换</a></li><li><a href="/pinyin/">汉字转为拼音</a></li><li><a href="/txtreplace/">文本内容替换</a></li><li><a href="/textdiff/">文本内容对比</a></li><li><a href="/txtcount/">在线统计字数</a></li><li><a href="/quchong/">内容去重工具</a></li><li><a href="/wenzitexiao/">文字特效工具</a></li><li><a href="/camelcase/">驼峰与下划线互转</a></li><li><a href="/quanbaojiao/">全角半角转换</a></li><li><a href="/enlower/">字母大小写转换</a></li><li><a href="/rmbdaxie/">人民币大写转换</a></li><li><a href="/random/">随机数生成器</a></li><li><a href="/unixtime/">Unix时间戳转换</a></li><li><a href="/hexconvert/">进制转换工具</a></li><li><a href="/hexrgb/">RGB颜色转换</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">网络<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="/websocket/">Websocket测试</a></li><li><a href="/browserinfo/">获取浏览器信息</a></li><li><a href="/dns/">公共DNS</a></li><li><a href="/alldns/">各地区公共DNS</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">站长<span class="caret"></span></a><ul class="dropdown-menu ul-list"><li><a href="/htaccess2nginx/">htaccess转nginx</a></li><li><a href="/shortcut/">生成桌面快捷方式</a></li><li><a href="/px2rem/">rem与px转换</a></li><li><a href="/createmeta/">生成网页Meta标签</a></li><li><a href="/refresh/">在线定时刷新网址</a></li><li><a href="/tiaoseban/">在线调色板</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">计算<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="/nianlvli/">利率计算器</a></li><li><a href="/subnetmask/">子网掩码计算器</a></li><li><a href="/calculator/">在线科学计算器</a></li><li><a href="/calcarea/">面积换算器</a></li><li><a href="/calclength/">长度换算器</a></li><li><a href="/calctemperature/">温度换算器</a></li></ul></li>
                <li class="dropdown"><a href="/" class="dropdown-toggle" data-toggle="dropdown">更多<span class="caret"></span></a><ul class="dropdown-menu"><li><a href="/tuya/">在线涂鸦画板</a></li><li><a href="/shizhong/">在线时钟</a></li><li><a href="/worldtime/">世界各地时间</a></li><li><a href="/capital/">世界各国首都查询</a></li><li><a href="/currency/">世界各地货币查询</a></li><li><a href="/areacode/">各国区号时差查询</a></li><li><a href="/tesufuhao/">特殊符号大全</a></li><li role="separator" class="divider"></li><li><a href="/useragent/">常用User-Agent</a></li><li><a href="/contenttype/">Content-Type对照表</a></li><li><a href="/pagecode/">HTTP状态码</a></li><li><a href="/asciicode/">ASCII对照表</a></li><li><a href="/ports/">常见端口大全</a></li><li><a href="/linuxcmd/">Linux常用命令大全</a></li></ul></li>
            </ul>
        </div>
    </div>
</div>

<div class="hero">
    <div class="container">
        <h1><span>Ymir Tool</span> · 你的在线工具箱</h1>
        <p class="lead">150+ 免费在线工具，无需安装，打开即用。数据在浏览器本地处理，安全放心。</p>
        <div class="search-box">
            <span class="search-icon glyphicon glyphicon-search"></span>
            <input type="text" id="toolSearch" placeholder="搜索工具，如：JSON、MD5、加密、格式化..." autocomplete="off"/>
        </div>
    </div>
</div>

<div class="quick-section">
    <div class="container">
        <div class="quick-title">常用工具</div>
        <div class="quick-grid">
            <a class="quick-link" href="/json/">JSON格式化</a>
            <a class="quick-link" href="/md5/">MD5加密</a>
            <a class="quick-link" href="/base64/">Base64编解码</a>
            <a class="quick-link" href="/formatjs/">JS格式化</a>
            <a class="quick-link" href="/urlencode/">URL编码</a>
            <a class="quick-link" href="/unixtime/">时间戳转换</a>
            <a class="quick-link" href="/regex/">正则测试</a>
            <a class="quick-link" href="/textdiff/">文本对比</a>
        </div>
    </div>
</div>

<div id="searchResult" class="container" style="max-width:1100px;display:none;padding:20px 0">
    <h3 style="margin-bottom:15px;font-size:16px;color:#1e293b">搜索结果</h3>
    <div class="cat-links" id="searchLinks"></div>
    <p id="noResult" style="display:none;color:#94a3b8;padding:20px 0;font-size:14px">未找到匹配的工具，换个关键词试试？</p>
</div>

<main>
<div class="cat-section" id="catSection">
    <div class="container">
        <div class="cat-card" style="border-left-color:#3b82f6">
            <div class="cat-header"><span class="cat-dot" style="background:#3b82f6"></span><h3>JSON 工具</h3><span class="cat-count">13 个</span></div>
            <div class="cat-links"><a href="/json/" class="hot">Json格式化</a><a href="/jsonudview/">Json格式化(上下)</a><a href="/jsonlrview/">Json格式化(左右)</a><a href="/jsonzip/">Json在线压缩转义</a><a href="/json2cs/">Json生成C#实体类</a><a href="/json2java/">Json生成Java实体类</a><a href="/json2go/">Json生成Go结构体</a><a href="/sql2java/">SQL转Java实体类</a><a href="/json2xml/">XML和Json互转</a><a href="/excel2json/">Excel/CSV转Json</a><a href="/json2excel/">Json转Excel/CSV</a><a href="/json2get/">JSON和GET参数互转</a><a href="/json2yaml/">JSON转YAML</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#ef4444">
            <div class="cat-header"><span class="cat-dot" style="background:#ef4444"></span><h3>格式化转换</h3><span class="cat-count">35 个</span></div>
            <div class="cat-links"><a href="/formathtml/" class="hot">HTML格式化/压缩</a><a href="/formatcss/" class="hot">CSS格式化/压缩</a><a href="/formatjs/" class="hot">JS格式化/压缩</a><a href="/endecodejs/">JS加密/解密</a><a href="/confundirjs/">JS代码混合加密</a><a href="/formatsql/">SQL压缩/格式化</a><a href="/formatphp/">PHP代码格式化</a><a href="/formatxml/">XML压缩/格式化</a><a href="/formatcs/">C#代码格式化</a><a href="/formatjava/">JAVA代码格式化</a><a href="/formatcsql/">SQL代码格式化</a><a href="/formatpy/">Python代码格式化</a><a href="/formatruby/">Ruby代码格式化</a><a href="/formatc/">C语言代码格式化</a><a href="/formatcpp/">C++代码格式化</a><a href="/formatperl/">Perl代码格式化</a><a href="/formatvbs/">VBScript格式化</a><a href="/htmloutjs/" class="hot">Html/JS互转</a><a href="/htmlescape/">Html转义工具</a><a href="/html2cj/">Html转C#/JSP</a><a href="/html2php/">Html转PHP代码</a><a href="/html2all/">Html转ASP/Perl</a><a href="/htmlfromcsv/">Excel转HTML表格</a><a href="/htmltable/">Html表格生成器</a><a href="/html2ubb/">HTML/UBB互转</a><a href="/htmlmarkdown/">HTML/MarkDown互转</a><a href="/regex/" class="new">正则表达式测试</a><a href="/regexcode/">正则生成代码</a><a href="/formatfilter/">Html过滤工具</a><a href="/regexdso/">常用正则表达式</a><a href="/regexsucha/">正则语法速查</a><a href="/runjs/">运行Js/html/css</a><a href="/xpath/">Xpath工具</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#a855f7">
            <div class="cat-header"><span class="cat-dot" style="background:#a855f7"></span><h3>加密解密编码</h3><span class="cat-count">29 个</span></div>
            <div class="cat-links"><a href="/md5/" class="hot">MD5加密</a><a href="/base64/" class="hot">Base64加密/解密</a><a href="/escape/">Escape加密/解密</a><a href="/deencrypt/">对称加密/解密</a><a href="/aesencrypt/">AES加密/解密</a><a href="/desencrypt/">DES加密/解密</a><a href="/rc4encrypt/">RC4加密/解密</a><a href="/rabbitencrypt/">Rabbit加密/解密</a><a href="/tripledes/">TripleDES加密/解密</a><a href="/shaencrypt/">SHA/SHA256加密</a><a href="/allencrypt/">散列/哈希加密大全</a><a href="/morse/">摩尔斯电码加解密</a><a href="/password/">密码生成器</a><a href="/uuid/">UUID在线生成</a><a href="/guid/">GUID在线生成</a><a href="/htpasswd/">htpasswd生成</a><a href="/barcode/">条形码生成器</a><a href="/ip2long/">IP/数字地址转换</a><a href="/img2base64/" class="hot">图片转Base64</a><a href="/utf8/">UTF-8转GBK</a><a href="/unicode/">Unicode/ASCII转换</a><a href="/ascii/">ASCII编码/解码</a><a href="/urlencode/">URL编码/解码</a><a href="/navtiveunicode/">Native/Unicode转换</a><a href="/keyboardcode/">KeyCode按键码</a><a href="/androidkeycode/">Android按键码</a><a href="/keyboardtest/">键盘测试工具</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#f59e0b">
            <div class="cat-header"><span class="cat-dot" style="background:#f59e0b"></span><h3>文本数字</h3><span class="cat-count">21 个</span></div>
            <div class="cat-links"><a href="/editor/">Html在线编辑器</a><a href="/autoformat/" class="hot">文章自动排版</a><a href="/jianfan/">简繁字体转换</a><a href="/pinyin/">汉字转为拼音</a><a href="/huoxingwen/">火星文转换器</a><a href="/txtreplace/">文本内容替换</a><a href="/textdiff/">文本内容对比</a><a href="/txtcount/">在线统计字数</a><a href="/shupai/">文字竖排工具</a><a href="/textflip/">文字翻转工具</a><a href="/quchong/">内容去重工具</a><a href="/wenzitexiao/">文字特效工具</a><a href="/zipstringtext/">字符串文本压缩</a><a href="/camelcase/" class="new">驼峰与下划线互转</a><a href="/quanbaojiao/">全角半角转换</a><a href="/enlower/">字母大小写转换</a><a href="/rmbdaxie/">人民币大写转换</a><a href="/random/">随机数生成器</a><a href="/unixtime/">Unix时间戳转换</a><a href="/hexconvert/">进制转换工具</a><a href="/hexrgb/">RGB颜色转换</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#14b8a6">
            <div class="cat-header"><span class="cat-dot" style="background:#14b8a6"></span><h3>网络工具</h3><span class="cat-count">10 个</span></div>
            <div class="cat-links"><a href="/websocket/">Websocket测试</a><a href="/browserinfo/">获取浏览器信息</a><a href="/dns/">公共DNS</a><a href="/alldns/">各地区公共DNS</a><a href="/dnsdx/">各地电信DNS</a><a href="/dnslt/">各地联通DNS</a><a href="/dnsyd/">各地移动DNS</a><a href="/dnstt/">各地铁通DNS</a><a href="/dnsedu/">教育网DNS</a><a href="/dnsusa/">美国DNS</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#475569">
            <div class="cat-header"><span class="cat-dot" style="background:#475569"></span><h3>站长工具</h3><span class="cat-count">6 个</span></div>
            <div class="cat-links"><a href="/htaccess2nginx/" class="new">htaccess转nginx</a><a href="/shortcut/">生成桌面快捷方式</a><a href="/px2rem/">rem与px转换</a><a href="/createmeta/">生成网页Meta标签</a><a href="/refresh/">在线定时刷新网址</a><a href="/tiaoseban/">在线调色板</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#ea580c">
            <div class="cat-header"><span class="cat-dot" style="background:#ea580c"></span><h3>计算换算</h3><span class="cat-count">16 个</span></div>
            <div class="cat-links"><a href="/nianlvli/">利率计算器</a><a href="/subnetmask/">子网掩码计算器</a><a href="/calculator/">在线科学计算器</a><a href="/calcarea/">面积换算器</a><a href="/calcheat/">热量换算器</a><a href="/calcvolume/">体积换算器</a><a href="/calcpressure/">压力换算器</a><a href="/calcpower/">功率换算器</a><a href="/calclength/">长度换算器</a><a href="/calctemperature/">温度换算器</a><a href="/calctime/">时间换算器</a><a href="/calcspeed/">速度换算器</a><a href="/calcangle/">角度换算器</a><a href="/calcdata/">数据大小换算器</a><a href="/calcthickness/">密度换算器</a><a href="/calcforce/">力换算器</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#22c55e">
            <div class="cat-header"><span class="cat-dot" style="background:#22c55e"></span><h3>生活查询</h3><span class="cat-count">10 个</span></div>
            <div class="cat-links"><a href="/tuya/">在线涂鸦画板</a><a href="/shizhong/">在线时钟</a><a href="/worldtime/">世界各地时间</a><a href="/capital/">世界各国首都查询</a><a href="/currency/">世界各地货币查询</a><a href="/areacode/">各国区号时差查询</a><a href="/jieri/">世界节日查询</a><a href="/shaoshuminzu/">少数民族分布查询</a><a href="/chaodai/">历史朝代时间查询</a><a href="/tesufuhao/">特殊符号大全</a></div>
        </div>
        <div class="cat-card" style="border-left-color:#78716c">
            <div class="cat-header"><span class="cat-dot" style="background:#78716c"></span><h3>对照表</h3><span class="cat-count">11 个</span></div>
            <div class="cat-links"><a href="/useragent/">常用User-Agent</a><a href="/contenttype/">Content-Type对照表</a><a href="/requestmethod/">Request请求大全</a><a href="/httpheader/">HTTP请求头大全</a><a href="/pagecode/">HTTP状态码</a><a href="/asciicode/">ASCII对照表</a><a href="/htmlescapechar/">HTML特殊字符转义</a><a href="/ports/">常见端口大全</a><a href="/bootstrapicon/">Bootstrap字体图标</a><a href="/androidmanifest/">Android Manifest权限</a><a href="/linuxcmd/">Linux常用命令大全</a></div>
        </div>
    </div>
</div>
</main>

<div class="features">
    <div class="container">
        <div class="row">
            <div class="col-sm-3 col-xs-6"><div class="feat-item"><div class="feat-icon" style="background:#eff6ff;color:#3b82f6"><span class="glyphicon glyphicon-flash"></span></div><h4>即开即用</h4><p>无需注册安装，打开即用</p></div></div>
            <div class="col-sm-3 col-xs-6"><div class="feat-item"><div class="feat-icon" style="background:#fef3c7;color:#f59e0b"><span class="glyphicon glyphicon-lock"></span></div><h4>隐私安全</h4><p>数据本地处理，不上传</p></div></div>
            <div class="col-sm-3 col-xs-6"><div class="feat-item"><div class="feat-icon" style="background:#f0fdf4;color:#22c55e"><span class="glyphicon glyphicon-gift"></span></div><h4>完全免费</h4><p>150+工具全部免费</p></div></div>
            <div class="col-sm-3 col-xs-6"><div class="feat-item"><div class="feat-icon" style="background:#faf5ff;color:#a855f7"><span class="glyphicon glyphicon-refresh"></span></div><h4>持续更新</h4><p>不断添加新工具</p></div></div>
        </div>
    </div>
</div>

<div class="copyright" id="footer">
    <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <span>Copyright &copy;2026 <a href="/">Ymir Tool</a></span> |
                <span><a href="/about.html">关于我们</a> | <a href="/privacy.html">隐私政策</a> | <a href="/contact.html">联系我们</a></span>
            </div>
        </div>
    </div>
</div>

<a class="gotop" href="#top" title="返回顶部" style="display:none"><span class="arrow"></span><span class="arrow lit"></span></a>

<script src="https://cdn.staticfile.org/jquery/1.11.3/jquery.min.js" defer></script>
<script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js" defer></script>
<script src="/static/script/tool.js"></script>
<script>
var tools=[];
document.querySelectorAll('.cat-links a').forEach(function(a){
    tools.push({name:a.textContent.trim(),href:a.getAttribute('href')});
});
document.getElementById('toolSearch').addEventListener('input',function(){
    var q=this.value.trim().toLowerCase();
    var sr=document.getElementById('searchResult');
    var cs=document.getElementById('catSection');
    var sl=document.getElementById('searchLinks');
    var nr=document.getElementById('noResult');
    if(!q){sr.style.display='none';cs.style.display='block';return;}
    sr.style.display='block';cs.style.display='none';
    sl.innerHTML='';nr.style.display='none';
    var found=tools.filter(function(t){return t.name.toLowerCase().indexOf(q)!==-1;});
    if(found.length===0){nr.style.display='block';return;}
    found.forEach(function(t){
        var a=document.createElement('a');
        a.href=t.href;a.textContent=t.name;
        sl.appendChild(a);
    });
});
</script>
</body>
</html>'''

with open(fp, 'w', encoding='utf-8') as f:
    f.write(html)
print('首页已全面优化')
