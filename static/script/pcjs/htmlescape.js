(function ($) {
    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"'`]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '`': '&#x60;'
            }[char];
        });
    }

    function unescapeHtml(value) {
        var textarea = document.createElement('textarea');
        textarea.innerHTML = String(value == null ? '' : value);
        return textarea.value;
    }

    var content = $('#content');

    $('#btn1').on('click', function (event) {
        event.preventDefault();
        hightout(escapeHtml(content.val()));
    });

    $('#btn2').on('click', function (event) {
        event.preventDefault();
        hightout(unescapeHtml(content.val()));
    });
}(jQuery));
