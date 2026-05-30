$(function () {
    var colorStyles = {
        Blue: { border: '#729ea5', head: '#acc8cc', row: '#d4e3e5', text: '#333333', hover: '#ffffff' },
        Green: { border: '#9dcc7a', head: '#abd28e', row: '#bedda7', text: '#333333', hover: '#ffffff' },
        Grey: { border: '#a9a9a9', head: '#b8b8b8', row: '#cdcdcd', text: '#333333', hover: '#ffffff' },
        Orange: { border: '#ebab3a', head: '#e6983b', row: '#f0c169', text: '#333333', hover: '#ffffff' },
        Brown: { border: '#bcaf91', head: '#ded0b0', row: '#e9dbbb', text: '#333333', hover: '#ffffff' },
        Black: { border: '#686767', head: '#171515', row: '#2f2f2f', text: '#fbfbfb', hover: '#171515' }
    };
    function cleanInt(id, fallback, max) {
        var input = document.getElementById(id);
        var value = input ? input.value.replace(/[^0-9]+/g, '') : '';
        var number = parseInt(value, 10);
        if (!Number.isFinite(number) || number < 1) { number = fallback; }
        if (max && number > max) { number = max; }
        if (input) { input.value = String(number); }
        return number;
    }
    function cssFor(design, color, highlight) {
        if (color === 'None' || design === 'noStyle') { return ''; }
        var palette = colorStyles[color] || colorStyles.Blue;
        var row = design === 'minimal' ? '#ffffff' : palette.row;
        var hover = highlight === 'row' ? palette.hover : row;
        var css = '<style type="text/css">\n';
        css += 'table.tftable {font-size:12px;color:' + palette.text + ';width:100%;border-width:1px;border-color:' + palette.border + ';border-collapse:collapse;}\n';
        css += 'table.tftable th {font-size:12px;background-color:' + palette.head + ';border-width:1px;padding:8px;border-style:solid;border-color:' + palette.border + ';text-align:left;}\n';
        css += 'table.tftable tr {background-color:' + row + ';}\n';
        css += 'table.tftable td {font-size:12px;border-width:1px;padding:8px;border-style:solid;border-color:' + palette.border + ';}\n';
        if (highlight === 'row') {
            css += 'table.tftable tr:hover {background-color:' + hover + ';}\n';
        }
        css += '</style>\n\n';
        return css;
    }
    function tableHtml(cols, rows, withInfo) {
        var html = '<table id="tfhover" class="tftable" border="1">\n<tr>';
        for (var c = 1; c <= cols; c++) { html += '<th>Header ' + c + '</th>'; }
        html += '</tr>\n';
        for (var r = 1; r < rows; r++) {
            html += '<tr>';
            for (var cc = 1; cc <= cols; cc++) {
                html += withInfo ? '<td>Row:' + r + ' Cell:' + cc + '</td>' : '<td> </td>';
            }
            html += '</tr>\n';
        }
        html += '</table>\n\n';
        return html;
    }
    function renderPreview(markup) {
        var host = document.getElementById('newTable');
        if (!host) { return; }
        while (host.firstChild) { host.removeChild(host.firstChild); }
        var frame = document.createElement('iframe');
        frame.title = 'Sandboxed HTML table preview';
        frame.setAttribute('sandbox','');
        frame.style.width = '100%';
        frame.style.minHeight = '220px';
        frame.style.border = '1px solid #ddd';
        frame.srcdoc = '<!doctype html><meta charset="utf-8"><base target="_blank">' + markup;
        host.appendChild(frame);
    }
    window.makeTableCode = function () {
        var cols = cleanInt('sizeCols', 5, 50);
        var rows = cleanInt('sizeRows', 7, 200);
        var color = ($('#tableColor').val() || 'Blue');
        var design = ($('#tableDesign').val() || 'all');
        var highlight = ($('#tableHighlight').val() || 'none');
        var withInfo = ($('#tableInfo').val() || '') === 'yesInfo';
        if (color === 'None') { $('#tableDesign').val('noStyle'); design = 'noStyle'; }
        if (design === 'noStyle') { $('#tableColor').val('None'); color = 'None'; }
        var css = cssFor(design, color, highlight);
        var html = tableHtml(cols, rows, withInfo);
        var footer = '<p><small>Created with the HTML Table Generator</small></p>';
        var output = css + html + footer;
        renderPreview(css + html);
        var newCode = document.getElementById('newCode');
        if (newCode) { newCode.value = output; }
    };
    $('#sizeCols,#sizeRows').on('keyup change', window.makeTableCode);
    $('#tableColor,#tableDesign,#tableHighlight,#tableInfo').on('change', window.makeTableCode);
    window.makeTableCode();
});
