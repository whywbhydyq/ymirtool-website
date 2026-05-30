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
        initRunJsSandbox();
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
                    var container = document.getElementById('visit_history');
                    var entries = visitHistory.split('|');
                    var added = 0;
                    if (container) {
                        while (container.firstChild) {
                            container.removeChild(container.firstChild);
                        }
                        for (var j = 0; j < entries.length; j++) {
                            var index = entries[j].lastIndexOf('-');
                            if (index <= 0) continue;
                            var label = entries[j].slice(0, index);
                            var url = escapeAttr(entries[j].slice(index + 1));
                            if (!url || url === '#') continue;
                            var link = document.createElement('a');
                            link.className = 'btn btn-success btn-xs';
                            link.style.marginLeft = '5px';
                            link.style.display = 'inline-block';
                            link.setAttribute('href', url);
                            link.textContent = label;
                            container.appendChild(link);
                            added++;
                        }
                    }
                    if (added) {
                        $('#visit_history').parent().show();
                    } else {
                        $('#foot-history').hide();
                    }
                } else {
                    $('#foot-history').hide();
                }
            } catch (err) {
                $('#foot-history').hide();
            }
        });
    }

    function initRunJsSandbox() {
        var content = document.getElementById('content');
        if (!content || typeof window.webdebug !== 'function') {
            return;
        }

        var runButton = document.querySelector('input[onclick="webdebug();"]');
        if (!runButton) {
            return;
        }

        window.webdebug = function () {
            var frame = document.getElementById('ymir-runjs-preview');
            if (!frame) {
                frame = document.createElement('iframe');
                frame.id = 'ymir-runjs-preview';
                frame.title = 'Sandboxed HTML/CSS/JS preview';
                frame.setAttribute('sandbox', 'allow-scripts');
                frame.style.width = '100%';
                frame.style.minHeight = '420px';
                frame.style.marginTop = '12px';
                frame.style.border = '1px solid #ddd';
                frame.style.background = '#fff';
                runButton.parentNode.parentNode.parentNode.appendChild(frame);
            }
            frame.srcdoc = content.value || '';
        };
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


function ymirSafeSetText(target, value) {
    var node = typeof target === 'string' ? document.querySelector(target) : target;
    if (node) {
        node.textContent = value == null ? '' : String(value);
    }
    return node;
}
function ymirSafeClear(target) {
    var node = typeof target === 'string' ? document.querySelector(target) : target;
    if (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    return node;
}
function ymirSafeStatus(selector, message, addClass, removeClass) {
    var node = ymirSafeSetText(selector, message);
    if (node && window.jQuery) {
        var $node = jQuery(node);
        if (removeClass) { $node.removeClass(removeClass); }
        if (addClass) { $node.addClass(addClass); }
        $node.removeClass('d-none').addClass('d-block');
    }
    return node;
}
function ymirSafeUrl(value) {
    var url = String(value || '').trim();
    if (!url || /^\s*(javascript|data|vbscript):/i.test(url)) {
        return '';
    }
    return url;
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

var setJS = function (jsArr, callback) {
    var list = Array.isArray(jsArr) ? jsArr.slice() : [];
    var index = 0;
    var done = false;
    var callbacks = [];

    function finish() {
        if (done) {
            return;
        }
        done = true;
        if (typeof callback === 'function') {
            callbacks.push(callback);
        }
        while (callbacks.length) {
            var fn = callbacks.shift();
            try {
                fn();
            } catch (err) {
                setTimeout(function () { throw err; }, 0);
            }
        }
    }

    function loadNext() {
        if (index >= list.length) {
            finish();
            return;
        }

        var src = list[index++];
        if (!src) {
            loadNext();
            return;
        }

        var existing = document.querySelector('script[src="' + src.replace(/"/g, '\"') + '"]');
        if (existing && existing.getAttribute('data-ymir-loaded') === 'true') {
            loadNext();
            return;
        }

        var script = existing || document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.async = false;
        script.onload = function () {
            script.setAttribute('data-ymir-loaded', 'true');
            loadNext();
        };
        script.onerror = function () {
            script.setAttribute('data-ymir-load-error', 'true');
            loadNext();
        };
        if (!existing) {
            script.setAttribute('src', src);
            document.body.appendChild(script);
        } else {
            loadNext();
        }
    }

    loadNext();

    return {
        then: function (fn) {
            if (typeof fn !== 'function') {
                return;
            }
            if (done) {
                fn();
            } else {
                callbacks.push(fn);
            }
        }
    };
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
    var target = document.getElementById('content');
    var value = getElementTextOrValue(target).trim();
    if (value === '') {
        pcjson_com_msg($('#content'), '请输入要处理的内容');
        return false;
    }
    pcjson_com_msg($('#content'), '当前静态版本不再请求远程接口，请使用页面内的本地转换功能。');
    return false;
}


(function () {
    function renderRunJsPreview() {
        var content = document.getElementById('content');
        if (!content) { return; }
        var frame = document.getElementById('ymir-runjs-preview');
        if (!frame) {
            frame = document.createElement('iframe');
            frame.id = 'ymir-runjs-preview';
            frame.title = 'Sandboxed HTML/CSS/JS preview';
            frame.setAttribute('sandbox', 'allow-scripts');
            frame.style.width = '100%';
            frame.style.minHeight = '420px';
            frame.style.marginTop = '12px';
            frame.style.border = '1px solid #ddd';
            frame.style.background = '#fff';
            var form = content.closest ? content.closest('form') : null;
            (form || document.body).appendChild(frame);
        }
        frame.srcdoc = content.value || '';
    }
    window.ymirRunJsSandbox = renderRunJsPreview;
    document.addEventListener('DOMContentLoaded', function () {
        if (document.getElementById('content') && /\/runjs\/?$/.test(window.location.pathname)) {
            window.webdebug = renderRunJsPreview;
        }
    });
}());
