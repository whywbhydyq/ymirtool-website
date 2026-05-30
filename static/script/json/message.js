/*
 * Legacy message overlay, rewritten to render caller text with textContent.
 */
(function ($) {
    var container = $('#jquery-beauty-msg');
    if (container.length <= 0) {
        $('body').append('<div style="clear:both;"></div><div id="jquery-beauty-msg"></div>');
        container = $('#jquery-beauty-msg');
    }
    var baseStyle = 'color:#e1282b;font-family:"Microsoft YaHei",Arial,sans-serif;font-weight:bold;font-size:20px;text-shadow:5px 5px 10px #bbb;text-align:center;margin:0;padding-top:20%;width:100%;word-break:break-all;z-index:100000;';
    var closeFlag = false;
    var timer = 0;
    var intervalId = null;
    var msgContent = '';
    function setMessage(text) {
        container.text(text == null ? '' : String(text));
    }
    $.msg = function (txt, style, obj) {
        msgContent = txt;
        var containerStyle = baseStyle;
        if (obj !== 'undefined' && obj != null) {
            containerStyle += 'position:relative;top:' + $(obj).attr('top') + ';left:' + $(obj).attr('left') + ';';
        } else {
            containerStyle += 'position:fixed;top:0;left:0;';
        }
        container.attr('style', containerStyle + (style || ''));
        setMessage(msgContent);
        container.fadeIn(300, function () {
            container.animate({ fontSize: '40px' }, '300');
            container.delay(1000).fadeOut();
        });
    };
    window.addDot = function () {
        msgContent = String(msgContent || '') + '.';
        setMessage(msgContent);
        timer += 1;
        if (!closeFlag && timer >= 5) {
            setMessage('操作超时！');
            window.clearInterval(intervalId);
            intervalId = null;
        }
    };
    $.loading = function (txt, action) {
        msgContent = txt;
        container.attr('style', baseStyle + 'position:fixed;top:0;left:0;color:blue;');
        setMessage(msgContent);
        if (action !== 'close') {
            closeFlag = false;
            timer = 0;
            container.fadeIn(300, function () {
                container.animate({ fontSize: '40px' }, '300');
            });
            if (intervalId) { window.clearInterval(intervalId); }
            intervalId = window.setInterval(window.addDot, 1000);
        } else {
            closeFlag = true;
            if (intervalId) { window.clearInterval(intervalId); intervalId = null; }
            container.fadeOut();
        }
    };
}(jQuery));
