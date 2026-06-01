KindEditor.ready(function (K) {
  K.create('#content', {
    items: [
      'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'cut', 'copy', 'paste', 'plainpaste', 'wordpaste', '|',
      'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', 'insertorderedlist', 'insertunorderedlist',
      'indent', 'outdent', 'subscript', 'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
      'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
      'strikethrough', 'lineheight', 'removeformat', '|', 'table', 'hr', 'emoticons', 'pagebreak', 'anchor', 'link', 'unlink'
    ],
    filterMode: true,
    wellFormatMode: true,
    allowImageUpload: false,
    allowMediaUpload: false,
    allowFlashUpload: false,
    allowFileManager: false,
    allowImageRemote: false,
    urlType: 'domain'
  });
});
