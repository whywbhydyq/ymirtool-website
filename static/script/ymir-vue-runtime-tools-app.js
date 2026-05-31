(function () {
  'use strict';
  var Shared = window.YmirVueShared;
  var Vue = window.Vue;
  var ElementPlus = window.ElementPlus;
  if (!Shared || !Vue || !ElementPlus) {
    var failed = document.getElementById('ymir-vue-highrisk-app');
    if (failed) failed.innerHTML = '<div class="ymir-vue-noscript">Tool assets failed to load.</div>';
    return;
  }

  var COPY = Shared.copyText;

  var TEXT = {
    editor: {
      en: {
        icon: 'HTML', category: 'HTML editor', title: 'HTML Rich Text Editor',
        desc: 'Edit HTML source, preview it in a locked sandbox, and copy clean markup for articles, docs, or snippets.',
        tags: ['Sandbox preview', 'HTML source', 'Copy markup'], input: 'HTML source', preview: 'Sandbox preview',
        ready: 'Edit HTML source and preview it in the sandbox.', copied: 'HTML copied.', cleared: 'Editor cleared.', sampled: 'Sample loaded.',
        actions: { preview: 'Refresh Preview', sample: 'Load Sample', copy: 'Copy HTML', clear: 'Clear' }
      },
      zh: {
        icon: 'HTML', category: 'HTML 编辑器', title: 'HTML 富文本编辑器',
        desc: '编辑 HTML 源码，在受限沙箱中预览，并复制用于文章、文档或片段的标记。',
        tags: ['沙箱预览', 'HTML 源码', '复制标记'], input: 'HTML 源码', preview: '沙箱预览',
        ready: '编辑 HTML 源码并在沙箱中预览。', copied: 'HTML 已复制。', cleared: '编辑器已清空。', sampled: '示例已载入。',
        actions: { preview: '刷新预览', sample: '载入示例', copy: '复制 HTML', clear: '清空' }
      },
      sample: '<article><h2>Ymir Tool note</h2><p>Edit this HTML, then preview it in the sandbox.</p><ul><li>Use semantic headings</li><li>Keep snippets small</li><li>Review before publishing</li></ul></article>'
    },
    runjs: {
      en: {
        icon: 'RUN', category: 'Sandbox runner', title: 'HTML / CSS / JS Runner',
        desc: 'Run small HTML, CSS, and JavaScript snippets in an isolated iframe sandbox without changing the page.',
        tags: ['iframe sandbox', 'No same-origin', 'Copy snippet'], input: 'HTML / CSS / JS input', preview: 'Sandbox output',
        ready: 'Paste a snippet and run it in the isolated preview.', ran: 'Snippet rendered in sandbox.', copied: 'Snippet copied.', cleared: 'Runner cleared.', sampled: 'Sample loaded.',
        actions: { run: 'Run Preview', sample: 'Load Sample', copy: 'Copy Code', clear: 'Clear' }
      },
      zh: {
        icon: 'RUN', category: '沙箱运行器', title: 'HTML / CSS / JS 在线运行',
        desc: '在隔离 iframe 沙箱中运行小型 HTML、CSS、JavaScript 片段，不影响当前页面。',
        tags: ['iframe 沙箱', '无同源权限', '复制代码'], input: 'HTML / CSS / JS 输入', preview: '沙箱输出',
        ready: '粘贴代码片段并在隔离预览中运行。', ran: '代码已在沙箱中渲染。', copied: '代码已复制。', cleared: '运行器已清空。', sampled: '示例已载入。',
        actions: { run: '运行预览', sample: '载入示例', copy: '复制代码', clear: '清空' }
      },
      sample: '<!doctype html>\n<html>\n<head>\n<style>\nbody{font-family:system-ui;padding:24px;background:#f8fafc;color:#0f172a}\n.card{padding:18px;border:1px solid #cbd5e1;border-radius:16px;background:white}\nbutton{padding:8px 12px;border-radius:10px;border:1px solid #2563eb;background:#2563eb;color:white}\n</style>\n</head>\n<body>\n<div class="card">\n<h1>Hello Ymir</h1>\n<p>This preview runs inside a sandboxed iframe.</p>\n<button onclick="document.body.insertAdjacentHTML(\'beforeend\',\'<p>Button clicked.</p>\')">Click</button>\n</div>\n</body>\n</html>'
    },
    websocket: {
      en: {
        icon: 'WS', category: 'Network tester', title: 'WebSocket Test Client',
        desc: 'Connect to a ws:// or wss:// endpoint, send test messages, and inspect connection events in a local log.',
        tags: ['ws / wss', 'Message log', 'Manual connect'], url: 'WebSocket URL', message: 'Message', log: 'Connection log',
        ready: 'Enter a WebSocket URL and connect.', connected: 'Connected.', disconnected: 'Disconnected.', invalid: 'Use a ws:// or wss:// URL.', sent: 'Message sent.', cleared: 'Log cleared.', sampled: 'Demo URL filled. Replace it with your own endpoint if needed.',
        actions: { connect: 'Connect', disconnect: 'Disconnect', send: 'Send Message', sample: 'Demo URL', clear: 'Clear Log' }
      },
      zh: {
        icon: 'WS', category: '网络测试', title: 'WebSocket 在线测试工具',
        desc: '连接 ws:// 或 wss:// 地址，发送测试消息，并在本地日志中查看连接事件。',
        tags: ['ws / wss', '消息日志', '手动连接'], url: 'WebSocket 地址', message: '消息', log: '连接日志',
        ready: '输入 WebSocket 地址并连接。', connected: '已连接。', disconnected: '已断开。', invalid: '请使用 ws:// 或 wss:// 地址。', sent: '消息已发送。', cleared: '日志已清空。', sampled: '示例地址已填入；可替换成自己的服务端。',
        actions: { connect: '连接', disconnect: '断开', send: '发送消息', sample: '示例地址', clear: '清空日志' }
      }
    }
  };

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function (ch) {
      return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]);
    });
  }

  function iframeDoc(raw, mode) {
    var body = String(raw || '');
    var csp = mode === 'run'
      ? "default-src 'none'; img-src data: blob:; media-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'"
      : "default-src 'none'; img-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'none'; connect-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'";
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="' + csp.replace(/"/g, '&quot;') + '"><base target="_blank"><style>html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#0f172a;background:#fff}body{padding:16px;line-height:1.6}pre,code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}img,svg,video{max-width:100%;height:auto}table{border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:6px}</style></head><body>' + body + '</body></html>';
  }

  function nowStamp() {
    var d = new Date();
    return d.toLocaleTimeString([], { hour12: false });
  }

  function makeTool(lang, key) {
    var base = TEXT[key][lang] || TEXT[key].en;
    return { icon: base.icon, category: base.category, title: base.title, desc: base.desc, tags: base.tags };
  }

  var root = document.getElementById('ymir-vue-highrisk-app');
  if (!root) return;
  var toolKey = root.getAttribute('data-tool') || 'editor';

  Shared.mountConfiguredToolApp({
    root: root,
    data: function () {
      var lang = Shared.getLang();
      var seed = toolKey === 'websocket' ? '' : TEXT[toolKey].sample;
      return {
        lang: lang,
        toolKey: toolKey,
        input: seed || '',
        preview: toolKey === 'websocket' ? '' : iframeDoc(seed || '', toolKey === 'runjs' ? 'run' : 'editor'),
        statusType: 'info',
        statusTitle: (TEXT[toolKey][lang] || TEXT[toolKey].en).ready,
        wsaddr: '',
        message: '',
        logs: [],
        connected: false,
        socket: null
      };
    },
    computed: {
      msg: function () { return TEXT[this.toolKey][this.lang] || TEXT[this.toolKey].en; },
      tool: function () { return makeTool(this.lang, this.toolKey); },
      inputMeta: function () { return this.input.length + ' chars · ' + Shared.bytes(this.input) + ' bytes'; },
      logText: function () { return this.logs.map(function (item) { return '[' + item.time + '] ' + item.type + ' ' + item.text; }).join('\n'); },
      actions: function () {
        var a = this.msg.actions;
        if (this.toolKey === 'websocket') {
          return [
            { key: 'connect', label: a.connect, type: 'primary' },
            { key: 'disconnect', label: a.disconnect, type: 'warning' },
            { key: 'send', label: a.send, type: 'success' },
            { key: 'sample', label: a.sample },
            { key: 'clear', label: a.clear }
          ];
        }
        return [
          { key: this.toolKey === 'runjs' ? 'run' : 'preview', label: this.toolKey === 'runjs' ? a.run : a.preview, type: 'primary' },
          { key: 'sample', label: a.sample },
          { key: 'copy', label: a.copy, type: 'success' },
          { key: 'clear', label: a.clear }
        ];
      }
    },
    beforeUnmount: function () { this.disconnectSocket(); },
    methods: {
      updateLang: function (lang) {
        this.lang = Shared.setLang(lang);
        this.statusTitle = this.msg.ready;
      },
      setStatus: function (type, title) {
        this.statusType = type;
        this.statusTitle = title;
      },
      handleAction: function (key) {
        if (this.toolKey === 'websocket') return this.handleSocketAction(key);
        if (key === 'preview' || key === 'run') return this.refreshPreview();
        if (key === 'sample') return this.loadSample();
        if (key === 'copy') return this.copyInput();
        if (key === 'clear') return this.clearInput();
      },
      refreshPreview: function () {
        this.preview = iframeDoc(this.input, this.toolKey === 'runjs' ? 'run' : 'editor');
        this.setStatus('success', this.toolKey === 'runjs' ? this.msg.ran : this.msg.ready);
      },
      loadSample: function () {
        this.input = TEXT[this.toolKey].sample || '';
        this.refreshPreview();
        this.setStatus('success', this.msg.sampled);
      },
      copyInput: function () {
        COPY(this.input, ElementPlus);
        this.setStatus('success', this.msg.copied);
      },
      clearInput: function () {
        this.input = '';
        this.preview = iframeDoc('', this.toolKey === 'runjs' ? 'run' : 'editor');
        this.setStatus('info', this.msg.cleared);
      },
      handleSocketAction: function (key) {
        if (key === 'connect') return this.connectSocket();
        if (key === 'disconnect') return this.disconnectSocket();
        if (key === 'send') return this.sendSocket();
        if (key === 'sample') { this.wsaddr = 'wss://echo.websocket.events'; this.addLog('info', this.msg.sampled); return this.setStatus('info', this.msg.sampled); }
        if (key === 'clear') { this.logs = []; this.setStatus('info', this.msg.cleared); }
      },
      addLog: function (type, text) {
        this.logs.unshift({ time: nowStamp(), type: type, text: String(text || '') });
        if (this.logs.length > 160) this.logs = this.logs.slice(0, 160);
      },
      validWsUrl: function (url) { return /^wss?:\/\//i.test(String(url || '').trim()); },
      connectSocket: function () {
        var self = this;
        var url = String(this.wsaddr || '').trim();
        if (!this.validWsUrl(url)) { this.addLog('error', this.msg.invalid); return this.setStatus('error', this.msg.invalid); }
        this.disconnectSocket(true);
        try {
          var ws = new WebSocket(url);
          this.socket = ws;
          this.addLog('open?', 'Connecting to ' + url);
          this.setStatus('info', 'Connecting...');
          ws.onopen = function () { self.connected = true; self.addLog('open', self.msg.connected); self.setStatus('success', self.msg.connected); };
          ws.onmessage = function (event) { self.addLog('message', event.data); };
          ws.onerror = function () { self.addLog('error', 'WebSocket error. Check endpoint, protocol, CORS/network policy, or mixed-content blocking.'); self.setStatus('error', 'WebSocket error.'); };
          ws.onclose = function (event) { self.connected = false; self.addLog('close', 'Closed ' + event.code + (event.reason ? ' · ' + event.reason : '')); self.setStatus('info', self.msg.disconnected); };
        } catch (e) {
          this.addLog('error', e.message || String(e));
          this.setStatus('error', e.message || 'Connection failed.');
        }
      },
      disconnectSocket: function (silent) {
        try {
          if (this.socket) this.socket.close(1000, 'Client disconnect');
        } catch (e) {}
        this.socket = null;
        this.connected = false;
        if (!silent) { this.addLog('close', this.msg.disconnected); this.setStatus('info', this.msg.disconnected); }
      },
      sendSocket: function () {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          this.addLog('error', 'Not connected.');
          return this.setStatus('warning', 'Not connected.');
        }
        this.socket.send(String(this.message || ''));
        this.addLog('send', String(this.message || ''));
        this.setStatus('success', this.msg.sent);
      }
    },
    shell: function () {
      return { icon: this.tool.icon, category: this.tool.category, title: this.tool.title, subtitle: this.tool.desc, tags: this.tool.tags, appClass: 'ymir-vue-app--runtime', footerTags: [
        { label: this.toolKey === 'websocket' ? (this.logs.length + ' log events') : this.inputMeta },
        { label: 'Tool runtime' },
        { label: 'Shared runtime' }
      ] };
    },
    renderBody: function (h, El) {
      var ElCard = Shared.getEl(El, 'ElCard');
      var ElInput = Shared.getEl(El, 'ElInput');
      var ElTag = Shared.getEl(El, 'ElTag');
      var self = this;
      if (this.toolKey !== 'websocket') {
        return h('div', { class: 'ymir-vue-highrisk-grid' }, [
          Shared.renderEditorCard(h, El, { title: this.msg.input, meta: this.inputMeta, value: this.input, rows: this.toolKey === 'runjs' ? 20 : 18, onInput: function (value) { self.input = value; } }),
          h(ElCard, { class: 'ymir-vue-panel ymir-vue-preview-panel', shadow: 'never' }, {
            header: function () { return Shared.renderPanelHeader(h, self.msg.preview, 'iframe sandbox'); },
            default: function () { return h('iframe', { class: 'ymir-vue-sandbox-frame', sandbox: self.toolKey === 'runjs' ? 'allow-scripts allow-forms allow-modals' : '', srcdoc: self.preview, title: 'Sandbox preview' }); }
          })
        ]);
      }
      return h('div', { class: 'ymir-vue-websocket-layout' }, [
        h(ElCard, { class: 'ymir-vue-panel', shadow: 'never' }, {
          header: function () { return Shared.renderPanelHeader(h, self.msg.url, 'ws:// or wss://'); },
          default: function () { return [
            h(ElInput, { modelValue: self.wsaddr, placeholder: 'wss://example.com/socket', clearable: true, 'onUpdate:modelValue': function (value) { self.wsaddr = value; } }),
            h('div', { class: 'ymir-vue-ws-message-row' }, [
              h(ElInput, { modelValue: self.message, placeholder: self.msg.message, clearable: true, 'onUpdate:modelValue': function (value) { self.message = value; }, onKeyup: function (evt) { if (evt && evt.key === 'Enter') self.sendSocket(); } }),
              h(ElTag, { type: self.connected ? 'success' : 'info' }, function () { return self.connected ? self.msg.connected : self.msg.disconnected; })
            ]),
            h('p', { class: 'ymir-vue-highrisk-note' }, 'Connections are made by your browser. HTTPS pages may block plain ws:// endpoints as mixed content; use wss:// for public endpoints.')
          ]; }
        }),
        h(ElCard, { class: 'ymir-vue-panel ymir-vue-output', shadow: 'never' }, {
          header: function () { return Shared.renderPanelHeader(h, self.msg.log, self.logs.length + ' events'); },
          default: function () { return h('pre', { class: 'ymir-vue-ws-log' }, self.logText || self.msg.ready); }
        })
      ]);
    },
    renderActions: function (h, El) {
      return Shared.renderActionButtons(h, El, this, this.actions, { onRun: function (key) { this.handleAction(key); } });
    }
  });
})();
