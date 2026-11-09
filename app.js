(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const data = window.SERIES_CONTENT || {};
  const catalog = window.SERIES_CATALOG || {episodes:[]};
  const $main = $('main-content');
  const ui = {
    fa: {
      brand:'از اطلاعات تا جامعه',home:'خانه',intro:'اپیزود اول', library:'اپیزودها', introduction:'اپیزود', episode:'اپیزود',
      poster:'پوستر اصلی',posterCaption:'برای بزرگ‌نمایی تصویر، آن را انتخاب کنید',read:'خواندن متن',share:'کپی پیوند صفحه',
      article:'متن کامل',end:'پایان اپیزود اول',endEpisode:'پایان نوشته',readAll:'فهرست نوشته‌ها',overview:'نقشه مسیر',
      librarySubtitle:'معرفی در جای خود می‌ماند و هر نوشتهٔ تازه به این فهرست اضافه می‌شود.',
      search:'جست‌وجو در عنوان‌ها', searchPlaceholder:'جست‌وجو...', count:(n)=>n===0?'هنوز قسمت دیگری منتشر نشده است.':`${n} قسمت منتشرشده`,
      noResults:'عنوانی مطابق جست‌وجوی شما پیدا نشد.', missing:'این نوشته هنوز منتشر نشده است.',
      copied:'پیوند این صفحه کپی شد.',copyFailed:'نشانی صفحه را از نوار آدرس مرورگر کپی کنید.',
      goPoster:'دیدن پوستر ↗',titleTag:'معرفی',endNote:'یک مسیر، پرسش‌های بسیار', reading:'خواندن', missingBack:'بازگشت به فهرست',
      notAvailable:'نسخهٔ این زبان برای این نوشته هنوز منتشر نشده است.',
      tocTitle:'فهرست نوشته‌ها',tocIntro:'از اطلاعات تا جامعه',tocToggle:'نمایش فهرست',tocClose:'بستن فهرست',tocSkip:'رفتن به محتوای اصلی'
    },
    en: {
      brand:'From Information to Society',home:'Home',intro:'Episode 1',library:'Episodes', introduction:'Episode', episode:'Episode',
      poster:'Original poster',posterCaption:'Select the image to see the full-size artwork',read:'Read the essay',share:'Copy page link',
      article:'Complete text',end:'End of episode one',endEpisode:'End of essay',readAll:'Writing index',overview:'The map of the journey',
      librarySubtitle:'The introduction stays in place. Each new piece joins this index, at its own permanent address.',
      search:'Search titles',searchPlaceholder:'Search...',count:(n)=>n===0?'No additional episodes published yet.':`${n} published episodes`,
      noResults:'No titles match this search.',missing:'This piece has not been published yet.',
      copied:'Page link copied.',copyFailed:'Copy the address from your browser’s address bar.',
      goPoster:'View poster ↗',titleTag:'Introduction',endNote:'One journey, many questions',reading:'Read',missingBack:'Back to the index',
      notAvailable:'This language edition has not been published yet.',
      tocTitle:'Episode index',tocIntro:'From Information to Society',tocToggle:'Show episodes',tocClose:'Hide episodes',tocSkip:'Skip to main content'
    }
  };
  const homeStrings={
    fa:{eyebrow:'نقشه‌ای که قدم‌به‌قدم کامل می‌شه',title:'از اطلاعات تا جامعه',deck:'از یک سؤال ساده شروع می\u200cکنیم: چرا اطلاعات یکسان می\u200cتونه به برداشت\u200cها و تصمیم\u200cهای متفاوت برسه؟ از اینجا قدم\u200cبه\u200cقدم به تعامل انسان\u200cها و هوش مصنوعی و امکان شکل\u200cگیری یک اکوسیستم مشترک می\u200cرسیم.',indexTitle:'اپیزودها',searchLabel:'جست‌وجو در اپیزودها',searchPlaceholder:'عنوان یا موضوع اپیزود را جست‌وجو کن...',noResults:'اپیزودی با این عبارت پیدا نشد.',new:'تازه‌ترین',read:'خواندن اپیزود',published:'انتشار',results:(n)=>`${new Intl.NumberFormat('fa-IR').format(n)} اپیزود`,total:(n)=>`${new Intl.NumberFormat('fa-IR').format(n)} اپیزود منتشرشده`,journey:'این مسیر ادامه داره؛ اپیزودهای بعدی به‌مرور منتشر می‌شن.'},
    en:{eyebrow:'A map taking shape, one episode at a time',title:'From Information to Society',deck:'We start with a simple question: why can the same information lead to different interpretations and decisions? From there, we explore how people and AI systems might interact within a shared ecosystem.',indexTitle:'Episodes',searchLabel:'Search episodes',searchPlaceholder:'Search by episode title or topic...',noResults:'No episodes match that search.',new:'Latest',read:'Read episode',published:'Published',results:(n)=>`${n} ${n===1?'episode':'episodes'}`,total:(n)=>`${n} published ${n===1?'episode':'episodes'}`,journey:'The journey continues. New episodes will appear here as they are published.'}
  };
  const els = {home:$('home-page'),reader:$('reader-page'),library:$('library-page'),missing:$('missing-page')};
  const routeLink=(type,id,lang)=>type==='episode'?`#/episode/${encodeURIComponent(id)}/${lang}`:`#/${type}/${lang}`;
  let route=null;
  let routeGeneration=0;
  let lastToast=null;

  function parseRoute(){
    let decoded;try{decoded=decodeURIComponent(location.hash.slice(1));}catch{decoded='';}
    const parts=decoded.split('/').filter(Boolean);
    const browserLanguage=(navigator.language||'').toLowerCase().startsWith('fa')?'fa':'en';
    if(!parts.length)return {type:'home',lang:'fa'};
    if(parts[0]==='intro'||parts[0]==='library'||parts[0]==='home')return {type:parts[0],lang:['en','fa'].includes(parts[1])?parts[1]:browserLanguage};
    if(parts[0]==='episode'&&parts[1])return {type:'episode',id:parts[1],lang:['en','fa'].includes(parts[2])?parts[2]:browserLanguage};
    return {type:'missing',lang:browserLanguage};
  }

  function goTo(type,lang,id){location.hash=routeLink(type,id,lang);}
  function setLocale(lang){
    const strings=ui[lang],isFa=lang==='fa';
    document.documentElement.lang=lang;document.documentElement.dir=isFa?'rtl':'ltr';
    document.body.dir=isFa?'rtl':'ltr';
    $('brand-name').textContent=strings.brand;
    $('home-link').href=routeLink('home',null,lang);
    $('nav-home').href=routeLink('home',null,lang);
    $('nav-home').textContent=strings.home;
    $('nav-home').setAttribute('aria-label',isFa?'رفتن به خانه':'Go to home');
    $('nav-home').parentElement.setAttribute('aria-label',isFa?'ناوبری اصلی':'Main navigation');
    $('home-link').setAttribute('aria-label',isFa?'صفحه نخست':'Home page');
    $('missing-link').textContent=strings.missingBack;
    $('missing-link').href=routeLink('library',null,lang);
    $('missing-title').textContent=strings.missing;
    document.querySelectorAll('[data-lang]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.lang===lang)));
    document.querySelectorAll('[data-route]').forEach(a=>{
      const selected=['library','home'].includes(route?.type)&&a.dataset.route==='home';
      a.classList.toggle('is-current',selected);
      if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    $('copy-link').firstChild.textContent=strings.share+' ';
    document.querySelector('[data-lang=en]').textContent=isFa?'انگلیسی':'English';
    $('read-action').firstChild.textContent=strings.read+' ';
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
    $('reader-toc').setAttribute('aria-label',strings.tocTitle);
    $('toc-navigation').setAttribute('aria-label',strings.tocTitle);
    $('toc-title').textContent=strings.tocTitle;
    $('skip-to-main').textContent=strings.tocSkip;
    $('reader-article').setAttribute('aria-label',strings.article);
    updateTocToggleLabel(lang);
    const h=homeStrings[lang];
    for(const [id,value] of Object.entries({'home-eyebrow':h.eyebrow,'home-title':h.title,'home-deck':h.deck,'home-index-title':h.indexTitle,'home-search-label':h.searchLabel,'home-journey-note':h.journey}))$(id).textContent=value;
    $('home-search').placeholder=h.searchPlaceholder;
    $('home-page').setAttribute('aria-label',h.indexTitle);
    $('home-cards').setAttribute('aria-label',h.indexTitle);
  }
  function showPage(which){Object.entries(els).forEach(([k,v])=>{v.hidden=k!==which;});}
  // V9.3: Build a single left-to-right island for each embedded English term.
  // Match before styling runs: a single term may straddle bold/regular Word runs.
  // This keeps brackets, L1/L2/I12 codes and the full phrase in their natural order.
  const embeddedLtr = /(?:\b(?:L[123]|I(?:12|23))\s+)?\([^()]*[A-Za-z][^()]*\)|\b(?:L[123]|I(?:12|23))\b|[A-Za-z][A-Za-z0-9]*(?:[’'./&+-][A-Za-z0-9]+)*/g;
  const joinerChars = /[&—–]/g;
  function appendStyledRange(parent,text,runs,start,end,isFa){
    let cursor=0;
    for(const run of runs){
      const runStart=cursor,runEnd=runStart+run.text.length;
      cursor=runEnd;
      const begin=Math.max(runStart,start),finish=Math.min(runEnd,end);
      if(finish<=begin)continue;
      let target=parent;
      if(run.bold){const strong=document.createElement('strong');target.appendChild(strong);target=strong;}
      if(run.italic){const em=document.createElement('em');target.appendChild(em);target=em;}
      const fragment=text.slice(begin,finish);
      if(!isFa){target.appendChild(document.createTextNode(fragment));continue;}
      let previous=0;
      joinerChars.lastIndex=0;
      for(const token of fragment.matchAll(joinerChars)){
        if(token.index>previous)target.appendChild(document.createTextNode(fragment.slice(previous,token.index)));
        const symbol=document.createElement('span');symbol.className='inline-punctuation';
        symbol.textContent=token[0];target.appendChild(symbol);
        previous=token.index+token[0].length;
      }
      if(previous<fragment.length)target.appendChild(document.createTextNode(fragment.slice(previous)));
    }
  }
  function populateBlock(node,block,lang){
    const text=typeof block==='string'?block:(block.text||'');
    const supplied=typeof block==='string'?null:block.runs;
    const runs=Array.isArray(supplied)&&supplied.length&&supplied.every(r=>typeof r.text==='string')
      &&supplied.map(r=>r.text).join('')===text?supplied:[{text}];
    node.replaceChildren();
    if(lang!=='fa'){appendStyledRange(node,text,runs,0,text.length,false);return;}
    embeddedLtr.lastIndex=0;
    let previous=0;
    for(const match of text.matchAll(embeddedLtr)){
      const start=match.index,end=start+match[0].length;
      if(start>previous)appendStyledRange(node,text,runs,previous,start,true);
      const island=document.createElement('bdi');island.className='inline-latin';
      island.dir='ltr';island.lang='en';
      appendStyledRange(island,text,runs,start,end,true);
      node.appendChild(island);previous=end;
    }
    if(previous<text.length)appendStyledRange(node,text,runs,previous,text.length,true);
  }
  function populateSegment(node,text,lang){populateBlock(node,text,lang);}
  function populateParagraph(node,text,lang){populateBlock(node,text,lang);}
  function isPull(s){return ['«چقدر می‌دونیم؟»','«با چیزهایی که می‌دونیم، چطوری می‌تونیم فکر ‌کنیم؟»','"How much do we know?"','"How can we think with what we know?"'].includes(s.trim());}
  function updateTocToggleLabel(lang){
    const button=$('toc-toggle');
    const open=button.getAttribute('aria-expanded')==='true';
    button.textContent=open?ui[lang].tocClose:ui[lang].tocToggle;
  }
  function renderEpisodeIndex(record,lang){
    const all=(catalog.episodes||[]).filter(e=>e&&e.id&&e.title&&e.file)
        .sort((a,b)=>(a.order||0)-(b.order||0));
    const currentId=record.kind==='introduction'?'01':record.id;
    const list=$('toc-list');list.replaceChildren();
    for(const item of all){
      const li=document.createElement('li');li.className='toc-item';
      const link=document.createElement('a');link.className='toc-link';
      const active=item.id===currentId;
      link.href=routeLink('episode',item.id,lang);
      if(active){link.setAttribute('aria-current','page');li.classList.add('is-current');}
      const num=document.createElement('span');num.className='toc-number';num.lang=lang;
      num.textContent=(lang==='fa'?new Intl.NumberFormat('fa-IR').format(item.order):String(item.order).padStart(2,'0'));
      const label=document.createElement('span');label.className='toc-item-label';
      label.textContent=item.title[lang]||'';
      link.append(num,label);li.append(link);list.append(li);
    }
    $('toc-toggle').setAttribute('aria-expanded','false');
    $('reader-toc').classList.remove('is-open');
    updateTocToggleLabel(lang);
  }
  function renderReader(record,lang){
    const strings=ui[lang],item=record.languageContent?.[lang];
    if(!item){showMissing(strings.notAvailable);return;}
    showPage('reader');
    document.body.dataset.page=record.kind==='introduction'?'intro':'episode';
    renderEpisodeIndex(record,lang);
    $('section-type').textContent=strings.episode;
    $('section-number').textContent=(lang==='fa'?new Intl.NumberFormat('fa-IR').format(record.kind==='introduction'?1:Number(record.id)):String(record.kind==='introduction'?1:Number(record.id)).padStart(2,'0'))+' /';
    $('hero-eyebrow').textContent=item.eyebrow || '';
    $('hero-title').textContent=item.title;
    $('hero-subtitle').textContent=item.subtitle||'';
    $('hero-subtitle').hidden=!item.subtitle;
    $('hero-poster').src=item.posterPreview||item.poster||'';$('hero-poster').alt=item.posterAlt||'';
    $('poster-label').textContent=strings.poster;
    $('hero-visual');
    document.querySelector('.hero-visual').hidden=!item.poster;
    $('reader-index').textContent=(catalog.title?.[lang]||strings.brand)+' / '+item.title;
    $('article-heading').textContent=strings.article;
    const area=$('article-paragraphs');area.replaceChildren();
    if(Array.isArray(item.blocks)){
      let stage=0;
      for(const block of item.blocks){
        if(block.type==='figure'){
          stage++;
          const fig=document.createElement('figure');fig.className='atlas-figure';
          fig.id=`atlas-stage-${stage}`;
          const open=document.createElement('button');open.type='button';open.className='atlas-open';
          open.dataset.fullImage=block.src;open.dataset.imageAlt=block.alt;
          open.dataset.viewerLabel=(lang==='fa'?'اطلس شناخت':'Cognitive Atlas')+' / '+block.caption;
          open.setAttribute('aria-label',(lang==='fa'?'بزرگ‌نمایی تصویر: ':'Enlarge figure: ')+block.caption);
          const image=document.createElement('img');image.src=block.preview||block.src;
          image.alt=block.alt;image.loading='lazy';image.decoding='async';
          if(block.width)image.width=block.width;if(block.height)image.height=block.height;
          open.appendChild(image);
          const icon=document.createElement('span');icon.className='atlas-enlarge-icon';
          icon.textContent='↗';icon.setAttribute('aria-hidden','true');open.appendChild(icon);
          const caption=document.createElement('figcaption');caption.textContent=(lang==='fa'?'اطلس شناخت · مرحله ':'Cognitive Atlas · Step ')+(lang==='fa'?new Intl.NumberFormat('fa-IR').format(stage):stage)+' / '+(lang==='fa'?'۵':'5')+' — '+block.caption;
          fig.append(open,caption);area.appendChild(fig);
        }else if(block.type==='heading'){
          const h=document.createElement('h2');h.className='episode-section-heading';h.lang=lang;
          populateParagraph(h,block.text,lang);area.appendChild(h);
        }else{
          const p=document.createElement('p');p.lang=lang;p.dir=lang==='fa'?'rtl':'ltr';
          p.dataset.pull=String(Boolean(block.emphasis));
          populateBlock(p,block,lang);
          area.appendChild(p);
        }
      }
    }else{
      for(const para of item.paragraphs||[]){
        const p=document.createElement('p');p.lang=lang;p.dir=lang==='fa'?'rtl':'ltr';p.dataset.pull=String(isPull(para));populateParagraph(p,para,lang);area.appendChild(p);
      }
    }
    const feature=$('next-episode-link');
    if(feature){
      const next=record.kind==='introduction'?([...catalog.episodes].find(e=>e.id==='02')):null;
      feature.hidden=!next;
      if(next){feature.href=routeLink('episode',next.id,lang);feature.textContent=(lang==='fa'?'بریم سراغ اپیزود دوم: ':'Continue to Episode Two: ')+(next.title?.[lang]||'');}
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
    const thumbSource=item.kind==='intro'?data.intro?.languageContent?.[lang]?.posterPreview:item.posterPreview?.[lang];
    const thumb=document.createElement('img');thumb.className='library-card-thumb';
    if(thumbSource){thumb.src=thumbSource;thumb.loading='lazy';thumb.alt='';thumb.decoding='async';thumb.width=76;thumb.height=95;}
    const title=document.createElement('span');title.className='library-card-title';title.textContent=item.title?.[lang]||'';
    const arrow=document.createElement('span');arrow.className='library-card-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    if(thumbSource){const wrap=document.createElement('span');wrap.className='library-card-body';wrap.append(title,thumb);a.append(head,wrap,arrow);}
    else a.append(head,title,arrow);return a;
  }
  function formatPublicationDate(iso,lang){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return '';
    const d=new Date(iso+'T12:00:00Z');
    try{return new Intl.DateTimeFormat(lang==='fa'?'fa-IR-u-ca-persian':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d)}
    catch(e){return iso}
  }
  function makeHomeCard(item,lang,latestId){
    const u=homeStrings[lang],card=document.createElement('a');
    card.className='home-entry'+(item.id===latestId?' home-entry-new':'');
    card.href=routeLink('episode',item.id,lang);
    card.setAttribute('aria-label',(lang==='fa'?'اپیزود ':'Episode ')+item.order+': '+(item.title?.[lang]||''));
    const visual=document.createElement('span');visual.className='home-entry-art';
    const img=document.createElement('img');img.src=item.posterPreview?.[lang]||'';img.alt='';
    img.loading='eager';img.decoding='async';visual.appendChild(img);
    const body=document.createElement('span');body.className='home-entry-body';
    const over=document.createElement('span');over.className='home-entry-overline';
    const index=document.createElement('span');index.className='home-entry-index';
    index.textContent=(lang==='fa'?'اپیزود ':'Episode ')+(lang==='fa'?new Intl.NumberFormat('fa-IR').format(item.order):item.order);
    over.appendChild(index);
    if(item.id===latestId){const newest=document.createElement('span');newest.className='home-new-tag';newest.textContent=u.new;over.appendChild(newest)}
    const title=document.createElement('strong');title.className='home-entry-title';title.textContent=item.title?.[lang]||'';
    const summary=document.createElement('span');summary.className='home-entry-description';summary.textContent=item.description?.[lang]||'';
    const bottom=document.createElement('span');bottom.className='home-entry-bottom';
    const time=document.createElement('time');time.dateTime=item.publishedAt||'';
    time.textContent=u.published+': '+formatPublicationDate(item.publishedAt,lang);
    const action=document.createElement('span');action.className='home-entry-read';action.textContent=u.read;
    bottom.append(time,action);body.append(over,title,summary,bottom);card.append(visual,body);
    return card;
  }
  function renderHome(lang,focusSearch=false){
    showPage('home');document.body.dataset.page='home';
    const published=[...(catalog.episodes||[])].filter(e=>e?.id&&e?.file&&e?.title&&e?.publishedAt)
      .sort((a,b)=>(a.order??0)-(b.order??0));
    const latestId=[...published].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt))[0]?.id;
    const field=$('home-search'),box=$('home-cards'),status=$('home-search-status'),u=homeStrings[lang];
    $('home-index-total').textContent=u.total(published.length);
    const update=()=>{
      const q=field.value.trim().toLocaleLowerCase(lang);
      const found=published.filter(it=>[it.title?.[lang],it.description?.[lang],String(it.order)]
        .join(' ').toLocaleLowerCase(lang).includes(q));
      box.replaceChildren();
      for(const item of found)box.appendChild(makeHomeCard(item,lang,latestId));
      if(!found.length){const p=document.createElement('p');p.className='home-empty';p.textContent=u.noResults;box.appendChild(p)}
      status.textContent=u.results(found.length);
    };
    // Retain the search query when changing languages; clear when leaving the homepage.
    const existing=field.value;field.value=existing;
    field.oninput=update;update();
    document.title=u.title+' | '+u.indexTitle;
    document.querySelector('meta[name=description]').content=u.deck;
    if(focusSearch)requestAnimationFrame(()=>{field.focus({preventScroll:true});$('home-index').scrollIntoView({behavior:'instant',block:'start'})});
  }
  function renderLibrary(lang){
    showPage('library');document.body.dataset.page='library';const strings=ui[lang];
    const published=[...(catalog.episodes||[])].filter(e=>e&&e.id&&e.file&&e.title).sort((a,b)=>(a.order??0)-(b.order??0));
    $('library-count').textContent=strings.count(published.length);
    const all=published;
    const filter=$('library-search');filter.oninput=()=>{
      const q=filter.value.trim().toLocaleLowerCase();const found=all.filter(e=>(e.title[lang]||'').toLocaleLowerCase().includes(q));
      const container=$('library-cards');container.replaceChildren();
      if(!found.length){const p=document.createElement('p');p.className='library-empty';p.textContent=strings.noResults;container.appendChild(p);return;}
      for(const item of found)container.appendChild(makeCard(item,lang));
    };
    filter.oninput();document.title=strings.library+' — '+strings.brand;
  }
  function showMissing(message){showPage('missing');document.body.dataset.page='missing';$('missing-title').textContent=message||ui[route.lang].missing;}
  function loadEpisode(id){
    if(id==='01')return Promise.resolve(data.intro||null);
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
    if(route.type==='home'){renderHome(route.lang);}
    else if(route.type==='intro'){renderReader(data.intro,route.lang);}
    else if(route.type==='library')renderHome(route.lang,true);
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
    const record=(route.type==='intro'||route.id==='01')?data.intro:data[route.id];const item=record?.languageContent?.[route.lang];
    if(!item?.poster)return;
    $('dialog-image').src=item.poster;$('dialog-image').alt=item.posterAlt||'';
    $('viewer-title').textContent=record.kind==='introduction'?ui[route.lang].poster:(route.lang==='fa'?'پوستر اپیزود دوم':'Episode artwork');
    const dlg=$('poster-dialog');dlg.classList.remove('is-zoomed');$('poster-zoom').setAttribute('aria-pressed','false');
    $('poster-zoom').textContent=route.lang==='fa'?'بزرگ‌نمایی جزئیات':'Zoom in for detail';
    $('viewer-stage').scrollTop=0;$('viewer-stage').scrollLeft=0;
    if(!dlg.open)dlg.showModal();
  }
  // The atlas magnification uses the same accessible modal as the approved poster viewer.
  $('article-paragraphs').addEventListener('click',e=>{
    const target=e.target.closest?.('button[data-full-image]');
    if(!target)return;
    const dlg=$('poster-dialog');
    $('dialog-image').src=target.dataset.fullImage;
    $('dialog-image').alt=target.dataset.imageAlt||'';
    $('viewer-title').textContent=target.dataset.viewerLabel||ui[route.lang].poster;
    dlg.setAttribute('aria-label',target.dataset.viewerLabel||ui[route.lang].poster);
    dlg.classList.remove('is-zoomed');$('poster-zoom').setAttribute('aria-pressed','false');
    $('poster-zoom').textContent=route.lang==='fa'?'بزرگ‌نمایی جزئیات':'Zoom in for detail';
    $('viewer-stage').scrollTop=0;$('viewer-stage').scrollLeft=0;
    if(!dlg.open)dlg.showModal();
  });
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
    goTo(route.type==='episode'?'episode':route.type==='library'?'library':route.type==='home'?'home':'intro',button.dataset.lang,route.id);
  }));
  $('read-action').addEventListener('click',e=>{e.preventDefault();$('article-start').scrollIntoView({behavior:'smooth',block:'start'});});
  $('toc-toggle').addEventListener('click',()=>{
    const aside=$('reader-toc');const next=!aside.classList.contains('is-open');
    aside.classList.toggle('is-open',next);
    $('toc-toggle').setAttribute('aria-expanded',String(next));
    updateTocToggleLabel(route?.lang||'fa');
  });
  $('skip-to-main').addEventListener('click',()=>{
    $main.scrollIntoView({behavior:'instant',block:'start'});$main.focus({preventScroll:true});
  });
  $('copy-link').addEventListener('click',async()=>{
    const current=route.type==='episode'?data[route.id]?.languageContent?.[route.lang]:null;
    const url=current?.sharePath?new URL(current.sharePath,document.baseURI).href:(location.href.includes('#/')?location.href:location.href.split('#')[0]+routeLink(route.type,route.id,route.lang));
    try {if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url)}else{const inp=document.createElement('textarea');inp.value=url;document.body.append(inp);inp.select();if(!document.execCommand('copy'))throw Error();inp.remove();}showToast(ui[route.lang].copied);}
    catch{showToast(ui[route.lang].copyFailed)}
  });
  window.addEventListener('hashchange',render);
  render();
})();
