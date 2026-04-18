import os, re

out = './ymirtool-dist'
baidu = '<meta name="baidu-site-verification" content="codeva-UksONlLJGB" />'

count = 0
for root, dirs, files in os.walk(out):
    for fn in files:
        if not fn.endswith('.html'): continue
        fp = os.path.join(root, fn)
        with open(fp, 'r', encoding='utf-8', errors='replace') as f:
            c = f.read()
        if 'baidu-site-verification' in c: continue
        c = c.replace('</head>', baidu + '\n</head>')
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(c)
        count += 1

print('百度验证标签已添加到 ' + str(count) + ' 个页面')
