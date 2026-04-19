import os

with open('./index.html','r',encoding='utf-8') as f:
    c=f.read()

c=c.replace(
    '<title>Ymir Tool - 150+免费在线工具箱 | JSON格式化/MD5/代码美化</title>',
    '<title>Ymir Tool - 免费在线工具箱 | JSON格式化、MD5加密、代码格式化、Base64编解码</title>'
)

old_desc = 'Ymir Tool免费在线工具箱，提供JSON格式化、MD5加密、Base64编解码、代码格式化、文本处理、单位换算等150+工具。无需安装，打开即用，数据浏览器本地处理保障隐私安全。'
new_desc = 'Ymir Tool免费在线工具箱，提供JSON格式化验证、MD5加密解密、Base64编解码、HTML/CSS/JS代码格式化、文本处理替换对比、单位换算计算器等150+开发者常用工具。所有工具无需注册安装，打开浏览器即可使用，数据均在本地处理，保障您的隐私安全。'
c=c.replace(old_desc, new_desc)

c=c.replace(
    '150+免费在线开发者工具，无需安装，打开即用',
    'Ymir Tool提供150+免费在线工具，包括JSON格式化、MD5加密、代码格式化、文本处理等，无需安装，数据本地处理保障隐私'
)

c=c.replace(
    '<meta name="twitter:card" content="summary_large_image"/>',
    '<meta name="twitter:card" content="summary_large_image"/>\n<meta name="twitter:site" content="@ymirtool"/>'
)

with open('./index.html','w',encoding='utf-8') as f:
    f.write(c)
print('done')
