(function () {
  'use strict';
  if (!window.YmirVueShared) return;
  var Vue = window.Vue;
  var EP = window.ElementPlus;
  var Shared = window.YmirVueShared;

  function utf8ToBase64(text) {
    return btoa(unescape(encodeURIComponent(String(text || ''))));
  }
  function base64ToUtf8(text) {
    return decodeURIComponent(escape(atob(String(text || '').replace(/\s+/g, ''))));
  }
  function unicodeEscape(text) {
    return Array.prototype.map.call(String(text || ''), function (ch) {
      var code = ch.charCodeAt(0);
      return code < 256 ? '\\x' + code.toString(16).padStart(2, '0') : '\\u' + code.toString(16).padStart(4, '0');
    }).join('');
  }
  function decodeEscapes(text) {
    return String(text || '')
      .replace(/\\x([0-9a-fA-F]{2})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
      .replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); });
  }
  function hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  async function subtleHash(name, text) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return hex(await crypto.subtle.digest(name, new TextEncoder().encode(String(text || ''))));
    }
    if (name === 'SHA-1' && typeof window.hex_sha1 === 'function') return window.hex_sha1(String(text || ''));
    throw new Error(name + ' is not available.');
  }
  function md5(text) {
    if (window.CryptoJS && CryptoJS.MD5) return CryptoJS.MD5(String(text || '')).toString();
    if (typeof window.hex_md5 === 'function') return window.hex_md5(String(text || ''));
    throw new Error('MD5 library is not available.');
  }
  function cryptoCipher(name) {
    var map = { aes: 'AES', des: 'DES', rabbit: 'Rabbit', rc4: 'RC4', tripledes: 'TripleDES' };
    if (!window.CryptoJS || !CryptoJS[map[name]]) throw new Error('Crypto library is not available.');
    return CryptoJS[map[name]];
  }
  function statusTitle(lang, kind, output) {
    if (kind === 'error') return lang === 'zh' ? '处理失败，请检查输入、密钥或格式。' : 'Failed. Check the input, passphrase, or format.';
    if (output) return lang === 'zh' ? '完成。结果已生成。' : 'Ready. The result was generated quickly.';
    return lang === 'zh' ? '输入内容，然后运行工具。' : 'Enter content, then run the tool.';
  }

  var pageMeta = {
    aesencrypt: { title: 'AES Encrypt / Decrypt', zhTitle: 'AES 加密 / 解密', desc: 'Encrypt or decrypt text with AES passphrase mode.', category: 'Crypto utility', icon: 'AES', algorithm: 'aes', mode: 'cipher' },
    deencrypt: { title: 'DES Encrypt / Decrypt', zhTitle: 'DES 加密 / 解密', desc: 'Encrypt or decrypt text with DES passphrase mode. DES is legacy; use only for compatibility checks.', category: 'Legacy crypto', icon: 'DES', algorithm: 'des', mode: 'cipher' },
    desencrypt: { title: 'DES Encrypt / Decrypt', zhTitle: 'DES 加密 / 解密', desc: 'Encrypt or decrypt text with DES passphrase mode. DES is legacy; use only for compatibility checks.', category: 'Legacy crypto', icon: 'DES', algorithm: 'des', mode: 'cipher' },
    rabbitencrypt: { title: 'Rabbit Encrypt / Decrypt', zhTitle: 'Rabbit 加密 / 解密', desc: 'Encrypt or decrypt text with Rabbit stream cipher compatibility mode.', category: 'Legacy crypto', icon: 'RBT', algorithm: 'rabbit', mode: 'cipher' },
    rc4encrypt: { title: 'RC4 Encrypt / Decrypt', zhTitle: 'RC4 加密 / 解密', desc: 'Encrypt or decrypt text with RC4 compatibility mode. RC4 is not recommended for new security designs.', category: 'Legacy crypto', icon: 'RC4', algorithm: 'rc4', mode: 'cipher' },
    tripledes: { title: 'Triple DES Encrypt / Decrypt', zhTitle: 'Triple DES 加密 / 解密', desc: 'Encrypt or decrypt text with Triple DES compatibility mode.', category: 'Legacy crypto', icon: '3DES', algorithm: 'tripledes', mode: 'cipher' },
    allencrypt: { title: 'Hash Generator', zhTitle: '哈希摘要生成器', desc: 'Generate MD5, SHA-1, SHA-256, and SHA-512 digests quickly.', category: 'Hash utility', icon: '#', mode: 'hash' },
    htpasswd: { title: 'htpasswd Generator', zhTitle: 'htpasswd 生成器', desc: 'Generate Apache htpasswd lines for Basic Auth compatibility checks.', category: 'Server utility', icon: 'HT', mode: 'htpasswd' },
    endecodejs: { title: 'JavaScript Encode / Decode', zhTitle: 'JavaScript 编码 / 解码', desc: 'Encode or decode JavaScript strings, URI text, Unicode escapes, and Base64 safely.', category: 'JavaScript utility', icon: 'JS', mode: 'jsencode' },
    confundirjs: { title: 'JavaScript String Encoding Helper', zhTitle: 'JavaScript 字符串编码辅助工具', desc: 'Create Base64 string wrappers and Unicode escape text for lightweight demos and compatibility checks.', category: 'JavaScript utility', icon: '{}', mode: 'obfuscate' }
  };

  function makeApp(root, meta) {
    return {
      data: function () {
        var lang = Shared.getLang();
        return {
          lang: lang,
          input: 'Hello from Ymir Tool',
          output: '',
          passphrase: 'ymir-secret',
          algorithm: meta.algorithm || 'aes',
          htUser: 'admin',
          htPass: 'change-me',
          htAlg: '3',
          status: 'info',
          hashResults: [],
          meta: meta
        };
      },
      computed: {
        tool: function () {
          return {
            title: this.lang === 'zh' ? (this.meta.zhTitle || this.meta.title) : this.meta.title,
            desc: this.meta.desc,
            category: this.meta.category,
            icon: this.meta.icon,
            tags: this.meta.mode === 'cipher' ? ['passphrase required', 'compatibility mode', 'copy result'] : ['ready to use', 'copy result', 'review output']
          };
        },
        statusTitle: function () { return statusTitle(this.lang, this.status, this.output || (this.hashResults && this.hashResults.length)); },
        statusType: function () { return this.status === 'error' ? 'error' : (this.output || this.hashResults.length ? 'success' : 'info'); },
        inputMeta: function () { return (this.input || '').length + ' chars / ' + Shared.bytes(this.input) + ' bytes'; },
        outputMeta: function () { return (this.output || '').length + ' chars / ' + Shared.bytes(this.output) + ' bytes'; },
        actions: function () {
          if (this.meta.mode === 'cipher') return [
            { key: 'encrypt', label: this.lang === 'zh' ? '加密' : 'Encrypt', type: 'primary' },
            { key: 'decrypt', label: this.lang === 'zh' ? '解密' : 'Decrypt' },
            { key: 'sample', label: this.lang === 'zh' ? '示例' : 'Sample' },
            { key: 'copy', label: this.lang === 'zh' ? '复制结果' : 'Copy result' },
            { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
          ];
          if (this.meta.mode === 'hash') return [
            { key: 'hash', label: this.lang === 'zh' ? '生成摘要' : 'Generate hashes', type: 'primary' },
            { key: 'copy', label: this.lang === 'zh' ? '复制全部' : 'Copy all' },
            { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
          ];
          if (this.meta.mode === 'htpasswd') return [
            { key: 'htpasswd', label: this.lang === 'zh' ? '生成 htpasswd' : 'Generate htpasswd', type: 'primary' },
            { key: 'random', label: this.lang === 'zh' ? '随机密码' : 'Random password' },
            { key: 'copy', label: this.lang === 'zh' ? '复制结果' : 'Copy result' },
            { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
          ];
          return [
            { key: 'encode-uri', label: this.lang === 'zh' ? 'URI 编码' : 'URI encode', type: 'primary' },
            { key: 'decode-uri', label: this.lang === 'zh' ? 'URI 解码' : 'URI decode' },
            { key: 'escape', label: this.lang === 'zh' ? '转义字符串' : 'Escape string' },
            { key: 'unescape', label: this.lang === 'zh' ? '还原转义' : 'Unescape' },
            { key: 'b64wrap', label: this.lang === 'zh' ? 'Base64 字符串包装' : 'Base64 string wrapper' },
            { key: 'copy', label: this.lang === 'zh' ? '复制结果' : 'Copy result' },
            { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
          ];
        }
      },
      methods: {
        setLang: function (lang) { this.lang = Shared.setLang(lang); },
        setError: function (e) { this.status = 'error'; this.output = (e && e.message) ? e.message : String(e || 'Error'); },
        run: async function (key) {
          try {
            this.status = 'info';
            if (key === 'encrypt') return this.encrypt();
            if (key === 'decrypt') return this.decrypt();
            if (key === 'hash') return this.generateHashes();
            if (key === 'htpasswd') return this.generateHtpasswd();
            if (key === 'random') return this.randomPassword();
            if (key === 'encode-uri') { this.output = encodeURIComponent(this.input || ''); this.status = 'success'; return; }
            if (key === 'decode-uri') { this.output = decodeURIComponent(this.input || ''); this.status = 'success'; return; }
            if (key === 'escape') { this.output = unicodeEscape(this.input || ''); this.status = 'success'; return; }
            if (key === 'unescape') { this.output = decodeEscapes(this.input || ''); this.status = 'success'; return; }
            if (key === 'b64wrap') { this.output = 'const source = ' + JSON.stringify(this.input || '') + ';\nconst encoded = \"' + utf8ToBase64(this.input || '') + '\";'; this.status = 'success'; return; }
            if (key === 'sample') return this.sample();
            if (key === 'copy') return this.copy();
            if (key === 'clear') return this.clear();
          } catch (e) { this.setError(e); }
        },
        encrypt: function () {
          if (!this.passphrase) throw new Error('Passphrase is required.');
          var result = cryptoCipher(this.algorithm).encrypt(String(this.input || ''), String(this.passphrase)).toString();
          this.output = result; this.status = 'success';
        },
        decrypt: function () {
          if (!this.passphrase) throw new Error('Passphrase is required.');
          var plain = cryptoCipher(this.algorithm).decrypt(String(this.input || ''), String(this.passphrase)).toString(CryptoJS.enc.Utf8);
          if (!plain) throw new Error('Could not decrypt the input. Check the ciphertext and passphrase.');
          this.output = plain; this.status = 'success';
        },
        generateHashes: async function () {
          var text = String(this.input || '');
          this.hashResults = [
            { name: 'MD5', value: md5(text) },
            { name: 'SHA-1', value: await subtleHash('SHA-1', text) },
            { name: 'SHA-256', value: await subtleHash('SHA-256', text) },
            { name: 'SHA-512', value: await subtleHash('SHA-512', text) }
          ];
          this.output = this.hashResults.map(function (r) { return r.name + ': ' + r.value; }).join('\n');
          this.status = 'success';
        },
        generateHtpasswd: function () {
          if (!this.htUser || !this.htPass) throw new Error('Username and password are required.');
          if (typeof window.htpasswd !== 'function') throw new Error('htpasswd library is not available.');
          this.output = window.htpasswd(this.htUser, this.htPass, Number(this.htAlg));
          this.status = 'success';
        },
        randomPassword: function () {
          var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_+=';
          var arr = new Uint32Array(18);
          (crypto.getRandomValues ? crypto.getRandomValues(arr) : arr.fill(Date.now()));
          this.htPass = Array.prototype.map.call(arr, function (n) { return alphabet[n % alphabet.length]; }).join('');
          this.generateHtpasswd();
        },
        sample: function () { this.input = 'Hello from Ymir Tool'; this.passphrase = 'ymir-secret'; this.output = ''; this.hashResults = []; this.status = 'info'; },
        copy: function () { Shared.copyText(this.output, EP); },
        clear: function () { this.input = ''; this.output = ''; this.hashResults = []; this.status = 'info'; }
      },
      shell: function () {
        return { icon: this.tool.icon, category: this.tool.category, title: this.tool.title, subtitle: this.tool.desc, tags: this.tool.tags, appClass: 'ymir-vue-app--crypto', footerTags: [
          { label: 'Input ' + (this.input || '').length + ' chars' },
          { label: 'Output ' + (this.output || '').length + ' chars' }
        ] };
      },
      renderBody: function (h, El) {
        var ElFormItem = Shared.getEl(El, 'ElFormItem');
        var ElSelect = Shared.getEl(El, 'ElSelect');
        var ElOption = Shared.getEl(El, 'ElOption');
        var ElInput = Shared.getEl(El, 'ElInput');
        var ElTag = Shared.getEl(El, 'ElTag');
        var self = this;
        var nodes = [h('div', { class: 'ymir-vue-crypto-note' }, this.lang === 'zh' ? '旧算法仅用于兼容性排查，不建议用于新的安全设计。' : 'Legacy algorithms are for compatibility checks, not new security designs.')];
        if (this.meta.mode === 'cipher') {
          nodes.push(h('div', { class: 'ymir-vue-crypto-controls' }, [h('div', { class: 'ymir-vue-crypto-control-row' }, [
            h(ElFormItem, { label: this.lang === 'zh' ? '算法' : 'Algorithm' }, function () { return h(ElSelect, { modelValue: self.algorithm, 'onUpdate:modelValue': function (v) { self.algorithm = v; } }, function () { return [
              h(ElOption, { label: 'AES', value: 'aes' }), h(ElOption, { label: 'DES', value: 'des' }), h(ElOption, { label: 'Rabbit', value: 'rabbit' }), h(ElOption, { label: 'RC4', value: 'rc4' }), h(ElOption, { label: 'Triple DES', value: 'tripledes' })
            ]; }); }),
            h(ElFormItem, { label: this.lang === 'zh' ? '密钥 / 口令' : 'Passphrase' }, function () { return h(ElInput, { modelValue: self.passphrase, showPassword: true, 'onUpdate:modelValue': function (v) { self.passphrase = v; } }); }),
            h(ElFormItem, { label: ' ' }, function () { return h(ElTag, { type: 'warning', effect: 'plain' }, function () { return 'Compatibility mode'; }); })
          ])]));
        }
        if (this.meta.mode === 'htpasswd') {
          nodes.push(h('div', { class: 'ymir-vue-crypto-controls' }, [h('div', { class: 'ymir-vue-crypto-control-row' }, [
            h(ElFormItem, { label: this.lang === 'zh' ? '用户名' : 'Username' }, function () { return h(ElInput, { modelValue: self.htUser, 'onUpdate:modelValue': function (v) { self.htUser = v; } }); }),
            h(ElFormItem, { label: this.lang === 'zh' ? '密码' : 'Password' }, function () { return h(ElInput, { modelValue: self.htPass, showPassword: true, 'onUpdate:modelValue': function (v) { self.htPass = v; } }); }),
            h(ElFormItem, { label: this.lang === 'zh' ? '算法' : 'Algorithm' }, function () { return h(ElSelect, { modelValue: self.htAlg, 'onUpdate:modelValue': function (v) { self.htAlg = v; } }, function () { return [
              h(ElOption, { label: '{SHA}', value: '3' }), h(ElOption, { label: '$apr1$ MD5', value: '2' }), h(ElOption, { label: 'crypt', value: '1' }), h(ElOption, { label: 'plain', value: '0' })
            ]; }); })
          ])]));
        }
        nodes.push(Shared.renderInputOutputPanels(h, El, {
          gridClass: 'ymir-vue-crypto-grid',
          inputTitle: this.lang === 'zh' ? '输入' : 'Input', inputMeta: this.inputMeta, inputValue: this.input, inputRows: this.meta.mode === 'htpasswd' ? 6 : 14,
          onInput: function (v) { self.input = v; },
          outputTitle: this.lang === 'zh' ? '结果' : 'Output', outputMeta: this.outputMeta, outputValue: this.output, outputRows: this.meta.mode === 'htpasswd' ? 6 : 14
        }));
        if (this.meta.mode === 'hash' && this.hashResults.length) {
          nodes.push(h('div', { class: 'ymir-vue-hash-grid' }, this.hashResults.map(function (r) { return h('div', { class: 'ymir-vue-hash-card', key: r.name }, [h('strong', null, r.name), h('code', null, r.value)]); })));
        }
        return nodes;
      },
      renderActions: function (h, El) {
        return Shared.renderActionButtons(h, El, this, this.actions, { onRun: function (key) { this.run(key); } });
      }
    };
  }

  document.querySelectorAll('#ymir-vue-crypto-app[data-tool]').forEach(function (root) {
    var key = root.getAttribute('data-tool');
    var meta = pageMeta[key];
    if (!meta) return;
    Shared.mountConfiguredToolApp(Object.assign({ root: root }, makeApp(root, meta)));
  });
})();
