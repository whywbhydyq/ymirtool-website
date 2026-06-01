(function () {
  'use strict';
  var root = document.getElementById('ymir-vue-converter-app');
  if (!root) return;
  if (!window.Vue || !window.ElementPlus) {
    root.innerHTML = '<div class="ymir-vue-noscript">Tool assets failed to load. This tool cannot start.</div>';
    return;
  }
  var Vue = window.Vue;
  var h = Vue.h;
  var ElementPlus = window.ElementPlus;
  var ElButton = ElementPlus.ElButton;
  var ElCard = ElementPlus.ElCard;
  var ElInput = ElementPlus.ElInput;
  var ElAlert = ElementPlus.ElAlert;
  var ElTag = ElementPlus.ElTag;
  var ElRadioGroup = ElementPlus.ElRadioGroup;
  var ElRadioButton = ElementPlus.ElRadioButton;
  var ElSelect = ElementPlus.ElSelect;
  var ElOption = ElementPlus.ElOption;
  var ElMessage = ElementPlus.ElMessage;
  var Shared = window.YmirVueShared || {};
  var normalizeLang = Shared.normalizeLang || function (value) { value = String(value || '').toLowerCase(); return value.indexOf('zh') === 0 || value.indexOf('cn') === 0 ? 'zh' : 'en'; };
  var initialLang = Shared.getLang || function () { try { return normalizeLang(localStorage.getItem('ymir_lang') || navigator.language || 'en'); } catch (e) { return 'en'; } };
  var setGlobalLang = Shared.setLang || function (lang) { try { localStorage.setItem('ymir_lang', lang); } catch(e) {} document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; };
  function finiteNumber(value) {
    var n = Number(String(value || '').trim().replace(/,/g, ''));
    if (!isFinite(n)) throw new Error('Enter a valid number.');
    return n;
  }
  function fmt(n) {
    if (!isFinite(n)) return String(n);
    var abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) return n.toExponential(8).replace(/0+e/, 'e').replace(/\.e/, 'e');
    return Number(n.toPrecision(12)).toLocaleString('en-US', { maximumFractionDigits: 10 });
  }
  function unit(name, zh, symbol, factor) { return { name:name, zh:zh, symbol:symbol, factor:factor }; }
  function tempUnit(name, zh, symbol, toBase, fromBase) { return { name:name, zh:zh, symbol:symbol, toBase:toBase, fromBase:fromBase }; }

  var configs = {
    calcangle: {
      icon:'∠', category:['Unit Converter','单位换算'], title:['Angle Converter','角度换算器'],
      subtitle:['Convert degrees, radians, turns, gradians, arcminutes, and arcseconds quickly.','快速换算度、弧度、圈、百分度、角分和角秒。'],
      sample:'90', base:'degree', baseLabel:'degree', note:['Radians use π-based conversion. Results are rounded for display only.','弧度按 π 换算，显示结果会做适度舍入。'],
      units:[unit('Degree','度','deg',1), unit('Radian','弧度','rad',180/Math.PI), unit('Gradian','百分度','grad',0.9), unit('Turn','圈','turn',360), unit('Arcminute','角分','arcmin',1/60), unit('Arcsecond','角秒','arcsec',1/3600)]
    },
    calcarea: {
      icon:'㎡', category:['Unit Converter','单位换算'], title:['Area Converter','面积换算器'],
      subtitle:['Convert metric, imperial, hectare, and acre area units quickly.','快速换算公制、英制、公顷和英亩等面积单位。'],
      sample:'100', base:'square meter', baseLabel:'square meter', note:['All area units convert through square meters.','所有面积单位统一通过平方米换算。'],
      units:[unit('Square kilometer','平方千米','km²',1000000), unit('Square meter','平方米','m²',1), unit('Square decimeter','平方分米','dm²',0.01), unit('Square centimeter','平方厘米','cm²',0.0001), unit('Square millimeter','平方毫米','mm²',0.000001), unit('Hectare','公顷','ha',10000), unit('Acre','英亩','acre',4046.8564224), unit('Square mile','平方英里','mi²',2589988.110336), unit('Square yard','平方码','yd²',0.83612736), unit('Square foot','平方英尺','ft²',0.09290304), unit('Square inch','平方英寸','in²',0.00064516)]
    },
    calcdata: {
      icon:'KB', category:['Unit Converter','单位换算'], title:['Data Size Converter','数据大小换算器'],
      subtitle:['Convert bytes, decimal KB/MB/GB/TB, and binary KiB/MiB/GiB/TiB.','换算字节、十进制 KB/MB/GB/TB 与二进制 KiB/MiB/GiB/TiB。'],
      sample:'1024', base:'byte', baseLabel:'byte', note:['KB uses 1,000 bytes; KiB uses 1,024 bytes.','KB 按 1000 字节，KiB 按 1024 字节。'],
      units:[unit('Bit','比特','bit',0.125), unit('Byte','字节','B',1), unit('Kilobyte','千字节','KB',1000), unit('Megabyte','兆字节','MB',1000000), unit('Gigabyte','吉字节','GB',1000000000), unit('Terabyte','太字节','TB',1000000000000), unit('Kibibyte','二进制千字节','KiB',1024), unit('Mebibyte','二进制兆字节','MiB',1048576), unit('Gibibyte','二进制吉字节','GiB',1073741824), unit('Tebibyte','二进制太字节','TiB',1099511627776)]
    },
    calcforce: {
      icon:'N', category:['Unit Converter','单位换算'], title:['Force Converter','力换算器'],
      subtitle:['Convert newtons, kilonewtons, kilogram-force, pound-force, and dynes.','换算牛顿、千牛、千克力、磅力和达因。'],
      sample:'10', base:'newton', baseLabel:'newton', note:['Standard gravity is 9.80665 m/s² for kilogram-force.','千克力按标准重力加速度 9.80665 m/s²。'],
      units:[unit('Newton','牛顿','N',1), unit('Kilonewton','千牛','kN',1000), unit('Kilogram-force','千克力','kgf',9.80665), unit('Pound-force','磅力','lbf',4.4482216152605), unit('Dyne','达因','dyn',0.00001), unit('Poundal','磅达','pdl',0.138254954376)]
    },
    calcheat: {
      icon:'J', category:['Unit Converter','单位换算'], title:['Energy / Heat Converter','热量换算器'],
      subtitle:['Convert joules, calories, kilocalories, BTU, watt-hours, and kilowatt-hours.','换算焦耳、卡、千卡、BTU、瓦时和千瓦时。'],
      sample:'1000', base:'joule', baseLabel:'joule', note:['Thermochemical calorie is treated as 4.184 joules.','卡按热化学卡 4.184 焦耳换算。'],
      units:[unit('Joule','焦耳','J',1), unit('Kilojoule','千焦','kJ',1000), unit('Calorie','卡','cal',4.184), unit('Kilocalorie','千卡','kcal',4184), unit('BTU','英热单位','BTU',1055.05585262), unit('Watt-hour','瓦时','Wh',3600), unit('Kilowatt-hour','千瓦时','kWh',3600000)]
    },
    calclength: {
      icon:'m', category:['Unit Converter','单位换算'], title:['Length Converter','长度换算器'],
      subtitle:['Convert metric, imperial, nautical, and common Chinese length units.','换算公制、英制、海里及常用市制长度单位。'],
      sample:'1', base:'meter', baseLabel:'meter', note:['Chinese li is treated as 500 meters; chi is treated as one third of a meter.','里按 500 米，尺按三分之一米近似。'],
      units:[unit('Kilometer','千米','km',1000), unit('Meter','米','m',1), unit('Decimeter','分米','dm',0.1), unit('Centimeter','厘米','cm',0.01), unit('Millimeter','毫米','mm',0.001), unit('Micrometer','微米','µm',0.000001), unit('Nanometer','纳米','nm',0.000000001), unit('Mile','英里','mi',1609.344), unit('Nautical mile','海里','nmi',1852), unit('Yard','码','yd',0.9144), unit('Foot','英尺','ft',0.3048), unit('Inch','英寸','in',0.0254), unit('Li','里','li',500), unit('Zhang','丈','zhang',10/3), unit('Chi','尺','chi',1/3), unit('Cun','寸','cun',1/30)]
    },
    calcpower: {
      icon:'W', category:['Unit Converter','单位换算'], title:['Power Converter','功率换算器'],
      subtitle:['Convert watts, kilowatts, megawatts, horsepower, BTU per hour, and kcal per hour.','换算瓦、千瓦、兆瓦、马力、BTU/小时和千卡/小时。'],
      sample:'1000', base:'watt', baseLabel:'watt', note:['Horsepower uses mechanical horsepower, 745.699872 watts.','马力采用机械马力，1 hp = 745.699872 W。'],
      units:[unit('Watt','瓦','W',1), unit('Kilowatt','千瓦','kW',1000), unit('Megawatt','兆瓦','MW',1000000), unit('Horsepower','马力','hp',745.699872), unit('BTU per hour','英热单位/小时','BTU/h',0.29307107), unit('Kilocalorie per hour','千卡/小时','kcal/h',1.162222222)]
    },
    calcpressure: {
      icon:'Pa', category:['Unit Converter','单位换算'], title:['Pressure Converter','压力换算器'],
      subtitle:['Convert pascal, kilopascal, megapascal, bar, psi, atm, torr, and mmHg.','换算帕、千帕、兆帕、巴、psi、标准大气压、托和毫米汞柱。'],
      sample:'101325', base:'pascal', baseLabel:'pascal', note:['Atmosphere uses 101,325 Pa.','标准大气压按 101,325 Pa。'],
      units:[unit('Pascal','帕','Pa',1), unit('Kilopascal','千帕','kPa',1000), unit('Megapascal','兆帕','MPa',1000000), unit('Bar','巴','bar',100000), unit('PSI','磅/平方英寸','psi',6894.757293168), unit('Atmosphere','标准大气压','atm',101325), unit('Torr','托','torr',133.322368), unit('Millimeter mercury','毫米汞柱','mmHg',133.322387415)]
    },
    calcspeed: {
      icon:'v', category:['Unit Converter','单位换算'], title:['Speed Converter','速度换算器'],
      subtitle:['Convert meters per second, kilometers per hour, miles per hour, feet per second, and knots.','换算米/秒、千米/小时、英里/小时、英尺/秒和节。'],
      sample:'100', base:'meter per second', baseLabel:'meter per second', note:['Knot is treated as 0.514444444 m/s.','节按 0.514444444 m/s 换算。'],
      units:[unit('Meter per second','米/秒','m/s',1), unit('Kilometer per hour','千米/小时','km/h',1/3.6), unit('Mile per hour','英里/小时','mph',0.44704), unit('Foot per second','英尺/秒','ft/s',0.3048), unit('Knot','节','kn',0.514444444)]
    },
    calctemperature: {
      icon:'℃', category:['Unit Converter','单位换算'], title:['Temperature Converter','温度换算器'],
      subtitle:['Convert Celsius, Fahrenheit, Kelvin, and Rankine with correct offset formulas.','使用正确偏移公式换算摄氏、华氏、开尔文和兰氏温度。'],
      sample:'25', base:'celsius', baseLabel:'celsius', note:['Temperature conversion uses affine formulas, not simple ratios.','温度换算使用带偏移的公式，不是简单比例。'], special:'temperature',
      units:[tempUnit('Celsius','摄氏度','°C',function(v){return v;},function(c){return c;}), tempUnit('Fahrenheit','华氏度','°F',function(v){return (v-32)*5/9;},function(c){return c*9/5+32;}), tempUnit('Kelvin','开尔文','K',function(v){return v-273.15;},function(c){return c+273.15;}), tempUnit('Rankine','兰氏度','°R',function(v){return (v-491.67)*5/9;},function(c){return (c+273.15)*9/5;})]
    },
    calcthickness: {
      icon:'mil', category:['Unit Converter','单位换算'], title:['Thickness Converter','厚度换算器'],
      subtitle:['Convert millimeters, micrometers, mils, inches, centimeters, and meters.','换算毫米、微米、密耳、英寸、厘米和米等厚度单位。'],
      sample:'1', base:'millimeter', baseLabel:'millimeter', note:['Mil means one thousandth of an inch, not millimeter.','mil 是密耳，等于 0.001 英寸，不是毫米。'],
      units:[unit('Millimeter','毫米','mm',1), unit('Micrometer','微米','µm',0.001), unit('Nanometer','纳米','nm',0.000001), unit('Mil','密耳','mil',0.0254), unit('Inch','英寸','in',25.4), unit('Centimeter','厘米','cm',10), unit('Meter','米','m',1000)]
    },
    calctime: {
      icon:'s', category:['Unit Converter','单位换算'], title:['Time Converter','时间换算器'],
      subtitle:['Convert milliseconds, seconds, minutes, hours, days, weeks, months, and years.','换算毫秒、秒、分钟、小时、天、周、月和年。'],
      sample:'3600', base:'second', baseLabel:'second', note:['Month uses 30 days; year uses 365 days for simple conversion.','月按 30 天，年按 365 天做简单换算。'],
      units:[unit('Millisecond','毫秒','ms',0.001), unit('Second','秒','s',1), unit('Minute','分钟','min',60), unit('Hour','小时','h',3600), unit('Day','天','d',86400), unit('Week','周','week',604800), unit('Month','月','month',2592000), unit('Year','年','year',31536000)]
    },
    calcvolume: {
      icon:'L', category:['Unit Converter','单位换算'], title:['Volume Converter','体积换算器'],
      subtitle:['Convert liters, milliliters, cubic units, US gallons, quarts, pints, cups, tablespoons, and teaspoons.','换算升、毫升、立方单位、美制加仑、夸脱、品脱、杯、汤匙和茶匙。'],
      sample:'1', base:'liter', baseLabel:'liter', note:['US liquid volume units are used for gallon, quart, pint, cup, tablespoon, and teaspoon.','加仑、夸脱、品脱、杯、汤匙、茶匙采用美制液量单位。'],
      units:[unit('Cubic meter','立方米','m³',1000), unit('Liter','升','L',1), unit('Milliliter','毫升','mL',0.001), unit('Cubic centimeter','立方厘米','cm³',0.001), unit('Cubic inch','立方英寸','in³',0.016387064), unit('Cubic foot','立方英尺','ft³',28.316846592), unit('US gallon','美制加仑','gal',3.785411784), unit('US quart','美制夸脱','qt',0.946352946), unit('US pint','美制品脱','pt',0.473176473), unit('US cup','美制杯','cup',0.2365882365), unit('Tablespoon','汤匙','tbsp',0.0147867648), unit('Teaspoon','茶匙','tsp',0.00492892159)]
    }
  };

  var labels = {
    en:{ eyebrow:'Unit converter', input:'Input value', from:'From unit', results:'Converted results', copyAll:'Copy all results', copy:'Copy', sample:'Load sample', clear:'Clear', statusReady:'Enter a number and select a source unit.', statusOk:'Results updated.', statusErr:'Check the input value.', local:'Ready to use', noUpload:'Copy-ready', formula:'Formula note' },
    zh:{ eyebrow:'单位换算器', input:'输入数值', from:'来源单位', results:'换算结果', copyAll:'复制全部结果', copy:'复制', sample:'载入示例', clear:'清空', statusReady:'输入数值并选择来源单位。', statusOk:'结果已更新。', statusErr:'请检查输入数值。', local:'打开即用', noUpload:'结果可复制', formula:'公式说明' }
  };

  function copyText(text, message) { return (Shared.copyText || function(){ ElMessage.error('Copy failed.'); })(text, { copied: message || 'Copied.', empty: 'Nothing to copy.', failed: 'Copy failed.' }); }

  Shared.mountConfiguredToolApp({
    name:'YmirVueConverterConfiguredApp',
    root:root,
    Vue:Vue,
    ElementPlus:ElementPlus,
    defaultSlug:'calclength',
    rootAttribute:'data-tool',
    tools:configs,
    configKey:'c',
    initialLang:initialLang,
    status:false,
    initialState:function(c, tool){ return { tool:tool, input:c.sample || '1', from:c.units[0].symbol, touched:false, statusType:'info', statusText:'' }; },
    computed:{
      L:function(){ return labels[this.lang] || labels.en; },
      title:function(){ return this.c.title[this.lang==='zh'?1:0]; },
      subtitle:function(){ return this.c.subtitle[this.lang==='zh'?1:0]; },
      category:function(){ return this.c.category[this.lang==='zh'?1:0]; },
      note:function(){ return this.c.note[this.lang==='zh'?1:0]; },
      sourceUnit:function(){ var from=this.from; return this.c.units.filter(function(u){return u.symbol===from;})[0] || this.c.units[0]; },
      baseValue:function(){ var v = finiteNumber(this.input); if (this.c.special === 'temperature') return this.sourceUnit.toBase(v); return v * this.sourceUnit.factor; },
      results:function(){ var base = this.baseValue; var special = this.c.special === 'temperature'; return this.c.units.map(function(u){ var val = special ? u.fromBase(base) : base / u.factor; return { unit:u, value:val, display:fmt(val) + ' ' + u.symbol }; }); },
      resultText:function(){ var self=this; return this.results.map(function(r){ return (self.lang==='zh'?r.unit.zh:r.unit.name) + ' (' + r.unit.symbol + '): ' + r.display; }).join('\n'); },
      statusTitle:function(){ if (this.statusType==='success') return this.L.statusOk; if (this.statusType==='error') return this.statusText || this.L.statusErr; return this.L.statusReady; }
    },
    watch:{ input:function(){ this.recalculate(false); }, from:function(){ this.recalculate(false); } },
    mounted:function(){ setGlobalLang(this.lang); this.recalculate(false); },
    methods:{
      setLang:function(lang){ this.lang=lang; setGlobalLang(lang); },
      unitName:function(u){ return (this.lang==='zh'?u.zh:u.name) + ' (' + u.symbol + ')'; },
      recalculate:function(show){ try { this.results; this.statusType = show ? 'success' : 'info'; this.statusText = ''; } catch(e) { this.statusType='error'; this.statusText=e.message; } },
      loadSample:function(){ if (Shared.loadToolSample) Shared.loadToolSample(this, this.c, { fields:{input:'sample'}, clearOutput:false, titleKey:'statusText', message:'' }); else this.input = this.c.sample || '1'; this.from = this.c.units[0].symbol; this.recalculate(true); },
      clearAll:function(){ if (Shared.clearToolState) Shared.clearToolState(this, ['input'], { titleKey:'statusText', message:'' }); else this.input=''; this.statusType='info'; this.statusText=''; },
      copyAll:function(){ try { if (Shared.copyField) Shared.copyField(this, 'resultText', { copied:this.lang==='zh'?'已复制':'Copied', empty:'Nothing to copy.', failed:'Copy failed.' }); else copyText(this.resultText, this.lang==='zh'?'已复制':'Copied'); } catch(e) { this.statusType='error'; this.statusText=e.message; } },
      copyOne:function(r){ copyText(r.display, this.lang==='zh'?'已复制':'Copied'); },
      renderSelect:function(h){ var self=this; return h(ElSelect,{modelValue:this.from,'onUpdate:modelValue':function(v){self.from=v;},filterable:true,class:'ymir-vue-unit-select'},function(){ return self.c.units.map(function(u){ return h(ElOption,{label:self.unitName(u),value:u.symbol}); }); }); },
      renderResults:function(h, ElementPlus){ var self=this; var cards; try { cards = this.results.map(function(r){ return h('div',{class:'ymir-vue-converter-result'},[h('span',{class:'ymir-vue-result-card__label'},self.unitName(r.unit)),h('code',null,r.display),h(ElButton,{size:'small',plain:true,onClick:function(){self.copyOne(r);}},function(){return self.L.copy;})]); }); } catch(e) { cards=[h('div',{class:'ymir-vue-empty-result'},e.message)]; } return Shared.renderResultCards(h, ElementPlus, { title:self.L.results, meta:self.c.baseLabel, items:cards, gridClass:'ymir-vue-converter-grid', className:'ymir-vue-span-2' }); }
    },
    renderBody:function(h, ElementPlus){
      var self=this;
      var inputCard=Shared.renderOptionPanel(h, ElementPlus, { title:self.L.input, meta:self.sourceUnit.symbol, default:function(){return h('div',{class:'ymir-vue-options'},[
        h('label',{class:'ymir-vue-field'},[h('span',null,self.L.input),h(ElInput,{modelValue:self.input,'onUpdate:modelValue':function(v){self.input=v;},placeholder:'100',inputmode:'decimal'})]),
        h('label',{class:'ymir-vue-field'},[h('span',null,self.L.from),self.renderSelect(h)])
      ]);} });
      var formulaCard=Shared.renderOptionPanel(h, ElementPlus, { title:self.L.formula, default:function(){return h('div',{class:'ymir-vue-note-card'},[
        h('p',null,self.note),
        h('p',null,self.lang==='zh'?'输入值会先换算为基准单位，再换算为所有目标单位。':'The input is converted to the base unit first, then converted to every target unit.'),
        h(ElAlert,{type:'info',showIcon:true,closable:false,title:self.statusTitle})
      ]);} });
      return h('div',{class:'ymir-vue-body ymir-vue-body--converter'},[inputCard, formulaCard, this.renderResults(h, ElementPlus)]);
    },
    renderActions:function(h, ElementPlus){
      var self=this;
      return Shared.renderActionButtons(h, ElementPlus, this, [
        {label:self.lang==='zh'?'换算':'Convert', type:'primary', onClick:function(){self.recalculate(true);}},
        {label:self.L.sample, plain:true, onClick:this.loadSample},
        {label:self.L.copyAll, plain:true, onClick:this.copyAll},
        {label:self.L.clear, type:'danger', plain:true, onClick:this.clearAll}
      ], { className:'ymir-vue-actions', primaryFirst:false });
    },
    shell:function(){
      return {
        appClass:'ymir-vue-app--converter ymir-vue-app--'+this.tool,
        icon:this.c.icon,
        eyebrow:this.L.eyebrow,
        category:this.category,
        title:this.title,
        subtitle:this.subtitle,
        tags:[{label:this.category,type:'primary'},{label:this.L.formula,type:'warning'}],
        lang:this.lang,
        onLangChange:this.setLang,
        footerTags:[{label:this.category,type:'primary'},{label:this.sourceUnit.symbol+' → '+this.c.baseLabel,type:'info'}]
      };
    }
  });
})();
