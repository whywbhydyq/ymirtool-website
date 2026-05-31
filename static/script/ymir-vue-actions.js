(function () {
  'use strict';
  var VERSION = '20260531-v55';
  if (window.YmirVueActions && window.YmirVueActions.version === VERSION) return;
  var Core = window.YmirVueCore;
  var Render = window.YmirVueRenderHelpers;
  if (!Core || !Render) return;
  var toText = Core.toText, copyText = Core.copyText, getEl = Core.getEl;
  var renderToolbar = Render.renderToolbar, renderInputOutputPanels = Render.renderInputOutputPanels;
  function resolveToolMessage(value, vm, fallback, action) {
    if (typeof value === 'function') return value(vm, action);
    return value || fallback;
  }
  function setToolStatus(vm, type, message, options) {
    options = options || {};
    var typeKey = options.typeKey || 'statusType';
    var titleKey = options.titleKey || (Object.prototype.hasOwnProperty.call(vm || {}, 'statusTitle') ? 'statusTitle' : 'statusText');
    if (vm) {
      vm[typeKey] = type || 'info';
      vm[titleKey] = resolveToolMessage(message, vm, resolveToolMessage(options.defaultMessage, vm, 'Ready.'), options.action);
    }
  }
  function loadToolSample(vm, config, options) {
    options = options || {};
    config = config || vm && (vm.cfg || vm.c) || {};
    var fields = options.fields || { input: 'sample', second: 'secondarySample' };
    Object.keys(fields).forEach(function (field) {
      if (!vm) return;
      var key = fields[field];
      if (key === false) return;
      vm[field] = config && config[key] != null ? config[key] : '';
    });
    if (vm && options.clearOutput !== false && Object.prototype.hasOwnProperty.call(vm, options.outputField || 'output')) vm[options.outputField || 'output'] = '';
    setToolStatus(vm, 'info', options.message || 'Sample loaded.', options);
  }
  function clearToolState(vm, fields, options) {
    options = options || {};
    fields = Array.isArray(fields) && fields.length ? fields : ['input', 'second', 'output'];
    fields.forEach(function (field) { if (vm && Object.prototype.hasOwnProperty.call(vm, field)) vm[field] = ''; });
    setToolStatus(vm, 'info', options.message || 'Cleared.', options);
  }
  function copyField(vm, field, options) {
    options = options || {};
    var messages = options.messages || options;
    if (messages && typeof messages === 'object') {
      messages = {
        copied: resolveToolMessage(messages.copied || messages.ok, vm, 'Copied.'),
        empty: resolveToolMessage(messages.empty, vm, 'Nothing to copy.'),
        failed: resolveToolMessage(messages.failed || messages.fail, vm, 'Copy failed.')
      };
    }
    return copyText(vm ? vm[field || 'output'] : '', messages, messages && messages.failed);
  }
  function runMappedAction(vm, action, handlers, options) {
    options = options || {};
    handlers = handlers || {};
    var fn = handlers[action];
    if (typeof fn !== 'function') {
      setToolStatus(vm, 'error', resolveToolMessage(options.unknownMessage, vm, 'Unknown action.', action), options);
      return null;
    }
    try {
      var inputField = options.inputField || 'input';
      var secondField = options.secondField || 'second';
      var outputField = options.outputField || 'output';
      var result = options.callWithVm ? fn.call(vm, vm, action) : fn.call(vm, vm ? vm[inputField] : '', vm ? vm[secondField] : '', vm);
      if (result && typeof result.then === 'function') {
        return result.then(function (value) {
          if (options.assignPromiseResult !== false && vm && value != null) vm[outputField] = toText(value);
          setToolStatus(vm, 'success', resolveToolMessage(options.successMessage, vm, 'Output updated.', action), options);
          return value;
        }).catch(function (err) {
          setToolStatus(vm, 'error', err && err.message ? err.message : resolveToolMessage(options.failedMessage, vm, 'Action failed.', action), options);
          return null;
        });
      }
      if (vm && options.assignResult !== false) vm[outputField] = toText(result);
      setToolStatus(vm, 'success', resolveToolMessage(options.successMessage, vm, 'Output updated.', action), options);
      return result;
    } catch (err) {
      setToolStatus(vm, 'error', err && err.message ? err.message : resolveToolMessage(options.failedMessage, vm, 'Action failed.', action), options);
      return null;
    }
  }
  function renderActionButtons(h, El, vm, actions, options) {
    options = options || {};
    var ElButton = getEl(El, 'ElButton');
    actions = Array.isArray(actions) ? actions : [];
    var nodes = actions.map(function (action, index) {
      var item = typeof action === 'string' ? { key: action } : (action || {});
      var key = item.key || item.action || item.label;
      var rawLabel = item.labelText || item.text || item.label || key;
      var label = typeof options.labelFor === 'function' ? options.labelFor(key, item, index) : rawLabel;
      if (label && typeof label === 'object') {
        var lang = (vm && vm.lang) || (window.YmirVueCore && window.YmirVueCore.getLang && window.YmirVueCore.getLang()) || 'en';
        label = label[lang] || label.en || label.zh || key;
      }
      var click = item.onClick || function () { if (options.onRun) options.onRun.call(vm, key, item, index); else if (vm && typeof vm.run === 'function') vm.run(key); };
      return h(ElButton, { type: item.type || (index === 0 && options.primaryFirst !== false ? 'primary' : ''), plain: item.plain, size: item.size, onClick: click }, function () { return label; });
    });
    return options.asToolbar === false ? nodes : renderToolbar(h, { className: options.className || 'ymir-vue-actions', actions: nodes });
  }
  function renderTextWorkbench(h, El, vm, options) {
    options = options || {};
    var inputFooter = options.inputFooter || null;
    var outputFooter = options.outputFooter || null;
    return renderInputOutputPanels(h, El, {
      gridClass: options.gridClass || 'ymir-vue-body',
      inputTitle: options.inputTitle || 'Input',
      inputMeta: options.inputMeta || '',
      inputValue: vm ? vm[options.inputField || 'input'] : '',
      onInput: function (value) { if (vm) vm[options.inputField || 'input'] = value; },
      inputRows: options.inputRows || options.rows || 14,
      inputPlaceholder: options.inputPlaceholder || '',
      inputFooter: inputFooter,
      outputTitle: options.outputTitle || 'Output',
      outputMeta: options.outputMeta || '',
      outputValue: vm ? vm[options.outputField || 'output'] : '',
      outputRows: options.outputRows || options.rows || 14,
      outputPlaceholder: options.outputPlaceholder || '',
      outputReadonly: options.outputReadonly !== false,
      outputFooter: outputFooter
    });
  }
  function createTextToolMethods(options) {
    options = options || {};
    return {
      setStatus: function (type, message) { setToolStatus(this, type, message, options); },
      loadSample: function () { loadToolSample(this, this.cfg || this.c || {}, options.sample || options); },
      clearAll: function () { clearToolState(this, options.clearFields || ['input', 'second', 'output'], options.clear || options); },
      copyOutput: function () { return copyField(this, options.outputField || 'output', options.copy || options); },
      copyInput: function () { return copyField(this, options.inputField || 'input', options.copy || options); },
      run: function (action) { return runMappedAction(this, action, options.handlers || {}, options.run || options); }
    };
  }



  window.YmirVueActions = {
    version: VERSION,
    resolveToolMessage: resolveToolMessage, setToolStatus: setToolStatus, loadToolSample: loadToolSample, clearToolState: clearToolState,
    copyField: copyField, runMappedAction: runMappedAction, renderActionButtons: renderActionButtons, renderTextWorkbench: renderTextWorkbench, createTextToolMethods: createTextToolMethods
  };
})();
