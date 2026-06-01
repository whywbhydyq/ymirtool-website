var toMarkdown = function (htmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(String(htmlText == null ? '' : htmlText), 'text/html');

    function text(node) {
        if (!node) return '';
        if (node.nodeType === 3) return node.nodeValue;
        if (node.nodeType !== 1) return '';
        var tag = node.tagName.toLowerCase();
        var children = Array.prototype.map.call(node.childNodes, text).join('');
        switch (tag) {
            case 'p': return '\n\n' + children.trim() + '\n';
            case 'br': return '\n';
            case 'h1': return '\n\n# ' + children.trim() + '\n';
            case 'h2': return '\n\n## ' + children.trim() + '\n';
            case 'h3': return '\n\n### ' + children.trim() + '\n';
            case 'h4': return '\n\n#### ' + children.trim() + '\n';
            case 'h5': return '\n\n##### ' + children.trim() + '\n';
            case 'h6': return '\n\n###### ' + children.trim() + '\n';
            case 'strong':
            case 'b': return '**' + children + '**';
            case 'em':
            case 'i': return '_' + children + '_';
            case 'code': return '`' + children + '`';
            case 'pre': return '\n\n```\n' + node.textContent.replace(/^\n|\n$/g, '') + '\n```\n';
            case 'a':
                var href = node.getAttribute('href') || '';
                return href ? '[' + children + '](' + href + ')' : children;
            case 'img':
                var src = node.getAttribute('src') || '';
                var alt = node.getAttribute('alt') || '';
                return src ? '![' + alt + '](' + src + ')' : '';
            case 'li': return '* ' + children.trim() + '\n';
            case 'ul':
            case 'ol': return '\n' + children + '\n';
            case 'blockquote': return '\n' + children.trim().replace(/^/gm, '> ') + '\n';
            default: return children;
        }
    }

    return Array.prototype.map.call(doc.body.childNodes, text).join('').replace(/\n{3,}/g, '\n\n').trim();
};

var demo = "# MarkDown示例代码"
    + "\n"
    + "### Header 3"
    + "\n"
    + "> This is a blockquote.www.pcjson.com\n"
    + ">\n "
    + "> This is the second paragraph in the blockquote.\n"
    + ">\n"
    + "> ## This is an H2 in a blockquote";

function markdowndemo() {
    $("#content").val(demo);
}
function html2markdown() {
    var content = $('#content').val();
    if (!content) {
        pcjson_com_msg($("#content"), "请输入要处理的HTML内容");
    }
    else {
        hightout(toMarkdown(content));
    }
}
function markdown2html() {
    var content = $('#content').val();
    if (!content) {
        pcjson_com_msg($("#content"), "请输入要处理的MarkDown内容");
    }
    else {
        hightout(markdown.toHTML(content));
    }
}
if (typeof exports === 'object') { exports.toMarkdown = toMarkdown; }
