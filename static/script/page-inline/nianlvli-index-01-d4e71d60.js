(function () {
  'use strict';

  function toNumber(value) {
    var num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  function toInteger(value) {
    var num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  }

  if (!window.jQuery) return;

  window.jQuery(function ($) {
    $('.cal_1').on('click', function () {
      var principal = toNumber($('.bj1').val());
      var annualRate = toNumber($('.nianhua1').val());
      var days = toInteger($('.day1').val());
      var interest = principal * annualRate / 100 * days / 365;
      $('.lixi1').val(interest);
    });

    $('.cal_2').on('click', function () {
      var principal = toNumber($('.bj2').val());
      var days = toInteger($('.day2').val());
      var interest = toNumber($('.lixi2').val());
      var annualRate = principal && days ? interest * 365 / (principal * days) : 0;
      $('.nianhua2').val(annualRate * 100);
    });
  });
}());
