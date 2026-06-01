(function () {
    function set(selector, value) {
        var nodes = document.querySelectorAll('[data-browser-info="' + selector + '"]');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].textContent = value == null ? '' : String(value);
        }
    }
    function detectOS() {
        var ua = navigator.userAgent || '';
        var platform = navigator.platform || '';
        var isWin = platform === 'Win32' || platform === 'Windows';
        var isMac = /Mac/.test(platform);
        if (isMac) { return 'Mac'; }
        if (platform === 'X11' && !isWin && !isMac) { return 'Unix'; }
        if (platform.indexOf('Linux') > -1) { return 'Linux'; }
        if (isWin) {
            if (ua.indexOf('Windows NT 5.0') > -1 || ua.indexOf('Windows 2000') > -1) { return 'Win2000'; }
            if (ua.indexOf('Windows NT 5.1') > -1 || ua.indexOf('Windows XP') > -1) { return 'WinXP'; }
            if (ua.indexOf('Windows NT 5.2') > -1 || ua.indexOf('Windows 2003') > -1) { return 'Win2003'; }
            if (ua.indexOf('Windows NT 6.0') > -1 || ua.indexOf('Windows Vista') > -1) { return 'WinVista'; }
            if (ua.indexOf('Windows NT 6.1') > -1 || ua.indexOf('Windows 7') > -1) { return 'Win7'; }
            return 'Windows';
        }
        return 'other';
    }
    function listMimeTypes() {
        var output = [];
        for (var i = 0; i < navigator.mimeTypes.length; i++) {
            var item = navigator.mimeTypes[i];
            output.push('类型: ' + (item.type || ''));
            output.push('描述: ' + (item.description || ''));
            output.push('扩展名: ' + (item.suffixes || ''));
            output.push('附注: ' + (item.enabledPlugin && item.enabledPlugin.name ? item.enabledPlugin.name : ''));
            output.push('');
        }
        return output.join('\n');
    }
    function listPlugins() {
        var output = [];
        for (var i = 0; i < navigator.plugins.length; i++) {
            var item = navigator.plugins[i];
            output.push('名称：' + (item.name || ''));
            output.push('描述：' + (item.description || ''));
            output.push('文件名称：' + (item.filename || ''));
            output.push('');
        }
        return output.join('\n');
    }
    document.addEventListener('DOMContentLoaded', function () {
        set('os', detectOS());
        set('navigator.appName', navigator.appName);
        set('navigator.appVersion', navigator.appVersion);
        set('screen.height', window.screen.height);
        set('screen.width', window.screen.width);
        set('screen.colorDepth', window.screen.colorDepth);
        set('navigator.appCodeName', navigator.appCodeName);
        set('navigator.vendor', navigator.vendor);
        set('navigator.userAgent', navigator.userAgent);
        set('navigator.onLine', navigator.onLine);
        set('navigator.language', navigator.language);
        set('navigator.product', navigator.product);
        set('navigator.productSub', navigator.productSub);
        set('navigator.cookieEnabled', navigator.cookieEnabled);
        set('mimeTypes.length', navigator.mimeTypes.length);
        set('mimeTypes.list', listMimeTypes());
        set('plugins.length', navigator.plugins.length);
        set('plugins.list', listPlugins());
    });
}());
