function yamlFormat(id) {
    let $code = $('#' + id);

    try {
        let yaml = YAML.parse($code.val());

        let fyaml = YAML.stringify(yaml);
        hightout(JSON.stringify(yaml, null, "  "));
        ymirSafeStatus('#format-message', 'Valid YAML', 'alert-success', 'alert-danger');
    } catch (e) {
        let message = htmlspecialchars(e.message);
        message = message.replace(/[\r\n]+/g, ' ');
        ymirSafeStatus('#format-message', message, 'alert-danger', 'alert-success');
    }
}
function htmlspecialchars(str) {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#039;');

    return str;
}

function json2yaml(id) {
    let $code = $('#' + id);

    try {
        let json = JSON.parse($code.val());

        let fjson = YAML.stringify(json);
        hightout(YAML.stringify(json));
        ymirSafeStatus('#format-message', 'Valid JSON', 'alert-success', 'alert-danger');
    } catch (e) {

        let message = htmlspecialchars(e.message);
        message = message.replace(/[\r\n]+/g, ' ');
        ymirSafeStatus('#format-message', message, 'alert-danger', 'alert-success');
    }
}