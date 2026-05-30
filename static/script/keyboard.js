(function () {
  'use strict';

  function resetKeyButtons() {
    var root = document.getElementById('anjian_test');
    if (!root) return;
    var buttons = root.getElementsByTagName('div');
    for (var i = 0; i < buttons.length; i += 1) {
      if (buttons[i].className === 'anjian-btn') {
        buttons[i].style.backgroundColor = '#FFFFFF';
      }
    }
  }

  function flashButton(button) {
    if (!button) return;
    button.style.backgroundColor = '#FFCA13';
    window.setTimeout(function () {
      button.style.backgroundColor = '#BEE367';
    }, 100);
  }

  function handleKeyDown(evt) {
    var event = evt || window.event;
    var keyCode = event && (event.keyCode || event.which);
    if (!keyCode) return false;

    flashButton(document.getElementById('btn_id_' + keyCode));
    flashButton(document.getElementById('btn_id_' + keyCode + '_2'));
    return false;
  }

  window.keyboard_reset = resetKeyButtons;

  document.addEventListener('keydown', function (evt) {
    handleKeyDown(evt);
  }, true);
}());
