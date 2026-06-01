// CSP-safe unpacker for Dean Edwards p.a.c.k.e.r output.
var P_A_C_K_E_R = {
    detect: function (str) {
        return (P_A_C_K_E_R.get_chunks(str).length > 0);
    },

    get_chunks: function (str) {
        var chunks = String(str || '').match(/ev(?:al)?\(\(?function\([\s\S]*?(,0,\{\}\)\)|split\('\|'\)\)\))($|\n)/g);
        return chunks ? chunks : [];
    },

    split_args: function (text) {
        var args = [], buf = '', quote = '', escaped = false, depth = 0;
        for (var i = 0; i < text.length; i += 1) {
            var ch = text.charAt(i);
            if (escaped) { buf += ch; escaped = false; continue; }
            if (ch === '\\') { buf += ch; escaped = true; continue; }
            if (quote) { buf += ch; if (ch === quote) quote = ''; continue; }
            if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
            if (ch === '(' || ch === '[' || ch === '{') depth += 1;
            if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
            if (ch === ',' && depth === 0) { args.push(buf.trim()); buf = ''; continue; }
            buf += ch;
        }
        if (buf.trim()) args.push(buf.trim());
        return args;
    },

    unquote: function (text) {
        var raw = String(text || '').trim();
        if ((raw.charAt(0) === '"' && raw.charAt(raw.length - 1) === '"') ||
            (raw.charAt(0) === "'" && raw.charAt(raw.length - 1) === "'")) {
            return raw.slice(1, -1)
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\t/g, '\t')
                .replace(/\\(['"\\])/g, '$1');
        }
        return raw;
    },

    unpack_keywords: function (arg) {
        var match = String(arg || '').match(/^(['"])([\s\S]*)\1\.split\(\s*['"]\|['"]\s*\)$/);
        return match ? P_A_C_K_E_R.unquote(match[1] + match[2] + match[1]).split('|') : [];
    },

    encode_base: function (num, base) {
        return (num < base ? '' : P_A_C_K_E_R.encode_base(parseInt(num / base, 10), base)) +
            ((num = num % base) > 35 ? String.fromCharCode(num + 29) : num.toString(36));
    },

    get_invocation_args: function (str) {
        var text = String(str || '');
        var marker = "'.split('|')";
        var markerIndex = text.indexOf(marker);
        if (markerIndex < 0) return null;
        var open = text.lastIndexOf('(', markerIndex);
        if (open < 0) return null;
        var close = text.length - 1;
        while (close > open && /[\s;)]/.test(text.charAt(close))) close -= 1;
        return text.slice(open + 1, close + 1);
    },

    unpack_chunk: function (str) {
        var argsText = P_A_C_K_E_R.get_invocation_args(str);
        if (!argsText) return str;
        var args = P_A_C_K_E_R.split_args(argsText);
        if (args.length < 4) return str;
        var packed = P_A_C_K_E_R.unquote(args[0]);
        var base = parseInt(args[1], 10) || 62;
        var count = parseInt(args[2], 10) || 0;
        var keywords = P_A_C_K_E_R.unpack_keywords(args[3]);
        while (count--) {
            if (keywords[count]) {
                packed = packed.replace(new RegExp('\\b' + P_A_C_K_E_R.encode_base(count, base) + '\\b', 'g'), keywords[count]);
            }
        }
        return packed;
    },

    unpack: function (str) {
        var chunks = P_A_C_K_E_R.get_chunks(str), chunk;
        for (var i = 0; i < chunks.length; i++) {
            chunk = chunks[i].replace(/\n$/, '');
            str = str.split(chunk).join(P_A_C_K_E_R.unpack_chunk(chunk));
        }
        return str;
    },

    run_tests: function (sanity_test) {
        var t = sanity_test || new SanityTest();
        return t;
    }
};
