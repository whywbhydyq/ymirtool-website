(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-media-app');
  if (!root) return;
  if (!window.YmirVueShared) {
    root.innerHTML = '<div class="ymir-vue-noscript">Shared tool UI failed to load. This tool cannot start.</div>';
    return;
  }
  var Shared = window.YmirVueShared;
  var ElementPlus = window.ElementPlus;

  var TOOLS = {
    barcode: {
      kind: 'barcode', icon: 'BAR', title: 'Barcode Generator', category: 'Visual Utility',
      desc: 'Generate a printable barcode and copy or download the SVG result.',
      tags: ['Barcode', 'SVG', 'Copy-ready'], sample: 'YMIR-TOOL-2026'
    },
    img2base64: {
      kind: 'imageBase64', icon: 'IMG', title: 'Image to Base64 Converter', category: 'Visual Utility',
      desc: 'Convert a local image to a data URL, preview Base64 image input, and copy the result.',
      tags: ['Image', 'Base64', 'Preview'], sample: ''
    },
    tuya: {
      kind: 'drawing', icon: 'DRAW', title: 'Online Drawing Board', category: 'Drawing Tool',
      desc: 'Draw directly on a browser canvas with color, brush size, undo, clear, and PNG export.',
      tags: ['Canvas', 'Drawing', 'PNG'], sample: ''
    }
  };

  function normalizeDataUrl(text) {
    text = String(text || '').trim();
    if (!text) return '';
    if (/^data:image\//i.test(text)) return text;
    if (/^<img\b/i.test(text)) {
      var match = text.match(/src=["']([^"']+)/i);
      return match ? match[1] : '';
    }
    if (/^[A-Za-z0-9+/=\s]+$/.test(text) && text.length > 20) return 'data:image/png;base64,' + text.replace(/\s+/g, '');
    return text;
  }
  function countLines(text) { return String(text || '').split(/\r?\n/).length; }
  function download(name, dataUrlOrText, mime) {
    var a = document.createElement('a');
    if (/^data:/i.test(dataUrlOrText)) a.href = dataUrlOrText;
    else a.href = URL.createObjectURL(new Blob([dataUrlOrText], { type: mime || 'text/plain' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (!/^data:/i.test(dataUrlOrText)) URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }, 0);
  }

  var toolKey = root.getAttribute('data-tool') || 'barcode';
  var initialTool = TOOLS[toolKey] || TOOLS.barcode;

  Shared.mountConfiguredToolApp({
    root: root,
    name: 'YmirVueMediaToolsApp',
    data: function () {
      return {
        toolKey: toolKey,
        c: initialTool,
        lang: Shared.getLang(),
        statusType: 'info',
        statusTitle: 'Ready. Media tools run quickly.',
        barcodeInput: initialTool.sample || 'YMIR-TOOL-2026',
        barcodeFormat: 'CODE128',
        barcodeWidth: 2,
        barcodeHeight: 86,
        barcodeDisplayValue: true,
        imageText: '',
        imagePreview: '',
        imageName: '',
        drawColor: '#0f172a',
        brushSize: 5,
        colors: ['#0f172a', '#2563eb', '#0891b2', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#ffffff'],
        brushSizes: [3, 5, 8, 12, 18, 28],
        drawing: false,
        undoStack: [],
        lastPoint: null
      };
    },
    computed: {
      inputMeta: function () { return Shared.bytes(this.imageText) + ' bytes · ' + countLines(this.imageText) + ' lines'; },
      barcodeMeta: function () { return this.barcodeFormat + ' · ' + this.barcodeInput.length + ' chars'; },
      previewLabel: function () { return this.imageName || (this.imagePreview ? 'Preview ready' : 'No preview yet'); },
      actionItems: function () {
        if (this.c.kind === 'barcode') return [
          { key:'generateBarcode', label:this.lang === 'zh' ? '生成条码' : 'Generate barcode', type:'primary' },
          { key:'sampleBarcode', label:this.lang === 'zh' ? '载入示例' : 'Load sample' },
          { key:'copySvg', label:this.lang === 'zh' ? '复制 SVG' : 'Copy SVG' },
          { key:'downloadSvg', label:this.lang === 'zh' ? '下载 SVG' : 'Download SVG' },
          { key:'clearBarcode', label:this.lang === 'zh' ? '清空' : 'Clear' }
        ];
        if (this.c.kind === 'imageBase64') return [
          { key:'previewImage', label:this.lang === 'zh' ? '预览图片' : 'Preview image', type:'primary' },
          { key:'copyBase64', label:this.lang === 'zh' ? '复制 Base64' : 'Copy Base64' },
          { key:'downloadDataUrl', label:this.lang === 'zh' ? '下载文本' : 'Download text' },
          { key:'clearImage', label:this.lang === 'zh' ? '清空' : 'Clear' }
        ];
        return [
          { key:'clearCanvas', label:this.lang === 'zh' ? '清空画布' : 'Clear canvas', type:'primary' },
          { key:'undoCanvas', label:this.lang === 'zh' ? '撤销' : 'Undo' },
          { key:'downloadPng', label:this.lang === 'zh' ? '下载 PNG' : 'Download PNG' }
        ];
      }
    },
    mounted: function () {
      if (this.c.kind === 'barcode') this.$nextTick(this.generateBarcode);
      if (this.c.kind === 'drawing') this.$nextTick(this.initCanvas);
    },
    methods: {
      setLang: function (v) { this.lang = Shared.setLang(v); this.statusTitle = this.lang === 'zh' ? '已切换语言。' : 'Language switched.'; },
      run: function (key) {
        if (key === 'generateBarcode') return this.generateBarcode();
        if (key === 'sampleBarcode') { this.barcodeInput = this.c.sample; return this.generateBarcode(); }
        if (key === 'copySvg') return this.copySvg();
        if (key === 'downloadSvg') return this.downloadSvg();
        if (key === 'clearBarcode') { this.barcodeInput = ''; this.clearSvg(); return; }
        if (key === 'previewImage') return this.previewImage();
        if (key === 'copyBase64') return Shared.copyText(this.imageText, ElementPlus);
        if (key === 'downloadDataUrl') return this.downloadDataUrl();
        if (key === 'clearImage') { this.imageText = ''; this.imagePreview = ''; this.imageName = ''; this.setStatus('info', this.lang === 'zh' ? '已清空。' : 'Cleared.'); return; }
        if (key === 'clearCanvas') return this.clearCanvas();
        if (key === 'undoCanvas') return this.undoCanvas();
        if (key === 'downloadPng') return this.downloadPng();
      },
      setStatus: function (type, title) { this.statusType = type; this.statusTitle = title; },
      generateBarcode: function () {
        try {
          if (!this.barcodeInput.trim()) throw new Error('Enter barcode content first.');
          if (!window.JsBarcode) throw new Error('Barcode renderer failed to load.');
          window.JsBarcode(this.$refs.barcodeSvg, this.barcodeInput.trim(), {
            format: this.barcodeFormat,
            lineColor: '#0f172a',
            width: Number(this.barcodeWidth) || 2,
            height: Number(this.barcodeHeight) || 86,
            displayValue: !!this.barcodeDisplayValue,
            font: 'monospace',
            fontSize: 16,
            margin: 18,
            background: '#ffffff'
          });
          this.setStatus('success', this.lang === 'zh' ? '条形码已生成。请按编码格式复核内容。' : 'Barcode generated. Review the value and format before printing.');
        } catch (e) { this.setStatus('error', e && e.message ? e.message : 'Failed to generate barcode.'); }
      },
      clearSvg: function () { if (this.$refs.barcodeSvg) this.$refs.barcodeSvg.innerHTML = ''; this.setStatus('info', this.lang === 'zh' ? '已清空。' : 'Cleared.'); },
      svgText: function () { return this.$refs.barcodeSvg ? new XMLSerializer().serializeToString(this.$refs.barcodeSvg) : ''; },
      copySvg: function () { Shared.copyText(this.svgText(), ElementPlus); },
      downloadSvg: function () {
        var svg = this.svgText();
        if (!svg) { this.setStatus('warning', 'Generate a barcode first.'); return; }
        download('ymir-barcode.svg', svg, 'image/svg+xml;charset=utf-8');
      },
      loadImageFile: function (evt) {
        var file = evt && evt.target && evt.target.files ? evt.target.files[0] : null;
        if (!file) return;
        if (!/^image\//.test(file.type || '')) { this.setStatus('error', 'Choose an image file.'); return; }
        var reader = new FileReader();
        var self = this;
        reader.onload = function () {
          self.imageText = String(reader.result || '');
          self.imagePreview = self.imageText;
          self.imageName = file.name + ' · ' + Math.round(file.size / 1024) + ' KB';
          self.setStatus('success', self.lang === 'zh' ? '图片已转换为 Base64 Data URL。' : 'Image converted to a Base64 data URL.');
        };
        reader.onerror = function () { self.setStatus('error', 'Failed to read the image file.'); };
        reader.readAsDataURL(file);
      },
      previewImage: function () {
        var dataUrl = normalizeDataUrl(this.imageText);
        if (!dataUrl || !/^data:image\//i.test(dataUrl)) { this.setStatus('error', 'Paste an image data URL or Base64 image string first.'); return; }
        this.imagePreview = dataUrl;
        this.setStatus('success', this.lang === 'zh' ? '图片预览已更新。' : 'Image preview updated.');
      },
      downloadDataUrl: function () {
        if (!this.imageText) { this.setStatus('warning', 'Nothing to download.'); return; }
        download('ymir-image-base64.txt', this.imageText, 'text/plain;charset=utf-8');
      },
      initCanvas: function () {
        var canvas = this.$refs.drawCanvas;
        if (!canvas) return;
        this.resizeCanvas(true);
        var self = this;
        window.addEventListener('resize', function () { self.resizeCanvas(false); });
      },
      resizeCanvas: function (fresh) {
        var canvas = this.$refs.drawCanvas;
        if (!canvas) return;
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        var previous = (!fresh && canvas.width && canvas.height) ? canvas.toDataURL('image/png') : '';
        canvas.width = Math.max(320, Math.floor(rect.width * dpr));
        canvas.height = Math.max(240, Math.floor(rect.height * dpr));
        var ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (previous) {
          var img = new Image();
          img.onload = function () { ctx.drawImage(img, 0, 0, rect.width, rect.height); };
          img.src = previous;
        } else {
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, rect.width, rect.height);
        }
      },
      point: function (evt) {
        var canvas = this.$refs.drawCanvas;
        var rect = canvas.getBoundingClientRect();
        var e = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      },
      saveUndo: function () {
        var canvas = this.$refs.drawCanvas;
        if (!canvas) return;
        this.undoStack.push(canvas.toDataURL('image/png'));
        if (this.undoStack.length > 20) this.undoStack.shift();
      },
      beginDraw: function (evt) {
        if (evt && evt.preventDefault) evt.preventDefault();
        this.saveUndo();
        this.drawing = true;
        this.lastPoint = this.point(evt);
      },
      moveDraw: function (evt) {
        if (!this.drawing) return;
        if (evt && evt.preventDefault) evt.preventDefault();
        var canvas = this.$refs.drawCanvas;
        var ctx = canvas.getContext('2d');
        var p = this.point(evt);
        ctx.strokeStyle = this.drawColor;
        ctx.lineWidth = Number(this.brushSize) || 5;
        ctx.beginPath();
        ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        this.lastPoint = p;
      },
      endDraw: function () { this.drawing = false; this.lastPoint = null; },
      clearCanvas: function () {
        this.saveUndo();
        var canvas = this.$refs.drawCanvas;
        var rect = canvas.getBoundingClientRect();
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, rect.width, rect.height);
        this.setStatus('info', this.lang === 'zh' ? '画布已清空。' : 'Canvas cleared.');
      },
      undoCanvas: function () {
        var canvas = this.$refs.drawCanvas;
        var data = this.undoStack.pop();
        if (!canvas || !data) { this.setStatus('warning', this.lang === 'zh' ? '没有可撤销内容。' : 'Nothing to undo.'); return; }
        var ctx = canvas.getContext('2d');
        var rect = canvas.getBoundingClientRect();
        var img = new Image();
        var self = this;
        img.onload = function () { ctx.clearRect(0,0,rect.width,rect.height); ctx.drawImage(img, 0, 0, rect.width, rect.height); self.setStatus('success', self.lang === 'zh' ? '已撤销。' : 'Undo complete.'); };
        img.src = data;
      },
      downloadPng: function () {
        var canvas = this.$refs.drawCanvas;
        if (!canvas) return;
        download('ymir-drawing.png', canvas.toDataURL('image/png'));
      }
    },
    shell: function () {
      return { icon: this.c.icon, category: this.c.category, title: this.c.title, subtitle: this.c.desc, tags: this.c.tags, appClass: 'ymir-vue-app--media', footerTags: [{ label: 'Shared tool shell' }, { label: 'Tool runtime' }, { label: 'Copy-ready output' }] };
    },
    renderBody: function (h, El) {
      var ElCard = Shared.getEl(El, 'ElCard');
      var ElInput = Shared.getEl(El, 'ElInput');
      var ElFormItem = Shared.getEl(El, 'ElFormItem');
      var ElSelect = Shared.getEl(El, 'ElSelect');
      var ElOption = Shared.getEl(El, 'ElOption');
      var ElSwitch = Shared.getEl(El, 'ElSwitch');
      var ElInputNumber = Shared.getEl(El, 'ElInputNumber');
      var ElEmpty = Shared.getEl(El, 'ElEmpty');
      var ElRadioGroup = Shared.getEl(El, 'ElRadioGroup');
      var ElRadioButton = Shared.getEl(El, 'ElRadioButton');
      var self = this;
      if (this.c.kind === 'barcode') {
        return h('div', { class: 'ymir-vue-grid' }, [
          h(ElCard, { class: 'ymir-vue-media-panel', shadow: 'never' }, function () { return [
            h('h3', null, 'Barcode input'),
            h(ElInput, { modelValue: self.barcodeInput, placeholder: 'Enter text or numeric content', clearable: true, 'onUpdate:modelValue': function (v) { self.barcodeInput = v; }, onKeyup: function (evt) { if (evt && evt.key === 'Enter') self.generateBarcode(); } }),
            h('div', { class: 'ymir-vue-control-grid' }, [
              h(ElFormItem, { label: 'Format' }, function () { return h(ElSelect, { modelValue: self.barcodeFormat, 'onUpdate:modelValue': function (v) { self.barcodeFormat = v; } }, function () { return ['CODE128','EAN13','EAN8','UPC','CODE39'].map(function (value) { return h(ElOption, { label: value, value: value }); }); }); }),
              h(ElFormItem, { label: 'Display value' }, function () { return h(ElSwitch, { modelValue: self.barcodeDisplayValue, 'onUpdate:modelValue': function (v) { self.barcodeDisplayValue = v; } }); }),
              h(ElFormItem, { label: 'Bar width' }, function () { return h(ElInputNumber, { modelValue: self.barcodeWidth, min: 1, max: 5, 'onUpdate:modelValue': function (v) { self.barcodeWidth = v; } }); }),
              h(ElFormItem, { label: 'Height' }, function () { return h(ElInputNumber, { modelValue: self.barcodeHeight, min: 40, max: 180, 'onUpdate:modelValue': function (v) { self.barcodeHeight = v; } }); })
            ]),
            h('p', { class: 'ymir-vue-media-note' }, self.barcodeMeta)
          ]; }),
          h(ElCard, { class: 'ymir-vue-media-panel', shadow: 'never' }, {
            header: function () { return h('b', null, 'SVG output'); },
            default: function () { return h('div', { class: 'ymir-vue-preview-card ymir-vue-barcode-preview' }, [h('svg', { ref: 'barcodeSvg', 'aria-label': 'Generated barcode' })]); }
          })
        ]);
      }
      if (this.c.kind === 'imageBase64') {
        return h('div', { class: 'ymir-vue-grid' }, [
          h(ElCard, { class: 'ymir-vue-media-panel', shadow: 'never' }, function () { return [
            h('h3', null, 'Image / Base64 input'),
            h('input', { class: 'ymir-vue-file-input', type: 'file', accept: 'image/*', onChange: self.loadImageFile }),
            h('p', { class: 'ymir-vue-media-note' }, 'Choose an image, or paste a data:image Base64 string below.'),
            Shared.renderEditorCard(h, El, { title: 'Base64 data URL', meta: self.inputMeta, value: self.imageText, rows: 13, onInput: function (v) { self.imageText = v; } })
          ]; }),
          h(ElCard, { class: 'ymir-vue-media-panel', shadow: 'never' }, {
            header: function () { return h('b', null, self.previewLabel); },
            default: function () { return h('div', { class: 'ymir-vue-preview-card ymir-vue-image-preview' }, self.imagePreview ? [h('img', { src: self.imagePreview, alt: 'Image preview' })] : [h(ElEmpty, { description: 'No image preview' })]); }
          })
        ]);
      }
      return h('div', { class: 'ymir-vue-drawing-layout' }, [
        h(ElCard, { class: 'ymir-vue-media-panel', shadow: 'never' }, {
          header: function () { return h('b', null, 'Drawing canvas'); },
          default: function () { return [
            h('div', { class: 'ymir-vue-canvas-shell' }, [h('canvas', { ref: 'drawCanvas', class: 'ymir-vue-drawing-canvas', onMousedown: self.beginDraw, onMousemove: self.moveDraw, onMouseup: self.endDraw, onMouseleave: self.endDraw, onTouchstart: self.beginDraw, onTouchmove: self.moveDraw, onTouchend: self.endDraw })]),
            h('div', { class: 'ymir-vue-toolbar' }, [
              h('span', null, 'Color'),
              h('div', { class: 'ymir-vue-color-row' }, self.colors.map(function (color) { return h('button', { key: color, class: 'ymir-vue-color-chip' + (self.drawColor === color ? ' is-active' : ''), style: { background: color }, 'aria-label': 'Color ' + color, onClick: function () { self.drawColor = color; } }); })),
              h('span', null, 'Brush'),
              h('div', { class: 'ymir-vue-size-row' }, [h(ElRadioGroup, { modelValue: self.brushSize, size: 'small', 'onUpdate:modelValue': function (v) { self.brushSize = v; } }, function () { return self.brushSizes.map(function (s) { return h(ElRadioButton, { key: s, label: s }, function () { return s + 'px'; }); }); })])
            ])
          ]; }
        })
      ]);
    },
    renderActions: function (h, El) {
      return Shared.renderActionButtons(h, El, this, this.actionItems, { onRun: function (key) { this.run(key); } });
    }
  });
})();
