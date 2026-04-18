import os
fp = './sitemap.xml'
with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()
if not c.startswith('<?xml'):
    c = '<?xml version="1.0" encoding="UTF-8"?>\n' + c
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(c)
    print('sitemap.xml 已添加XML声明')
else:
    print('XML声明已存在')
