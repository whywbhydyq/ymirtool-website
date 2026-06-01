(function () {
    var input = document.getElementById('demo_input');
    var label = document.getElementById('update_file_label');
    if (!input || !label) return;
    input.addEventListener('change', function () {
        label.textContent = this.value || '';
    }, false);
}());
