import os, re

out = './ymirtool-dist'
fp = os.path.join(out, 'index.html')
with open(fp, 'r', encoding='utf-8') as f:
    h = f.read()

# === 1. 移除"10工具分类"和"0下载" ===
h = re.sub(r'\s*<div class="stat"><div class="stat-num">10</div><div class="stat-label">[^<]*</div></div>', '', h)
h = re.sub(r'\s*<div class="stat"><div class="stat-num">0</div><div class="stat-label">[^<]*</div></div>', '', h)

# === 2. hero更紧凑 ===
h = h.replace('padding:30px 0 25px', 'padding:22px 0 18px')
h = h.replace('font-size:30px', 'font-size:26px')
h = h.replace('margin:0 auto 15px', 'margin:0 auto 10px')
h = h.replace('gap:30px;margin-top:12px', 'gap:0;margin-top:8px')

# === 3. 搜索框更明显 ===
h = h.replace(
    '.search-box input{width:100%;padding:10px 18px 10px 40px;border:none;border-radius:50px;font-size:14px;background:rgba(255,255,255,0.15);color:#fff;outline:none;transition:all .3s}',
    '.search-box input{width:100%;padding:12px 20px 12px 44px;border:2px solid rgba(255,255,255,0.4);border-radius:50px;font-size:15px;background:rgba(255,255,255,0.2);color:#fff;outline:none;transition:all .3s;font-weight:500}'
)
h = h.replace(
    '.search-box input::placeholder{color:rgba(255,255,255,0.4)}',
    '.search-box input::placeholder{color:rgba(255,255,255,0.6)}'
)
h = h.replace(
    '.search-box input:focus{background:rgba(255,255,255,0.25);box-shadow:0 0 20px rgba(52,152,219,0.3)}',
    '.search-box input:focus{background:rgba(255,255,255,0.3);border-color:rgba(255,255,255,0.7);box-shadow:0 0 25px rgba(52,152,219,0.4)}'
)
h = h.replace(
    '.search-box .search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.4);font-size:16px}',
    '.search-box .search-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.6);font-size:18px}'
)

# === 4. 工具分布更规律 - 统一卡片宽度，网格布局 ===
h = h.replace(
    '.cat-links{display:flex;flex-wrap:wrap;gap:8px}',
    '.cat-links{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start}'
)

# 让每个链接宽度更统一
h = h.replace(
    '.cat-links a{display:inline-block;padding:8px 16px;background:#f0f4f8;color:#2c3e50;border-radius:8px;font-size:14px;text-decoration:none;transition:all .2s;border:1px solid #dce3eb;font-weight:500}',
    '.cat-links a{display:inline-flex;align-items:center;padding:8px 16px;background:#f0f4f8;color:#2c3e50;border-radius:8px;font-size:14px;text-decoration:none;transition:all .2s;border:1px solid #dce3eb;font-weight:500;min-height:38px}'
)

# 卡片统一最小高度和内边距
h = h.replace(
    '.cat-card{background:#fff;border-radius:10px;padding:25px;margin-bottom:25px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f0f0f0;transition:all .3s}',
    '.cat-card{background:#fff;border-radius:10px;padding:20px 22px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f0f0f0;transition:all .3s}'
)

# 分类标题区域更紧凑
h = h.replace(
    '.cat-header{display:flex;align-items:center;margin-bottom:15px;padding-bottom:12px;border-bottom:2px solid #f5f5f5}',
    '.cat-header{display:flex;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #f0f0f0}'
)

# cat-section间距缩小
h = h.replace('padding:40px 0 20px', 'padding:25px 0 15px')

with open(fp, 'w', encoding='utf-8') as f:
    f.write(h)
print('首页布局已优化')
print('')
print('推送:')
print('  git add -A')
print('  git commit -m "fix: hero compact, search contrast, layout"')
print('  git push -f origin main')
