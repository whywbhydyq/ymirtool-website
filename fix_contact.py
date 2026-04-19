with open('./contact.html','r',encoding='utf-8') as f:
    c=f.read()

c=c.replace('GitHub','QQ邮箱')
c=c.replace('ymirtool-website','2922027393@qq.com')

with open('./contact.html','w',encoding='utf-8') as f:
    f.write(c)

# 检查结果
if '2922027393@qq.com' in c:
    print('contact.html fixed')
else:
    print('failed')
