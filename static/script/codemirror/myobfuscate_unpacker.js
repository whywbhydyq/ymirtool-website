// CSP-safe partial unpacker for legacy myobfuscate.com snippets.
var MyObfuscate = {
    detect: function (str) {
        if (/^var _?[0O1lI]{3}\=('|\[).*\)\)\);/.test(str)) {
            return true;
        }
        if (/^function _?[0O1lI]{3}\(_/.test(str) && /ev(?:al)?\(/.test(str)) {
            return true;
        }
        return false;
    },

    unpack: function (str) {
        if (!MyObfuscate.detect(str)) return str;
        var warning = "// Unpacker warning: be careful when using myobfuscate.com for your projects:\n" +
            "// scripts obfuscated by the free online version may call back home.\n\n//\n";
        var matches = /var\s+_?[^=]+\s*=\s*'([^']*)'/.exec(str) || /_escape\s*=\s*'([^']*)'/.exec(str);
        if (!matches) return str;
        var unpacked = unescape(matches[1]);
        if (MyObfuscate.starts_with(unpacked, '<script>')) {
            unpacked = unpacked.substr(8, unpacked.length - 8);
        }
        if (MyObfuscate.ends_with(unpacked, '</script>')) {
            unpacked = unpacked.substr(0, unpacked.length - 9);
        }
        return warning + unpacked;
    },

    starts_with: function (str, what) {
        return str.substr(0, what.length) === what;
    },

    ends_with: function (str, what) {
        return str.substr(str.length - what.length, what.length) === what;
    },

    run_tests: function (sanity_test) {
        var t = sanity_test || new SanityTest();
        return t;
    }
};
