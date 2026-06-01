setJS(["/static/script/pcjs/rmbconvert.js"], function () {
  if (window.jQuery) { jQuery("td,th").addClass("text-center"); }
  window.rmb_convert = function rmb_convert() {
    var digits = window.jQuery ? jQuery("#Digits").val() : "";
    var rmb = typeof convertCurrency === "function" ? convertCurrency(digits) : "";
    if (window.jQuery) {
      jQuery("#txtresult").text(rmb);
      jQuery("#result").val(rmb);
      jQuery("#cost").text(digits);
    }
  };
});
