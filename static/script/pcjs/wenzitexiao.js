function htmlEncode(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[ch];
    });
}

function randomise() {
    var words = $("#content").val();
    words = words.split(mform.randomiseby.options[mform.randomiseby.selectedIndex].value);
    var code = "";
    var preview = document.createDocumentFragment();
    var colourscheme = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    for (var time = 0; time <= (words.length - 1); time++) {
        if (words[time] == " ") {
            code += " ";
            preview.appendChild(document.createTextNode(" "));
        }
        if (words[time] != " ") {
            var c1 = Math.round(Math.random() * (colourscheme.length - 1));
            var c2 = Math.round(Math.random() * (colourscheme.length - 1));
            var c3 = Math.round(Math.random() * (colourscheme.length - 1));
            var c4 = Math.round(Math.random() * (colourscheme.length - 1));
            var c5 = Math.round(Math.random() * (colourscheme.length - 1));
            var c6 = Math.round(Math.random() * (colourscheme.length - 1));
            var color = "#" + colourscheme[c1] + colourscheme[c2] + colourscheme[c3] + colourscheme[c4] + colourscheme[c5] + colourscheme[c6];
            var size = 1 + Math.round(Math.random() * 6);
            var font = document.createElement("font");
            font.setAttribute("color", color);
            font.setAttribute("size", String(size));
            font.textContent = words[time];
            preview.appendChild(font);
            code += "<font color=\"" + color + "\" size=\"" + size + "\">" + htmlEncode(words[time]) + "</font>";
        }
    }
    document.getElementById("color_text").replaceChildren(preview);
	hightout(code);
}
function Empty() {
    $("#content").val("");
    $("#result").empty();
    $("#color_text").empty();
    document.getElementById("content").select();
}

