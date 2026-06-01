var fhtml = false;
var fjs = false;
var fcss = false;
var fself = false;

function ymirEscapeRegExp(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateFilterState(input) {
    var $input = $(input);
    var thisv = $input.val();
    var set = $input.prop('checked');
    if (thisv == 3) {
        if (set) {
            fhtml = false;
            fjs = false;
            fcss = false;
            fself = true;
            $("input[name=type]").eq(0).prop("checked", false);
            $("input[name=type]").eq(1).prop("checked", false);
            $("input[name=type]").eq(2).prop("checked", false);
            $("#place").show();
        }
        else {
            fhtml = false;
            fself = false;
            $("#place").hide();
        }
    }
    else {
        $("#place").hide();
        $("input[name=type]").eq(3).prop("checked", false);
        fself = false;
        switch (thisv) {
            case "0": fhtml = !!set; break;
            case "1": fjs = !!set; break;
            case "2": fcss = !!set; break;
        }
    }
}

$(function () {
    $("pre").hide();
    $("input[name=type]").on("change", function () {
        updateFilterState(this);
    });
});

function Filter() {
    var s = $("#content").val();
    if (fjs) {
        s = s.replace(/<\s*script[^>]*>(.|[\r\n])*?<\s*\/script[^>]*>/gi, '');
    }
    if (fcss) {
        s = s.replace(/<\s*style[^>]*>(.|[\r\n])*?<\s*\/style[^>]*>/gi, '');
    }
    if (fhtml) {
        s = s.replace(/<\/?[^>]+>/g, '');
        s = s.replace(/\&[a-z]+;/gi, '');
    }
    if (fself) {
        var needle = $("#preplace").val();
        if (needle) {
            s = s.replace(new RegExp(ymirEscapeRegExp(needle), 'g'), $("#nextplace").val());
        }
    }
    hightout(s);
}
function Empty() {
    $("#content").val("");
    $("#result").text('');
    $("#content").select();
    $("pre").hide();
}
function hightout(v) {
    $("pre").show();
    $('#result').text(v == null ? '' : String(v));
}
