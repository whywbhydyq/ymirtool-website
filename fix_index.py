import os

out = './ymirtool-dist'
fp = os.path.join(out, 'index.html')
with open(fp, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. 缩小hero区域
html = html.replace('padding:60px 0 50px', 'padding:30px 0 25px')
html = html.replace('font-size:42px', 'font-size:30px')
html = html.replace('font-size:18px;color:rgba(255,255,255,0.75)', 'font-size:15px;color:rgba(255,255,255,0.75)')
html = html.replace('margin:0 auto 30px', 'margin:0 auto 15px')
html = html.replace('gap:40px;margin-top:25px', 'gap:30px;margin-top:12px')
html = html.replace('font-size:32px;font-weight:700;color:#3498db', 'font-size:24px;font-weight:700;color:#3498db')
html = html.replace('font-size:13px;color:rgba(255,255,255,0.5);margin-top:2px', 'font-size:12px;color:rgba(255,255,255,0.5);margin-top:1px')
html = html.replace('padding:12px 20px 12px 45px', 'padding:10px 18px 10px 40px')
html = html.replace('font-size:15px;background', 'font-size:14px;background')

# 2. 工具链接样式 - 更大更突出
html = html.replace(
    '.cat-links a{display:inline-block;padding:6px 14px;background:#f8f9fa;color:#555;border-radius:6px;font-size:13px;text-decoration:none;transition:all .2s;border:1px solid transparent}',
    '.cat-links a{display:inline-block;padding:8px 16px;background:#f0f4f8;color:#2c3e50;border-radius:8px;font-size:14px;text-decoration:none;transition:all .2s;border:1px solid #dce3eb;font-weight:500}'
)
html = html.replace(
    '.cat-links a:hover{background:#3498db;color:#fff;border-color:#3498db;transform:translateY(-1px)}',
    '.cat-links a:hover{background:#3498db;color:#fff;border-color:#3498db;transform:translateY(-2px);box-shadow:0 4px 12px rgba(52,152,219,0.3)}'
)

# 3. 分类图标 - 用文字emoji代替纯色块
replacements = {
    'style="background:linear-gradient(135deg,#3498db,#2980b9)"><span class="glyphicon glyphicon-list-alt': 'style="background:linear-gradient(135deg,#3498db,#2980b9)"><span style="font-size:20px">&#x1F4CB;',
    'style="background:linear-gradient(135deg,#e74c3c,#c0392b)"><span class="glyphicon glyphicon-code': 'style="background:linear-gradient(135deg,#e74c3c,#c0392b)"><span style="font-size:20px">&#x1F4DD;',
    'style="background:linear-gradient(135deg,#9b59b6,#8e44ad)"><span class="glyphicon glyphicon-lock': 'style="background:linear-gradient(135deg,#9b59b6,#8e44ad)"><span style="font-size:20px">&#x1F512;',
    'style="background:linear-gradient(135deg,#f39c12,#e67e22)"><span class="glyphicon glyphicon-font': 'style="background:linear-gradient(135deg,#f39c12,#e67e22)"><span style="font-size:20px">&#x270F;',
    'style="background:linear-gradient(135deg,#1abc9c,#16a085)"><span class="glyphicon glyphicon-globe': 'style="background:linear-gradient(135deg,#1abc9c,#16a085)"><span style="font-size:20px">&#x1F310;',
    'style="background:linear-gradient(135deg,#34495e,#2c3e50)"><span class="glyphicon glyphicon-cog': 'style="background:linear-gradient(135deg,#34495e,#2c3e50)"><span style="font-size:20px">&#x2699;',
    'style="background:linear-gradient(135deg,#e67e22,#d35400)"><span class="glyphicon glyphicon-calculator': 'style="background:linear-gradient(135deg,#e67e22,#d35400)"><span style="font-size:20px">&#x1F522;',
    'style="background:linear-gradient(135deg,#2ecc71,#27ae60)"><span class="glyphicon glyphicon-th-large': 'style="background:linear-gradient(135deg,#2ecc71,#27ae60)"><span style="font-size:20px">&#x1F3A8;',
    'style="background:linear-gradient(135deg,#7f8c8d,#636e72)"><span class="glyphicon glyphicon-book': 'style="background:linear-gradient(135deg,#7f8c8d,#636e72)"><span style="font-size:20px">&#x1F4D6;',
}
for old, new in replacements.items():
    html = html.replace(old, new)

# 4. 热门/新标记也变大
html = html.replace('.cat-links a.hot{color:#e74c3c;font-weight:500}', '.cat-links a.hot{color:#e74c3c;font-weight:700;border-color:#e74c3c;background:#fff5f5}')
html = html.replace('.cat-links a.hot:hover{background:#e74c3c;color:#fff;border-color:#e74c3c}', '.cat-links a.hot:hover{background:#e74c3c;color:#fff;border-color:#e74c3c}')
html = html.replace('.cat-links a.new{color:#27ae60;font-weight:500}', '.cat-links a.new{color:#27ae60;font-weight:700;border-color:#27ae60;background:#f0fff4}')
html = html.replace('.cat-links a.new:hover{background:#27ae60;color:#fff;border-color:#27ae60}', '.cat-links a.new:hover{background:#27ae60;color:#fff;border-color:#27ae60}')

with open(fp, 'w', encoding='utf-8') as f:
    f.write(html)
print('首页已优化')
