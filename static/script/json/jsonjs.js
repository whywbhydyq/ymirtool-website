var Fjson = (function () {
    var _toString = Object.prototype.toString;

    function format(object, indent_count) {
        var html_fragment = '';
        switch (_typeof(object)) {
            case 'Null': 0
                html_fragment = _format_null(object);
                break;
            case 'Boolean':
                html_fragment = _format_boolean(object);
                break;
            case 'Number':
                html_fragment = _format_number(object);
                break;
            case 'String':
                html_fragment = _format_string(object);
                break;
            case 'Array':
                html_fragment = _format_array(object, indent_count);
                break;
            case 'Object':
                html_fragment = _format_object(object, indent_count);
                break;
        }
        return html_fragment;
    };

    function _format_null(object) {
        return '<span class="json_null">null</span>';
    }

    function _format_boolean(object) {
        return '<span class="json_boolean">' + object + '</span>';
    }

    function _format_number(object) {
        return '<span class="json_number">' + object + '</span>';
    }

    function htmlEncode(object) {
        return String(object).replace(/[&<>"']/g, function (char) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[char];
        });
    }

    function attrEncode(object) {
        return htmlEncode(object).replace(/`/g, '&#96;');
    }

    function _format_string(object) {
        object = htmlEncode(object);
        if (0 <= object.search(/^http/)) {
            object = '<a href="' + attrEncode(object) + '" target="_blank" rel="noopener noreferrer" class="json_link">' + object + '</a>'
        }
        return '<span class="json_string">"' + object + '"</span>';
    }

    function _format_array(object, indent_count) {
        var tmp_array = [];
        for (var i = 0, size = object.length; i < size; ++i) {
            tmp_array.push(indent_tab(indent_count) + format(object[i], indent_count + 1));
        }
        return '<span data-type="array" data-size="' + tmp_array.length + '"><i class="fa fa-minus-square-o json_toggle" data-json-toggle="hide"></i>[<br/>'
            + tmp_array.join(',<br/>')
            + '<br/>' + indent_tab(indent_count - 1) + ']</span>';
    }

    function _format_object(object, indent_count) {
        var tmp_array = [];
        for (var key in object) {
            tmp_array.push(indent_tab(indent_count) + '<span class="json_key">"' + htmlEncode(key) + '"</span>:' + format(object[key], indent_count + 1));
        }
        return '<span  data-type="object"><i class="fa fa-minus-square-o json_toggle" data-json-toggle="hide"></i>{<br/>'
            + tmp_array.join(',<br/>')
            + '<br/>' + indent_tab(indent_count - 1) + '}</span>';
    }

    function indent_tab(indent_count) {
        return (new Array(indent_count + 1)).join('&nbsp;&nbsp;&nbsp;&nbsp;');
    }

    function _typeof(object) {
        var tf = typeof object,
            ts = _toString.call(object);
        return null === object ? 'Null' :
            'undefined' == tf ? 'Undefined' :
                'boolean' == tf ? 'Boolean' :
                    'number' == tf ? 'Number' :
                        'string' == tf ? 'String' :
                            '[object Function]' == ts ? 'Function' :
                                '[object Array]' == ts ? 'Array' :
                                    '[object Date]' == ts ? 'Date' : 'Object';
    };

    function loadCssString() {
        var style = document.createElement('style');
        style.type = 'text/css';
        var code = Array.prototype.slice.apply(arguments).join('');
        try {
            style.appendChild(document.createTextNode(code));
        } catch (ex) {
            style.styleSheet.cssText = code;
        }
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    loadCssString(
        '.json_key{ color: #92278f;font-weight:bold;}',
        '.json_null{color: #f1592a;font-weight:bold;}',
        '.json_string{ color: #3ab54a;font-weight:bold;}',
        '.json_number{ color: #25aae2;font-weight:bold;}',
        '.json_link{ color: #717171;font-weight:bold;}',
        '.json_array_brackets{}', '.json_toggle{cursor:pointer;}');

    var _Fjson = function (origin_data) {
        this.data = JSON.parse(origin_data);
    };

    _Fjson.prototype = {
        constructor: Fjson,
        toString: function () {
            return format(this.data, 1);
        }
    }

    return _Fjson;

})();
var last_html = '';
function hide(obj) {
    var parent = obj.parentNode;
    var data_type = parent.getAttribute('data-type');
    var data_size = parent.getAttribute('data-size');
    if (!parent._ymirExpandedNodes) {
        parent._ymirExpandedNodes = [];
        while (parent.firstChild) {
            parent._ymirExpandedNodes.push(parent.removeChild(parent.firstChild));
        }
    } else {
        while (parent.firstChild) { parent.removeChild(parent.firstChild); }
    }
    var icon = document.createElement('i');
    icon.className = 'fa fa-plus-square-o json_toggle';
    icon.setAttribute('data-json-toggle', 'show');
    parent.appendChild(icon);
    if (data_type === 'array') {
        parent.appendChild(document.createTextNode('Array['));
        var size = document.createElement('span');
        size.className = 'json_number';
        size.textContent = data_size || '0';
        parent.appendChild(size);
        parent.appendChild(document.createTextNode(']'));
    } else {
        parent.appendChild(document.createTextNode('Object{...}'));
    }
}

function show(obj) {
    var parent = obj.parentNode;
    var nodes = parent._ymirExpandedNodes || [];
    while (parent.firstChild) { parent.removeChild(parent.firstChild); }
    for (var i = 0; i < nodes.length; i++) {
        parent.appendChild(nodes[i]);
    }
    parent._ymirExpandedNodes = null;
}


(function bindJsonToggle() {
    if (window.__ymirJsonToggleBound) {
        return;
    }
    window.__ymirJsonToggleBound = true;
    document.addEventListener('click', function (event) {
        var target = event.target;
        while (target && target !== document) {
            if (target.getAttribute && target.getAttribute('data-json-toggle')) {
                event.preventDefault();
                if (target.getAttribute('data-json-toggle') === 'show') {
                    show(target);
                } else {
                    hide(target);
                }
                return;
            }
            target = target.parentNode;
        }
    }, false);
})();
