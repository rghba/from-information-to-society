(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const data = window.SERIES_CONTENT || {};
  const catalog = window.SERIES_CATALOG || {episodes:[]};
  const $main = $('main-content');
  const ui = {
    fa: {
      brand:'از اطلاعات تا جامعه',intro:'معرفی', library:'فهرست نوشته‌ها', introduction:'معرفی مجموعه', episode:'قسمت',
      poster:'پوستر اصلی',posterCaption:'برای بزرگ‌نمایی تصویر، آن را انتخاب کنید',read:'خواندن متن',share:'کپی پیوند صفحه',
      article:'متن کامل',end:'پایان معرفی',endEpisode:'پایان نوشته',readAll:'فهرست نوشته‌ها',overview:'نقشه مسیر',
      librarySubtitle:'معرفی در جای خود می‌ماند و هر نوشتهٔ تازه به این فهرست اضافه می‌شود.',
      search:'جست‌وجو در عنوان‌ها', searchPlaceholder:'جست‌وجو...', count:(n)=>n===0?'هنوز قسمت دیگری منتشر نشده است.':`${n} قسمت منتشرشده`,
      noResults:'عنوانی مطابق جست‌وجوی شما پیدا نشد.', missing:'این نوشته هنوز منتشر نشده است.',
      copied:'پیوند این صفحه کپی شد.',copyFailed:'نشانی صفحه را از نوار آدرس مرورگر کپی کنید.',
      goPoster:'دیدن پوستر ↗',titleTag:'معرفی',endNote:'یک مسیر، پرسش‌های بسیار', reading:'خواندن', missingBack:'بازگشت به فهرست',
      notAvailable:'نسخهٔ این زبان برای این نوشته هنوز منتشر نشده است.'
    },
    en: {
      brand:'From Information to Society',intro:'Introduction',library:'Writing index', introduction:'Series introduction', episode:'Episode',
      poster:'Original poster',posterCaption:'Select the image to see the full-size artwork',read:'Read the essay',share:'Copy page link',
      article:'Complete text',end:'End of introduction',endEpisode:'End of essay',readAll:'Writing index',overview:'The map of the journey',
      librarySubtitle:'The introduction stays in place. Each new piece joins this index, at its own permanent address.',
      search:'Search titles',searchPlaceholder:'Search...',count:(n)=>n===0?'No additional episodes published yet.':`${n} published episodes`,
      noResults:'No titles match this search.',missing:'This piece has not been published yet.',
      copied:'Page link copied.',copyFailed:'Copy the address from your browser’s address bar.',
      goPoster:'View poster ↗',titleTag:'Introduction',endNote:'One journey, many questions',reading:'Read',missingBack:'Back to the index',
      notAvailable:'This language edition has not been published yet.'
    }
  };
  const els = {reader:$('reader-page'),library:$('library-page'),missing:$('missing-page')};
  const routeLink=(type,id,lang)=>type==='episode'?`#/episode/${encodeURIComponent(id)}/${lang}`:`#/${type}/${lang}`;
  let route=null;
  let routeGeneration=0;
  let lastToast=null;

  function parseRoute(){
    let decoded;try{decoded=decodeURIComponent(location.hash.slice(1));}catch{decoded='';}
    const parts=decoded.split('/').filter(Boolean);
    const browserLanguage=(navigator.language||'').toLowerCase().startsWith('fa')?'fa':'en';
    if(!parts.length)return {type:'intro',lang:browserLanguage};
    if(parts[0]==='intro'||parts[0]==='library')return {type:parts[0],lang:['en','fa'].includes(parts[1])?parts[1]:browserLanguage};
    if(parts[0]==='episode'&&parts[1])return {type:'episode',id:parts[1],lang:['en','fa'].includes(parts[2])?parts[2]:browserLanguage};
    return {type:'missing',lang:browserLanguage};
  }

  function goTo(type,lang,id){location.hash=routeLink(type,id,lang);}
  function setLocale(lang){
    const strings=ui[lang],isFa=lang==='fa';
    document.documentElement.lang=lang;document.documentElement.dir=isFa?'rtl':'ltr';
    document.body.dir=isFa?'rtl':'ltr';
    $('brand-name').textContent=strings.brand;
    $('home-link').href=routeLink('intro',null,lang);
    $('home-link').setAttribute('aria-label',strings.intro);
    $('nav-intro').textContent=strings.intro;$('nav-library').textContent=strings.library;
    $('nav-intro').href=routeLink('intro',null,lang);
    $('nav-library').href=routeLink('library',null,lang);
    $('footer-brand').textContent=strings.brand;$('footer-note').textContent=strings.endNote;
    $('footer-intro').href=routeLink('intro',null,lang);
    $('footer-intro').firstChild.textContent=strings.intro+' ';
    $('missing-link').textContent=strings.missingBack;
    $('missing-link').href=routeLink('library',null,lang);
    $('missing-title').textContent=strings.missing;
    document.querySelectorAll('[data-lang]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.lang===lang)));
    document.querySelectorAll('[data-route]').forEach(a=>{
      const selected=(route?.type==='library'?'library':'intro')===a.dataset.route;
      a.classList.toggle('is-current',selected);
      if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    $('copy-link').firstChild.textContent=strings.share+' ';
    document.querySelector('[data-lang=en]').textContent=isFa?'انگلیسی':'English';
    $('read-action').firstChild.textContent=strings.read+' ';
    $('all-articles-link').firstChild.textContent=strings.readAll+' ';
    $('poster-label').textContent=strings.poster;
    $('poster-caption').textContent=strings.posterCaption;
    $('article-heading').textContent=strings.article;
    $('rail-poster').textContent=strings.goPoster;
    $('library-kicker').textContent=strings.overview;
    $('library-title').textContent=strings.library;
    $('library-subtitle').textContent=strings.librarySubtitle;
    $('search-label').textContent=strings.search;
    $('library-search').placeholder=strings.searchPlaceholder;
    $('poster-open').setAttribute('aria-label',strings.goPoster);
    $('poster-dialog').setAttribute('aria-label',strings.poster);
    $('poster-close').setAttribute('aria-label',isFa?'بستن تصویر':'Close image');
    $('viewer-title').textContent=strings.poster;
    $('poster-zoom').textContent=isFa?'بزرگ‌نمایی جزئیات':'Zoom in for detail';
  }
  function showPage(which){Object.entries(els).forEach(([k,v])=>{v.hidden=k!==which;});}
  function populateParagraph(p,text,lang){
    // Preserve every original character. The Latin segments are only styled and direction-isolated.
    p.replaceChildren();
    if(lang!=='fa'){p.textContent=text;return;}
    const pieces=text.split(/([A-Za-z]+(?:[’'-][A-Za-z]+)*)/g);
    for(let j=0;j<pieces.length;j++){
      const s=pieces[j];if(!s)continue;
      if(/^[A-Za-z]/.test(s)){const span=document.createElement('span');span.className='inline-latin';span.setAttribute('lang','en');span.setAttribute('dir','ltr');span.textContent=s;p.appendChild(span);}
      else p.appendChild(document.createTextNode(s));
    }
  }
  function isPull(s){return ['«چقدر می‌دونیم؟»','«با چیزهایی که می‌دونیم، چطوری می‌تونیم فکر ‌کنیم؟»','"How much do we know?"','"How can we think with what we know?"'].includes(s.trim());}
  function renderReader(record,lang){
    const strings=ui[lang],item=record.languageContent?.[lang];
    if(!item){showMissing(strings.notAvailable);return;}
    showPage('reader');
    $('section-type').textContent=record.kind==='introduction'?strings.introduction:strings.episode;
    $('section-number').textContent=record.kind==='introduction'?'':(lang==='fa'?new Intl.NumberFormat('fa-IR').format(Number(record.id)):String(Number(record.id)).padStart(2,'0'))+' /';
    $('hero-eyebrow').textContent=item.eyebrow || '';
    $('hero-title').textContent=item.title;
    $('hero-subtitle').textContent=item.subtitle||'';
    $('hero-subtitle').hidden=!item.subtitle;
    $('hero-poster').src=item.posterPreview||item.poster||'';$('hero-poster').alt=item.posterAlt||'';
    $('hero-visual');
    document.querySelector('.hero-visual').hidden=!item.poster;
    $('reader-index').textContent=(catalog.title?.[lang]||strings.brand)+' / '+(record.kind==='introduction'?strings.intro:item.title);
    $('article-heading').textContent=record.kind==='introduction'?(lang==='fa'?'متن کامل معرفی':'Full introduction'):strings.article;
    $('article-end-label').textContent=record.kind==='introduction'?strings.end:strings.endEpisode;
    $('all-articles-link').href=routeLink('library',null,lang);
    const area=$('article-paragraphs');area.replaceChildren();
    for(const para of item.paragraphs||[]){
      const p=document.createElement('p');p.lang=lang;p.dir=lang==='fa'?'rtl':'ltr';p.dataset.pull=String(isPull(para));populateParagraph(p,para,lang);area.appendChild(p);
    }
    document.title=item.title+' — '+strings.brand;
    document.querySelector('meta[name=description]').content=item.subtitle||item.title;
  }
  function makeCard(item,lang){
    const strings=ui[lang];
    const a=document.createElement('a');a.className='library-card'+(item.kind==='intro'?' intro-card':'');
    a.href=item.kind==='intro'?routeLink('intro',null,lang):routeLink('episode',item.id,lang);
    const head=document.createElement('span');head.className='library-card-head';
    const label=document.createElement('span');label.textContent=item.kind==='intro'?strings.intro:`${strings.episode} ${lang==='fa'?new Intl.NumberFormat('fa-IR').format(item.order):item.order}`;
    const ring=document.createElement('span');ring.textContent='◌';head.append(label,ring);
    const title=document.createElement('span');title.className='library-card-title';title.textContent=item.title?.[lang]||'';
    const arrow=document.createElement('span');arrow.className='library-card-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    a.append(head,title,arrow);return a;
  }
  function renderLibrary(lang){
    showPage('library');const strings=ui[lang];
    const published=[...(catalog.episodes||[])].filter(e=>e&&e.id&&e.file&&e.title).sort((a,b)=>(a.order??0)-(b.order??0));
    $('library-count').textContent=strings.count(published.length);
    const all=[{kind:'intro',title:{fa:'از اطلاعات تا جامعه',en:'From Information to Society'}},...published];
    const filter=$('library-search');filter.oninput=()=>{
      const q=filter.value.trim().toLocaleLowerCase();const found=all.filter(e=>(e.title[lang]||'').toLocaleLowerCase().includes(q));
      const container=$('library-cards');container.replaceChildren();
      if(!found.length){const p=document.createElement('p');p.className='library-empty';p.textContent=strings.noResults;container.appendChild(p);return;}
      for(const item of found)container.appendChild(makeCard(item,lang));
    };
    filter.oninput();document.title=strings.library+' — '+strings.brand;
  }
  function showMissing(message){showPage('missing');$('missing-title').textContent=message||ui[route.lang].missing;}
  function loadEpisode(id){
    if(data[id])return Promise.resolve(data[id]);
    const record=(catalog.episodes||[]).find(e=>e.id===id);
    if(!record||!/^[\w/-]+\.js$/.test(record.file))return Promise.resolve(null);
    return new Promise(resolve=>{
      const el=document.createElement('script');el.src=record.file;
      el.onload=()=>resolve(data[id]||null);el.onerror=()=>resolve(null);document.head.appendChild(el);
    });
  }
  async function render(){
    const gen=++routeGeneration;
    route=parseRoute();if($('poster-dialog').open)$('poster-dialog').close();setLocale(route.lang);
    if(route.type==='intro'){renderReader(data.intro,route.lang);}
    else if(route.type==='library')renderLibrary(route.lang);
    else if(route.type==='episode'){
      const result=await loadEpisode(route.id);
      if(gen!==routeGeneration)return;
      if(result)renderReader(result,route.lang);else showMissing();
    }else showMissing();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function showToast(text){const el=$('message');el.textContent=text;el.hidden=false;clearTimeout(lastToast);lastToast=setTimeout(()=>{el.hidden=true},2600);}
  function showPoster(){
    if(!route||els.reader.hidden)return;
    const record=route.type==='intro'?data.intro:data[route.id];const item=record?.languageContent?.[route.lang];
    if(!item?.poster)return;
    $('dialog-image').src=item.poster;$('dialog-image').alt=item.posterAlt||'';
    const dlg=$('poster-dialog');dlg.classList.remove('is-zoomed');$('poster-zoom').setAttribute('aria-pressed','false');
    $('poster-zoom').textContent=route.lang==='fa'?'بزرگ‌نمایی جزئیات':'Zoom in for detail';
    $('viewer-stage').scrollTop=0;$('viewer-stage').scrollLeft=0;
    if(!dlg.open)dlg.showModal();
  }
  $('poster-open').addEventListener('click',showPoster);
  $('rail-poster').addEventListener('click',showPoster);
  $('poster-close').addEventListener('click',()=>$('poster-dialog').close());
  $('poster-zoom').addEventListener('click',()=>{
    const dlg=$('poster-dialog');const zoomed=dlg.classList.toggle('is-zoomed');
    $('poster-zoom').setAttribute('aria-pressed',String(zoomed));
    $('poster-zoom').textContent=route.lang==='fa'?(zoomed?'نمای کامل پوستر':'بزرگ‌نمایی جزئیات'):(zoomed?'Fit entire poster':'Zoom in for detail');
    if(!zoomed){$('viewer-stage').scrollTop=0;$('viewer-stage').scrollLeft=0;}
  });
  $('poster-dialog').addEventListener('click',e=>{if(e.target===$('poster-dialog'))$('poster-dialog').close();});
  document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{
    if(!route)return;
    goTo(route.type==='episode'?'episode':route.type==='library'?'library':'intro',button.dataset.lang,route.id);
  }));
  $('read-action').addEventListener('click',e=>{e.preventDefault();$('article-start').scrollIntoView({behavior:'smooth',block:'start'});});
  $('copy-link').addEventListener('click',async()=>{
    const url=location.href.includes('#/')?location.href:location.href.split('#')[0]+routeLink(route.type,route.id,route.lang);
    try {if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url)}else{const inp=document.createElement('textarea');inp.value=url;document.body.append(inp);inp.select();if(!document.execCommand('copy'))throw Error();inp.remove();}showToast(ui[route.lang].copied);}
    catch{showToast(ui[route.lang].copyFailed)}
  });
  window.addEventListener('hashchange',render);
  render();
})();
