import os, re, json

out = './ymirtool-dist'

def parse_web_php(filepath):
    if not os.path.exists(filepath): return {}
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    config = {}
    i = 0
    while i < len(content):
        m = re.search(r"'(\w+)'\s*=>\s*array\s*\(", content[i:])
        if not m: break
        key = m.group(1)
        start = i + m.end()
        depth, j = 1, start
        while j < len(content) and depth > 0:
            if content[j] == '(': depth += 1
            elif content[j] == ')': depth -= 1
            j += 1
        block = content[start:j-1]
        t = re.search(r"'title'\s*=>\s*'(.*?)',", block)
        k = re.search(r"'keywords'\s*=>\s*'(.*?)',", block)
        d = re.search(r"'description'\s*=>\s*'(.*?)',", block)
        if t:
            config[key] = {
                'title': t.group(1).strip(),
                'keywords': k.group(1).strip() if k else '',
                'description': d.group(1).strip() if d else '',
            }
        i = j
    return config

# === Step 2: 修复首页描述 + 结构化数据 ===
fp = os.path.join(out, 'index.html')
with open(fp, 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(
    r'<meta name="description" content="[^"]*"/>',
    '<meta name="description" content="Ymir Tool 提供150+免费在线工具，包括JSON格式化、加密解密、代码格式化、文本处理、单位换算等，无需安装，打开即用，数据本地处理保障隐私。"/>',
    html
)

if 'application/ld+json' not in html:
    jsonld = '<script type="application/ld+json">\n' + json.dumps({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Ymir Tool",
        "url": "https://ymirtool.com/",
        "description": "免费在线工具箱，提供150+开发者工具"
    }, ensure_ascii=False, indent=2) + '\n</script>'
    html = html.replace('</head>', jsonld + '\n</head>')

with open(fp, 'w', encoding='utf-8') as f:
    f.write(html)
print('1. 首页描述已修复 + 结构化数据已添加')

# === Step 3 & 4: 工具页加H1 + 结构化数据 ===
tdk = parse_web_php('./config/web.php')
count_h1 = 0
count_jsonld = 0

for d in sorted(os.listdir(out)):
    p = os.path.join(out, d, 'index.html')
    if not os.path.isfile(p): continue

    with open(p, 'r', encoding='utf-8', errors='replace') as f:
        h = f.read()

    title_match = re.search(r'<title>([^<]+)</title>', h)
    if not title_match: continue
    title = title_match.group(1)
    tool_name = re.split(r'\s*[-_|]\s*', title)[0].strip()
    if not tool_name: continue

    changed = False

    # 添加H1
    if '<h1' not in h:
        h1 = '<h1 style="font-size:22px;font-weight:600;color:#333;margin:15px 0;padding-bottom:10px;border-bottom:2px solid #3498db">' + tool_name + '</h1>'
        if 'col10main' in h:
            h = h.replace('<div class="col-md-12 col10main">', '<div class="col-md-12 col10main">' + h1, 1)
            changed = True
            count_h1 += 1
        else:
            containers = list(re.finditer(r'<div class="container">', h))
            if len(containers) >= 2:
                pos = containers[1].end()
                col = re.search(r'<div class="col-md-12[^"]*">', h[pos:])
                if col:
                    insert_pos = pos + col.end()
                    h = h[:insert_pos] + h1 + h[insert_pos:]
                    changed = True
                    count_h1 += 1

    # 添加结构化数据
    if 'application/ld+json' not in h:
        desc = tdk.get(d, {}).get('description', tool_name + ' - Ymir Tool在线工具')
        jsonld_obj = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": tool_name,
            "url": "https://ymirtool.com/" + d + "/",
            "description": desc,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Any",
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "CNY"}
        }
        jsonld = '<script type="application/ld+json">\n' + json.dumps(jsonld_obj, ensure_ascii=False, indent=2) + '\n</script>'
        h = h.replace('</head>', jsonld + '\n</head>')
        changed = True
        count_jsonld += 1

    if changed:
        with open(p, 'w', encoding='utf-8') as f:
            f.write(h)

print('2. 添加H1标签: ' + str(count_h1) + ' 个工具页')
print('3. 添加结构化数据: ' + str(count_jsonld) + ' 个工具页')

# === Step 5: 提交sitemap提醒 ===
print('')
print('==============================')
print('全部完成！接下来：')
print('  cd ymirtool-dist')
print('  git add -A')
print('  git commit -m "seo: H1 + structured data + fix description"')
print('  git push -f origin main')
print('')
print('推送后去 Google Search Console：')
print('  1. 打开 search.google.com/search-console')
print('  2. 点"站点地图" → 输入 sitemap.xml → 提交')
print('  3. 点"网址检查" → 输入 ymirtool.com → 请求编入索引')
print('==============================')
