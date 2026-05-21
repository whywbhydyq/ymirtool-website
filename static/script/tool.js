$(function () {
    var goTop = $('.gotop');
    goTop.fadeOut();

    injectHomepageGuideEntry();

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

function injectHomepageGuideEntry() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        return;
    }

    if ($('#ymir-guide-entry').length || !$('.quick-section').length) {
        return;
    }

    var guideHtml = '' +
        '<section id="ymir-guide-entry" class="container" style="max-width:1100px;margin:10px auto 12px;">' +
        '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px 18px;box-shadow:0 1px 3px rgba(0,0,0,.04);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px;">' +
        '<div><h2 style="font-size:16px;margin:0 0 4px;color:#0f172a;font-weight:700;">使用指南与新手入口</h2>' +
        '<p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">不知道从哪个工具开始？先阅读指南，了解 JSON、代码格式化、编码、哈希、文本处理和常见问题排查。</p></div>' +
        '<a href="/guides.html" style="display:inline-block;padding:7px 14px;border-radius:7px;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;font-size:13px;">查看全部指南</a>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">' +
        '<a href="/online-toolbox-guide.html" style="padding:8px 10px;border:1px solid #dbe3ef;border-radius:7px;background:#f8fafc;color:#1e293b;text-decoration:none;font-size:13px;font-weight:600;text-align:center;">在线工具箱指南</a>' +
        '<a href="/json-format-guide.html" style="padding:8px 10px;border:1px solid #dbe3ef;border-radius:7px;background:#f8fafc;color:#1e293b;text-decoration:none;font-size:13px;font-weight:600;text-align:center;">JSON 格式化指南</a>' +
        '<a href="/code-formatting-guide.html" style="padding:8px 10px;border:1px solid #dbe3ef;border-radius:7px;background:#f8fafc;color:#1e293b;text-decoration:none;font-size:13px;font-weight:600;text-align:center;">代码格式化指南</a>' +
        '<a href="/encoding-tools-guide.html" style="padding:8px 10px;border:1px solid #dbe3ef;border-radius:7px;background:#f8fafc;color:#1e293b;text-decoration:none;font-size:13px;font-weight:600;text-align:center;">编码转换指南</a>' +
        '<a href="/common-errors-guide.html" style="padding:8px 10px;border:1px solid #dbe3ef;border-radius:7px;background:#f8fafc;color:#1e293b;text-decoration:none;font-size:13px;font-weight:600;text-align:center;">常见问题排查</a>' +
        '</div>' +
        '</div>' +
        '</section>';

    $('.quick-section').after(guideHtml);

    if ($('#top_menu a[href="/guides.html"]').length === 0) {
        $('#top_menu').append('<li><a href="/guides.html">指南</a></li>');
    }
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
    target.attr('data-original-title', msg);
    $('[data-toggle="tooltip"]').tooltip();
    target.tooltip('show');
    target.focus();
    setTimeout(function () {
        target.attr('data-original-title', '');
        target.tooltip('hide');
    }, 4000);
}

$('#BtnClear').on('click', function () {
    $('#content').val('');
    $('#result').val('');
});

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
    var text = $(id).text();
    if (text === '' && $(id).length > 0) {
        text = $(id).val();
    }
    if (text === '') {
        pcjson_com_msg($(selector), '复制失败，请手动复制');
        return false;
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () {
            pcjson_com_msg($(selector), '复制成功');
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
        pcjson_com_msg($(selector), '复制' + msg);
    } catch (err) {
        pcjson_com_msg($(selector), '复制失败,请手动复制');
    }
    document.body.removeChild(textArea);
    return true;
}

function tj() {
    // Reserved for optional analytics hooks.
}

function pcjson_convert(type, t) {
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
