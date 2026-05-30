document.addEventListener('DOMContentLoaded',function(){
  var input=document.getElementById('toolSearch');
  var cards=[].slice.call(document.querySelectorAll('[data-tool-name]'));
  var sections=[].slice.call(document.querySelectorAll('.ymir-category'));
  var noResult=document.getElementById('noResult');
  function searchableText(a){
    return [
      a.getAttribute('data-tool-name')||'',
      a.getAttribute('data-tool-keywords')||'',
      a.getAttribute('data-i18n-zh')||'',
      a.getAttribute('data-i18n-en')||'',
      a.getAttribute('href')||'',
      a.textContent||''
    ].join(' ').toLowerCase();
  }
  function filter(){
    var q=(input.value||'').trim().toLowerCase();
    var visible=0;
    cards.forEach(function(a){
      var hit=!q || searchableText(a).indexOf(q)>-1;
      a.style.display=hit?'':'none';
      if(hit) visible++;
    });
    sections.forEach(function(sec){
      var any=[].slice.call(sec.querySelectorAll('[data-tool-name]')).some(function(a){return a.style.display!=='none';});
      sec.style.display=any?'':'none';
    });
    if(noResult) noResult.style.display=visible?'none':'block';
  }
  if(input) input.addEventListener('input',filter);
});
