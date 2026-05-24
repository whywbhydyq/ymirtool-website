(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    onReady(function () {
        initJqueryFeatures(0);
        refineLegacyLabels();
    });

    function initJqueryFeatures(retryCount) {
        if (!window.jQuery) {
            if (retryCount < 80) {
                setTimeout(function () {
                    initJqueryFeatures(retryCount + 1);
                }, 50);
            }
            return;
        }

        var $ = window.jQuery;

        $(function () {
            var goTop = $('.gotop');
            goTop.fadeOut();

            $(window).on('scroll', function () {
                $(this).scrollTop() > 100 ? goTop.fadeIn() : goTop.fadeOut();
            });

            $('button[data-loading-text]').on('click', function () {
                var btn = $(this).button('loading');
                setTimeout(function () {
                    btn.button('reset');
                }, 1500);
            });

            $('#copyallcode').on('click', function () {
                copyTxtToClipboard($(this).attr('data-clipboard-target'));
            });

            $('#top_menu a,.footer-nav li a,.hbflag li a').on('click', function () {
                var href = $(this).attr('href');
                var text = $.trim($(this).text());

                if (!href || href === 'javascript:;' || !text) {
                    return;
                }

                try {
                    var current = text + '-' + href;
                    var history = localStorage.getItem('visit_history');
                    var items = history ? history.split('|') : [];
                    var next = [current];

                    for (var i = 0; i < items.length && next.length < 8; i++) {
                        if (items[i] && items[i] !== current) {
                            next.push(items[i]);
                        }
                    }

                    localStorage.setItem('visit_history', next.join('|'));
                } catch (err) {
                    // Ignore storage errors in private mode or restricted browsers.
                }
            });

            try {
                var visitHistory = localStorage.getItem('visit_history');
                if (visitHistory) {
                    var html = '';
                    var entries = visitHistory.split('|');
                    for (var j = 0; j < entries.length; j++) {
                        var index = entries[j].lastIndexOf('-');
                        if (index <= 0) continue;
                        var label = entries[j].slice(0, index);
                        var url = entries[j].slice(index + 1);
                        html += '<a class="btn btn-success btn-xs" style="margin-left:5px;display:inline-block;" href="' + escapeAttr(url) + '">' + escapeHtml(label) + '</a>';
                    }
                    if (html) {
                        $('#visit_history').parent().show();
                        $('#visit_history').html(html);
                    }
                } else {
                    $('#foot-history').hide();
                }
            } catch (err) {
                $('#foot-history').hide();
            }
        });
    }
})();

function refineLegacyLabels() {
    var labels = {
        '/md5/': 'MD5 哈希工具',
        '/base64/': 'Base64 编解码',
        '/shaencrypt/': 'SHA / SHA256 摘要',
        '/allencrypt/': '哈希摘要工具集合',
        '/formatjs/': 'JavaScript 格式化/压缩'
    };

    Object.keys(labels).forEach(function (href) {
        var links = document.querySelectorAll('a[href="' + href + '"]');
        for (var i = 0; i < links.length; i++) {
            links[i].textContent = labels[href];
        }
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char];
    });
}

function escapeAttr(value) {
    var text = String(value || '');
    if (/^\s*javascript:/i.test(text)) {
        return '#';
    }
    return escapeHtml(text);
}

function pcjson_com_msg(target, msg) {
    if (!window.jQuery || !target || typeof target.attr !== 'function') {
        return;
    }
    target.attr('data-original-title', msg);
    window.jQuery('[data-toggle="tooltip"]').tooltip();
    target.tooltip('show');
    target.focus();
    setTimeout(function () {
        target.attr('data-original-title', '');
        target.tooltip('hide');
    }, 4000);
}

function getElementTextOrValue(id) {
    if (window.jQuery) {
        var $ = window.jQuery;
        var text = $(id).text();
        if (text === '' && $(id).length > 0) {
            text = $(id).val();
        }
        return text;
    }
    var element = document.querySelector(id);
    return element ? (element.textContent || element.value || '') : '';
}

function bindClearButtonWhenReady() {
    if (!window.jQuery) {
        setTimeout(bindClearButtonWhenReady, 50);
        return;
    }
    window.jQuery('#BtnClear').on('click', function () {
        window.jQuery('#content').val('');
        window.jQuery('#result').val('');
    });
}
bindClearButtonWhenReady();

var setJS = function (jsArr) {
    var i = 0, len = jsArr.length;
    for (i; i < len; i++) {
        var script = document.createElement('script');
        script.setAttribute('src', jsArr[i]);
        script.setAttribute('type', 'text/javascript');
        document.body.appendChild(script);
    }
};

function copyTxtToClipboard(id, selector) {
    selector = (typeof selector === 'undefined' || selector === '') ? '#copyallcode' : selector;
    var text = getElementTextOrValue(id);
    if (text === '') {
        if (window.jQuery) pcjson_com_msg(window.jQuery(selector), '复制失败，请手动复制');
        return false;
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () {
            if (window.jQuery) pcjson_com_msg(window.jQuery(selector), '复制成功');
        }).catch(function () {
            legacyCopyText(text, selector);
        });
        return true;
    }

    return legacyCopyText(text, selector);
}

function legacyCopyText(text, selector) {
    var textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var msg = document.execCommand('copy') ? '成功' : '失败';
        if (window.jQuery) pcjson_com_msg(window.jQuery(selector), '复制' + msg);
    } catch (err) {
        if (window.jQuery) pcjson_com_msg(window.jQuery(selector), '复制失败,请手动复制');
    }
    document.body.removeChild(textArea);
    return true;
}

function tj() {
    // Reserved for optional analytics hooks.
}

function pcjson_convert(type, t) {
    if (!window.jQuery) return false;
    var $ = window.jQuery;
    var text = $('#content').val();
    t = (typeof t === 'undefined' || t === '') ? 0 : t;
    return text.length <= 0 ? (pcjson_com_msg($('#content'), '请输入要处理的内容'), $('#content').focus(), !1) : 6e3 < text.length ? (pcjson_com_msg($('#content'), '需处理的内容长度不能超过6000!'), $('#content').focus(), !1) : (void $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/api/',
        data: {
            text: text,
            id: t,
            type: type
        },
        success: function (t) {
            if (1 != t.status) return pcjson_com_msg($('#content'), t.msg), !1;
            hightout(t.msg);
        },
        error: function () {
            pcjson_com_msg($('#content'), '处理失败');
        }
    }));
}
