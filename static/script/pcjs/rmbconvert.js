function convertRMB() {
    var input = document.getElementById('input') || document.getElementById('num');
    var output = document.getElementById('output') || document.getElementById('result');
    if (!input || !output) return;
    var num = input.value.trim();
    if (!num || isNaN(num)) { output.value = ''; return; }
    var neg = '';
    if (parseFloat(num) < 0) { neg = '负'; num = Math.abs(parseFloat(num)).toString(); }
    num = parseFloat(num).toFixed(2);
    var parts = num.split('.');
    var intPart = parts[0];
    var decPart = parts[1];
    var cnNums = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
    var cnIntRadice = ['','拾','佰','仟'];
    var cnIntUnits = ['','万','亿','万亿'];
    var cnDecUnits = ['角','分'];
    var cnInteger = '整';
    var cnIntLast = '元';
    var integerNum = parseInt(intPart);
    var decimalNum = parseInt(decPart);
    var chineseStr = '';
    if (integerNum === 0) { chineseStr = cnNums[0] + cnIntLast; }
    else {
        var zeroCount = 0;
        var i, p, q, n;
        for (i = 0; i < intPart.length; i++) {
            p = intPart.length - i - 1;
            q = p % 4;
            n = parseInt(intPart[i]);
            if (n === 0) { zeroCount++; }
            else {
                if (zeroCount > 0) { chineseStr += cnNums[0]; }
                zeroCount = 0;
                chineseStr += cnNums[n] + cnIntRadice[q];
            }
            if (q === 0 && zeroCount < 4) {
                chineseStr += cnIntUnits[Math.floor(p / 4)];
            }
        }
        chineseStr += cnIntLast;
    }
    if (decimalNum === 0) { chineseStr += cnInteger; }
    else {
        for (i = 0; i < 2; i++) {
            n = parseInt(decPart[i]);
            if (n !== 0) { chineseStr += cnNums[n] + cnDecUnits[i]; }
        }
    }
    output.value = neg + chineseStr;
}
var btn = document.getElementById('convert') || document.getElementById('btn');
if (btn) { btn.addEventListener('click', convertRMB); }
var inp = document.getElementById('input') || document.getElementById('num');
if (inp) { inp.addEventListener('input', convertRMB); }
