import os, re
skip = ['caiji','gzip','checkurl','whois','checkweixin','chaicp','chameta','checkkeyword','webstatus','favicon','ip','lishishangdejintian']
out = './ymirtool-dist'
count = 0
for root, dirs, files in os.walk(out):
    for fn in files:
        if not fn.endswith('.html'): continue
        fp = os.path.join(root, fn)
        with open(fp, 'r', encoding='utf-8', errors='replace') as f:
            c = f.read()
        orig = c
        for s in skip:
            pat = r'<li[^>]*><a[^>]*href="/' + s + r'/"[^>]*>.*?</a></li>\s*'
            c = re.sub(pat, '', c)
        if c != orig:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(c)
            count += 1
print(f'清理了 {count} 个文件')
