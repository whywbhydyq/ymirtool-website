/* Page-level CSP-safe direct listeners for textflip/index.html. Generated from legacy handlers; do not restore inline handlers. */
(function () {
  'use strict';
  var specs = [{"className":"js-csp-textflip-index-001","events":{"mouseover":[{"type":"focusThis"}]}},{"className":"js-csp-textflip-index-002","events":{"click":[{"type":"call","name":"textflip","args":[]}]}},{"className":"js-csp-textflip-index-003","events":{"click":[{"type":"call","name":"ClearAll","args":[]}]}}];

  var blockedFunctions = Object.create(null);
  ['eval', 'Function', 'setTimeout', 'setInterval', 'execScript', 'alert', 'confirm', 'prompt'].forEach(function (name) {
    blockedFunctions[name] = true;
  });

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function getFormField(el, name) {
    if (!el || !el.form) return null;
    return el.form[name] || null;
  }

  function getArgValue(arg, el, evt) {
    if (!arg) return undefined;
    if (arg.kind === 'this') return el;
    if (arg.kind === 'thisForm') return el && el.form;
    if (arg.kind === 'event') return evt;
    if (arg.kind === 'number' || arg.kind === 'string') return arg.value;
    if (arg.kind === 'valueById') {
      var node = byId(arg.id);
      return node ? node.value : '';
    }
    if (arg.kind === 'numberValueById') {
      var numberNode = byId(arg.id);
      return Number(numberNode ? numberNode.value : '');
    }
    if (arg.kind === 'jqById') {
      if (window.jQuery) return window.jQuery('#' + arg.id);
      return byId(arg.id);
    }
    if (arg.kind === 'elementByIdOrGlobal') {
      var element = byId(arg.name);
      if (element) return element;
      return window[arg.name];
    }
    return arg.value;
  }

  function callWindowFunction(name, args, el, evt) {
    if (!/^[A-Za-z_$][\w$]*$/.test(name) || blockedFunctions[name]) return undefined;
    var fn = window[name];
    if (typeof fn !== 'function') return undefined;
    var resolvedArgs = (args || []).map(function (arg) { return getArgValue(arg, el, evt); });
    return fn.apply(el || window, resolvedArgs);
  }

  function runAction(action, el, evt) {
    var node;
    if (!action) return;
    if (action.type === 'sanitizeNumeric') {
      if (el && typeof el.value === 'string') el.value = el.value.replace(/[^0-9.]/g, '');
      return;
    }
    if (action.type === 'focusThis') {
      if (el && typeof el.focus === 'function') el.focus();
      return;
    }
    if (action.type === 'selectThis') {
      if (el && typeof el.select === 'function') el.select();
      return;
    }
    if (action.type === 'focusById') {
      node = byId(action.id);
      if (node && typeof node.focus === 'function') node.focus();
      return;
    }
    if (action.type === 'selectById') {
      node = byId(action.id);
      if (node && typeof node.select === 'function') node.select();
      return;
    }
    if (action.type === 'focusFormField') {
      node = getFormField(el, action.name);
      if (node && typeof node.focus === 'function') node.focus();
      return;
    }
    if (action.type === 'selectFormField') {
      node = getFormField(el, action.name);
      if (node && typeof node.select === 'function') node.select();
      return;
    }
    if (action.type === 'setValueById') {
      node = byId(action.id);
      if (node) node.value = action.value;
      return;
    }
    if (action.type === 'emptyById') {
      node = byId(action.id);
      if (node) node.textContent = '';
      return;
    }
    if (action.type === 'setValueFromCall') {
      node = byId(action.targetId);
      if (node) {
        var value = callWindowFunction(action.name, action.args, el, evt);
        if (value !== undefined) node.value = value;
      }
      return;
    }
    if (action.type === 'tableSearch') {
      if (window.Public && typeof window.Public.TableSearch === 'function' && window.jQuery) {
        window.Public.TableSearch(window.jQuery('#' + action.tableId), window.jQuery('#' + action.inputId).val());
      }
      return;
    }
    if (action.type === 'call') {
      callWindowFunction(action.name, action.args, el, evt);
      return;
    }
    if (action.type === 'preventDefault') {
      if (evt && typeof evt.preventDefault === 'function') evt.preventDefault();
    }
  }

  function bind(el, eventName, actions) {
    if (!el || !actions || !actions.length) return;
    function run(evt) {
      if (eventName === 'click' && el.tagName === 'A' && el.getAttribute('href') === '#' && evt && typeof evt.preventDefault === 'function') {
        evt.preventDefault();
      }
      actions.forEach(function (action) {
        try {
          runAction(action, el, evt);
        } catch (error) {
          if (window.console && typeof window.console.warn === 'function') {
            window.console.warn('Skipped page listener action:', action && action.type, error);
          }
        }
      });
    }
    if (eventName === 'afterpaste') {
      el.addEventListener('paste', function (evt) { window.setTimeout(function () { run(evt); }, 0); });
      return;
    }
    el.addEventListener(eventName, run);
  }

  onReady(function () {
    specs.forEach(function (spec) {
      var el = document.querySelector('.' + spec.className);
      if (!el) return;
      Object.keys(spec.events).forEach(function (eventName) {
        bind(el, eventName, spec.events[eventName]);
      });
    });
  });
}());
