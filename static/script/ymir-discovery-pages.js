(function () {
  'use strict';

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ').trim();
  }

  function init(root) {
    var input = root.querySelector('[data-discovery-search]');
    var filters = Array.from(root.querySelectorAll('[data-discovery-filter]'));
    var cards = Array.from(root.querySelectorAll('[data-discovery-card]'));
    var groups = Array.from(root.querySelectorAll('[data-discovery-group]'));
    var counters = Array.from(root.querySelectorAll('[data-discovery-count]'));
    var empty = root.querySelector('[data-discovery-empty]');
    var resets = Array.from(root.querySelectorAll('[data-discovery-reset]'));
    var unit = root.getAttribute('data-discovery-unit') || '项目';
    var activeCategory = 'all';

    function setActiveFilter(value) {
      activeCategory = value || 'all';
      filters.forEach(function (button) {
        var active = button.getAttribute('data-discovery-filter') === activeCategory;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function update() {
      var query = normalize(input && input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var category = card.getAttribute('data-discovery-category') || '';
        var categoryMatch = activeCategory === 'all' || category === activeCategory;
        var queryMatch = !query || normalize(card.getAttribute('data-search')).includes(query);
        var shown = categoryMatch && queryMatch;
        card.hidden = !shown;
        if (shown) visible += 1;
      });
      groups.forEach(function (group) {
        group.hidden = !group.querySelector('[data-discovery-card]:not([hidden])');
      });
      counters.forEach(function (counter) {
        counter.textContent = '显示 ' + visible + ' 个' + unit;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        setActiveFilter(button.getAttribute('data-discovery-filter'));
        update();
      });
    });
    if (input) input.addEventListener('input', update);
    resets.forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) input.value = '';
        setActiveFilter('all');
        update();
        if (input) input.focus();
      });
    });

    setActiveFilter('all');
    update();
  }

  function initAll() {
    document.querySelectorAll('[data-discovery-root]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }
})();
