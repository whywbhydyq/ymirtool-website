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
    aesencrypt: { title: 'AES Encrypt / Decrypt', zhTitle: 'AES 加密 / 解密', desc: 'Encrypt with modern AES-GCM or decrypt legacy CryptoJS-compatible AES payloads.', category: 'Crypto utility', icon: 'AES', algorithm: 'aes', mode: 'cipher', runtimePolicy: 'full' },
    deencrypt: { title: 'DES Migration Checklist', zhTitle: 'DES 迁移检查清单', desc: 'DES execution is disabled. Record the old mode, IV, padding, encoding, and test vectors before migrating historical data.', category: 'Legacy crypto migration', icon: 'DES', algorithm: 'des', mode: 'cipher', runtimePolicy: 'reference-only' },
    desencrypt: { title: 'DES Ciphertext Format Reference', zhTitle: 'DES 密文格式记录参考', desc: 'DES execution is disabled. Use this reference to document ciphertext encoding, mode, IV, padding, and key derivation before migration.', category: 'Legacy format reference', icon: 'FMT', algorithm: 'des', mode: 'cipher', runtimePolicy: 'reference-only' },
    rabbitencrypt: { title: 'Rabbit Guarded Legacy Compatibility', zhTitle: 'Rabbit 旧系统兼容工具', desc: 'Run Rabbit only for guarded legacy compatibility checks with non-sensitive migration samples.', category: 'Legacy crypto', icon: 'RBT', algorithm: 'rabbit', mode: 'cipher', runtimePolicy: 'guarded' },
    rc4encrypt: { title: 'RC4 Legacy Compatibility Reference', zhTitle: 'RC4 旧系统兼容参考', desc: 'RC4 execution is disabled here; use this page as a legacy compatibility reference, not for new encryption work.', category: 'Legacy crypto reference', icon: 'RC4', algorithm: 'rc4', mode: 'cipher', runtimePolicy: 'reference-only' },
    tripledes: { title: 'Triple DES Legacy Decryption Compatibility', zhTitle: 'Triple DES 旧密文解密兼容', desc: 'Triple DES is limited to guarded historical decryption compatibility; creating new ciphertext is disabled.', category: 'Legacy crypto', icon: '3DES', algorithm: 'tripledes', mode: 'cipher', runtimePolicy: 'decrypt-only' },
    allencrypt: { title: 'Multi-Algorithm Hash Digest Tool', zhTitle: '多算法哈希摘要工具', desc: 'Compare MD5, SHA-1, SHA-256, and SHA-512 outputs for checksums and compatibility; use HMAC or signatures when authenticity matters.', category: 'Hash utility', icon: '#', mode: 'hash' },
    htpasswd: { title: 'Apache htpasswd Compatibility Generator', zhTitle: 'Apache htpasswd 兼容格式生成器', desc: 'Generate legacy Apache password-file entries for compatibility tests. Use the server-side htpasswd -B option for new bcrypt credentials.', category: 'Server compatibility utility', icon: 'HT', mode: 'htpasswd' },
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
          aesMode: meta.algorithm === 'aes' ? 'modern' : 'legacy',
          legacyAcknowledged: false,
          htUser: 'admin',
          htPass: 'change-me',
          htAlg: '2',
          status: 'info',
          hashResults: [],
          meta: meta
        };
      },
      computed: {
        isAesTool: function () { return this.meta && this.meta.algorithm === 'aes'; },
        cipherRuntimePolicy: function () { return (this.meta && this.meta.runtimePolicy) || 'full'; },
        isReferenceOnlyCipher: function () { return this.meta && this.meta.mode === 'cipher' && this.cipherRuntimePolicy === 'reference-only'; },
        isDecryptOnlyCipher: function () { return this.meta && this.meta.mode === 'cipher' && this.cipherRuntimePolicy === 'decrypt-only'; },
        requiresLegacyAcknowledgement: function () {
          return this.meta && this.meta.mode === 'cipher' && !this.isReferenceOnlyCipher && (!this.isAesTool || this.aesMode === 'legacy');
        },
        aesFormatNotice: function () {
          if (!this.isAesTool) return '';
          var input = String(this.input || '').trim();
          var helper = window.YmirWebCryptoAesGcm;
          if (this.aesMode === 'modern') {
            if (helper && helper.isSerializedPayload && helper.isSerializedPayload(input)) {
              try {
                var info = helper.describePayload(input);
                return 'Detected ymir-aes-gcm-v1 payload: ' + info.algorithm + ', ' + info.kdf + ', ' + info.iterations + ' PBKDF2 iterations, ' + info.ivBytes + '-byte IV, ' + info.tagLengthBits + '-bit tag.';
              } catch (error) {
                return 'Detected ymir-aes-gcm-v1 prefix, but payload metadata could not be verified.';
              }
            }
            return this.lang === 'zh'
              ? 'Modern AES-GCM 只解密 ymir-aes-gcm-v1 输出。旧 CryptoJS / OpenSSL passphrase 密文必须切换到 Legacy CryptoJS 模式。'
              : 'Modern AES-GCM only decrypts ymir-aes-gcm-v1 output. Old CryptoJS/OpenSSL passphrase ciphertext must use Legacy CryptoJS mode.';
          }
          return this.lang === 'zh'
            ? 'Legacy CryptoJS 模式只用于旧 CryptoJS / OpenSSL passphrase 密文；不能解密 ymir-aes-gcm-v1 输出。'
            : 'Legacy CryptoJS mode is only for old CryptoJS/OpenSSL passphrase ciphertext; it cannot decrypt ymir-aes-gcm-v1 output.';
        },
        cipherModeOptions: function () {
          if (!this.isAesTool) return [];
          return [
            { label: 'Modern AES-GCM', value: 'modern' },
            { label: 'Legacy CryptoJS', value: 'legacy' }
          ];
        },
        cipherOptions: function () {
          var options = [
            { label: 'AES', value: 'aes' },
            { label: 'DES', value: 'des' },
            { label: 'Rabbit', value: 'rabbit' },
            { label: 'RC4', value: 'rc4' },
            { label: 'Triple DES', value: 'tripledes' }
          ];
          if (this.meta && this.meta.algorithm) return options.filter(function (item) { return item.value === this.meta.algorithm; }, this);
          return options;
        },
        tool: function () {
          return {
            title: this.lang === 'zh' ? (this.meta.zhTitle || this.meta.title) : this.meta.title,
            desc: this.meta.desc,
            category: this.meta.category,
            icon: this.meta.icon,
            tags: this.meta.mode === 'cipher'
              ? (this.isAesTool ? ['modern AES-GCM', 'legacy compatible', 'copy result'] : (this.isReferenceOnlyCipher ? ['reference only', 'no runtime execution', 'migration notes'] : (this.isDecryptOnlyCipher ? ['decryption compatibility', 'guarded execution', 'no new ciphertext'] : ['passphrase required', 'compatibility mode', 'copy result'])))
              : ['ready to use', 'copy result', 'review output']
          };
        },
        statusTitle: function () { return statusTitle(this.lang, this.status, this.output || (this.hashResults && this.hashResults.length)); },
        statusType: function () { return this.status === 'error' ? 'error' : (this.output || this.hashResults.length ? 'success' : 'info'); },
        inputMeta: function () { return (this.input || '').length + ' chars / ' + Shared.bytes(this.input) + ' bytes'; },
        outputMeta: function () { return (this.output || '').length + ' chars / ' + Shared.bytes(this.output) + ' bytes'; },
        actions: function () {
          if (this.meta.mode === 'cipher') {
            if (this.isReferenceOnlyCipher) return [
              { key: 'sample', label: this.lang === 'zh' ? '查看非敏感示例' : 'Show sample', type: 'primary' },
              { key: 'copy', label: this.lang === 'zh' ? '复制说明/结果' : 'Copy note/result' },
              { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
            ];
            if (this.isDecryptOnlyCipher) return [
              { key: 'decrypt', label: this.lang === 'zh' ? '解密旧样例' : 'Decrypt legacy sample', type: 'primary' },
              { key: 'sample', label: this.lang === 'zh' ? '示例' : 'Sample' },
              { key: 'copy', label: this.lang === 'zh' ? '复制结果' : 'Copy result' },
              { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
            ];
            return [
              { key: 'encrypt', label: this.lang === 'zh' ? '加密' : 'Encrypt', type: 'primary' },
              { key: 'decrypt', label: this.lang === 'zh' ? '解密' : 'Decrypt' },
              { key: 'sample', label: this.lang === 'zh' ? '示例' : 'Sample' },
              { key: 'copy', label: this.lang === 'zh' ? '复制结果' : 'Copy result' },
              { key: 'clear', label: this.lang === 'zh' ? '清空' : 'Clear' }
            ];
          }
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
        assertLegacyAcknowledged: function () {
          if (this.requiresLegacyAcknowledgement && !this.legacyAcknowledged) {
            throw new Error('Confirm the legacy compatibility notice before running this cipher. Use non-sensitive sample data only.');
          }
        },
        run: async function (key) {
          try {
            this.status = 'info';
            if (key === 'encrypt') return await this.encrypt();
            if (key === 'decrypt') return await this.decrypt();
            if (key === 'hash') return await this.generateHashes();
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
        assertCanEncrypt: function () {
          if (this.isReferenceOnlyCipher) {
            throw new Error('This legacy cipher page is reference-only. Runtime encryption/decryption is disabled; use non-sensitive samples and migrate to a modern design.');
          }
          if (this.isDecryptOnlyCipher) {
            throw new Error('Creating new Triple DES ciphertext is disabled. Use this page only to decrypt historical non-sensitive compatibility samples.');
          }
        },
        assertCanDecrypt: function () {
          if (this.isReferenceOnlyCipher) {
            throw new Error('This legacy cipher page is reference-only. Runtime encryption/decryption is disabled; use it for migration notes only.');
          }
        },
        webCryptoAes: function () {
          var helper = window.YmirWebCryptoAesGcm;
          if (!helper || typeof helper.encryptText !== 'function' || typeof helper.decryptText !== 'function') {
            throw new Error('Modern AES-GCM helper is not available.');
          }
          if (!helper.isSupported()) {
            throw new Error('Modern AES-GCM needs Web Crypto, TextEncoder, and TextDecoder support.');
          }
          return helper;
        },
        encrypt: async function () {
          this.assertCanEncrypt();
          if (!this.passphrase) throw new Error('Passphrase is required.');
          this.assertLegacyAcknowledged();
          if (this.isAesTool && this.aesMode === 'modern') {
            this.output = await this.webCryptoAes().encryptText(String(this.input || ''), String(this.passphrase));
            this.status = 'success';
            return;
          }
          var result = cryptoCipher(this.algorithm).encrypt(String(this.input || ''), String(this.passphrase)).toString();
          this.output = result; this.status = 'success';
        },
        decrypt: async function () {
          this.assertCanDecrypt();
          if (!this.passphrase) throw new Error('Passphrase is required.');
          this.assertLegacyAcknowledged();
          if (this.isAesTool && this.aesMode === 'modern') {
            var modernHelper = this.webCryptoAes();
            var modernInput = String(this.input || '').trim();
            if (modernHelper.isSerializedPayload && !modernHelper.isSerializedPayload(modernInput)) {
              throw new Error('Modern AES-GCM mode only decrypts ymir-aes-gcm-v1 payloads. Switch to Legacy CryptoJS mode for old CryptoJS/OpenSSL-compatible AES ciphertext.');
            }
            this.output = await modernHelper.decryptText(modernInput, String(this.passphrase));
            this.status = 'success';
            return;
          }
          if (this.isAesTool && this.aesMode === 'legacy' && /^\s*ymir-aes-gcm-v1:/.test(String(this.input || ''))) {
            throw new Error('Legacy CryptoJS mode cannot decrypt ymir-aes-gcm-v1 payloads. Switch to Modern AES-GCM mode.');
          }
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
        sample: function () {
          this.input = this.isAesTool ? 'Non-sensitive AES-GCM sample text' : 'Hello from Ymir Tool';
          this.passphrase = this.isAesTool ? 'ymir-demo-passphrase' : 'ymir-secret';
          if (this.isAesTool) this.aesMode = 'modern';
          this.legacyAcknowledged = false;
          if (this.isReferenceOnlyCipher) {
            this.output = this.lang === 'zh'
              ? '此页面已降级为 legacy compatibility reference。运行时执行已禁用；请使用现代 AES-GCM 或经审计的迁移方案。'
              : 'This page is downscoped to a legacy compatibility reference. Runtime execution is disabled; use modern AES-GCM or a reviewed migration path instead.';
            this.status = 'info';
            this.hashResults = [];
            return;
          }
          if (this.isAesTool) {
            this.output = this.lang === 'zh'
              ? '点击“加密”生成 ymir-aes-gcm-v1 输出；切换到 Legacy CryptoJS 模式可处理旧密文。'
              : 'Click Encrypt to generate a ymir-aes-gcm-v1 output; switch to Legacy CryptoJS mode for old ciphertext.';
            this.hashResults = [];
            this.status = 'info';
            return;
          }
          if (this.isDecryptOnlyCipher) {
            this.output = this.lang === 'zh'
              ? 'Triple DES 页面只保留旧密文解密兼容入口，不再创建新密文。请勾选 legacy 确认后使用脱敏旧样例。'
              : 'Triple DES is kept only for legacy ciphertext decryption compatibility. Confirm the legacy guard and use a non-sensitive historical sample.';
            this.hashResults = [];
            this.status = 'info';
            return;
          }
          this.output = '';
          this.hashResults = [];
          this.status = 'info';
        },
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
        var cryptoNote = this.isAesTool
          ? (this.aesMode === 'modern'
            ? (this.lang === 'zh' ? '默认使用现代 AES-GCM：Web Crypto、PBKDF2-SHA-256、随机 salt 与 96-bit IV。输出只兼容 ymir-aes-gcm-v1 格式。' : 'Default modern mode uses AES-GCM with Web Crypto, PBKDF2-SHA-256, random salt, and a 96-bit IV. Output is only compatible with the ymir-aes-gcm-v1 format.')
            : (this.lang === 'zh' ? 'Legacy CryptoJS 模式仅用于旧密文兼容，不建议用于新的安全设计。' : 'Legacy CryptoJS mode is only for old ciphertext compatibility, not new security designs.'))
          : (this.isReferenceOnlyCipher
            ? (this.lang === 'zh' ? '此旧算法页面已降级为 reference-only：不再生成或解密数据，只保留迁移说明和非敏感示例。' : 'This legacy algorithm page is downscoped to reference-only: it no longer encrypts or decrypts data and is kept for migration notes and non-sensitive examples.')
            : (this.isDecryptOnlyCipher
              ? (this.lang === 'zh' ? 'Triple DES 仅保留旧数据解密兼容入口，不再创建新密文。' : 'Triple DES is limited to legacy decryption compatibility; creating new ciphertext is disabled.')
              : (this.lang === 'zh' ? '旧算法仅用于兼容性排查，不建议用于新的安全设计。' : 'Legacy algorithms are for compatibility checks, not new security designs.')));
        var nodes = [h('div', { class: 'ymir-vue-crypto-note' }, cryptoNote)];
        if (this.aesFormatNotice) {
          nodes.push(h('div', { class: 'ymir-vue-crypto-note ymir-vue-aes-format-boundary', 'data-aes-format-boundary': 'true' }, this.aesFormatNotice));
        }
        if (this.requiresLegacyAcknowledgement) {
          nodes.push(h('div', { class: 'ymir-vue-crypto-note ymir-vue-legacy-execution-guard', 'data-legacy-execution-guard': 'true' }, [
            h('strong', null, this.lang === 'zh' ? 'Legacy compatibility execution guard' : 'Legacy compatibility execution guard'),
            h('p', null, this.lang === 'zh' ? '此算法仅用于旧系统兼容性排查。请仅使用非敏感样例数据，并确认你不是把它用于新的安全设计。' : 'This algorithm is only for legacy compatibility checks. Use non-sensitive sample data only and confirm you are not using it for a new security design.'),
            h('label', { class: 'ymir-vue-check' }, [
              h('input', { type: 'checkbox', checked: this.legacyAcknowledged, onChange: function (event) { self.legacyAcknowledged = !!event.target.checked; } }),
              h('span', null, this.lang === 'zh' ? '我确认这是 legacy compatibility 用途，并且不会输入密码、密钥、令牌或生产数据。' : 'I confirm this is for legacy compatibility only and I will not enter passwords, keys, tokens, or production data.')
            ])
          ]));
        }
        if (this.meta.mode === 'cipher' && !this.isReferenceOnlyCipher) {
          var controlItems = [];
          if (this.isAesTool) {
            controlItems.push(h(ElFormItem, { label: this.lang === 'zh' ? '模式' : 'Mode' }, function () { return h(ElSelect, { modelValue: self.aesMode, 'onUpdate:modelValue': function (v) { self.aesMode = v; } }, function () { return self.cipherModeOptions.map(function (item) { return h(ElOption, { label: item.label, value: item.value, key: item.value }); }); }); }));
          }
          controlItems.push(
            h(ElFormItem, { label: this.lang === 'zh' ? '算法' : 'Algorithm' }, function () { return h(ElSelect, { modelValue: self.algorithm, disabled: self.cipherOptions.length < 2 || self.isAesTool, 'onUpdate:modelValue': function (v) { self.algorithm = v; } }, function () { return self.cipherOptions.map(function (item) { return h(ElOption, { label: item.label, value: item.value, key: item.value }); }); }); }),
            h(ElFormItem, { label: this.lang === 'zh' ? '密钥 / 口令' : 'Passphrase' }, function () { return h(ElInput, { modelValue: self.passphrase, showPassword: true, 'onUpdate:modelValue': function (v) { self.passphrase = v; } }); }),
            h(ElFormItem, { label: ' ' }, function () { return h(ElTag, { type: self.isAesTool && self.aesMode === 'modern' ? 'success' : 'warning', effect: 'plain' }, function () { return self.isAesTool && self.aesMode === 'modern' ? 'Modern AES-GCM' : 'Legacy compatibility'; }); })
          );
          nodes.push(h('div', { class: 'ymir-vue-crypto-controls' }, [h('div', { class: 'ymir-vue-crypto-control-row' }, controlItems)]));
        }
        if (this.meta.mode === 'htpasswd') {
          nodes.push(h('div', { class: 'ymir-vue-crypto-note ymir-vue-legacy-execution-guard', 'data-htpasswd-compatibility-note': 'true' }, [
            h('strong', null, this.lang === 'zh' ? '仅用于旧格式兼容' : 'Legacy format compatibility only'),
            h('p', null, this.lang === 'zh' ? '此浏览器工具只生成旧式 {SHA}、$apr1$ MD5、crypt 或 plain 条目。新凭证请在服务器端使用 Apache htpasswd -B 创建 bcrypt 记录；不要在网页中输入真实生产密码。' : 'This browser tool only generates legacy {SHA}, $apr1$ MD5, crypt, or plain entries. Create new credentials server-side with Apache htpasswd -B for bcrypt, and never enter real production passwords here.')
          ]));
          nodes.push(h('div', { class: 'ymir-vue-crypto-controls' }, [h('div', { class: 'ymir-vue-crypto-control-row' }, [
            h(ElFormItem, { label: this.lang === 'zh' ? '用户名' : 'Username' }, function () { return h(ElInput, { modelValue: self.htUser, 'onUpdate:modelValue': function (v) { self.htUser = v; } }); }),
            h(ElFormItem, { label: this.lang === 'zh' ? '密码' : 'Password' }, function () { return h(ElInput, { modelValue: self.htPass, showPassword: true, 'onUpdate:modelValue': function (v) { self.htPass = v; } }); }),
            h(ElFormItem, { label: this.lang === 'zh' ? '算法' : 'Algorithm' }, function () { return h(ElSelect, { modelValue: self.htAlg, 'onUpdate:modelValue': function (v) { self.htAlg = v; } }, function () { return [
              h(ElOption, { label: '$apr1$ MD5 · legacy', value: '2' }), h(ElOption, { label: '{SHA} · legacy', value: '3' }), h(ElOption, { label: 'crypt · legacy', value: '1' }), h(ElOption, { label: 'plain · unsafe', value: '0' })
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
