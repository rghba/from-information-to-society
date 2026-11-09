/* FTIS V9.2: opt-in-only analytics, article-scoped feedback links, newsletter sign-up.
   No visitor identification, autocapture, replay, hidden pixels, or fake comment storage.
   Vendor tokens stay public; no server-side credentials should ever be stored here. */
(() => {
  'use strict';
  const cfg=window.FTIS_COMMUNITY_CONFIG||{};
  const settings={ analytics:/^phc_[A-Za-z0-9_-]{12,}$/.test(cfg.posthogProjectToken||'') && /^https:\/\/(us|eu)\.i\.posthog\.com$/.test(cfg.posthogHost||''),
     feedback:/^[A-Za-z0-9_-]{12,}$/.test(cfg.commentsPublicKey||''),
     newsletter:/^https:\/\/[A-Za-z0-9.-]+\//.test(cfg.newsletterFormUrl||'') };
  const $=id=>document.getElementById(id);
  let enabled=false,initialized=false,lastPage='',readPercent=0, lastScrollKey='';
  const consentKey='ftis.analytics.optin.v1';
  const labels={
    fa:{discussion:'گفت‌وگو درباره این نوشته',detail:'اگر با نکته‌ای موافق نیستی، سؤال داری یا اصلاحی پیشنهاد می‌کنی، خوشحال می‌شیم نظرت رو بخونیم.',open:'نوشتن دیدگاه یا پیشنهاد اصلاح',follow:'دنبال‌کردن ادامه مجموعه',followDesc:'اگر دوست داری از انتشار اپیزودهای بعدی باخبر بشی، می‌تونی داوطلبانه عضو خبرنامه بشی.',followBtn:'عضویت در خبرنامه',notice:'آیا اجازه می‌دی آمار بازدید و شیوه مطالعه را بدون ثبت نام و ایمیل جمع‌آوری کنیم؟ هر زمان می‌تونی نظرت رو عوض کنی.',accept:'موافقم',decline:'نه، ممنون',preferences:'تنظیمات حریم خصوصی'},
    en:{discussion:'Join the conversation',detail:'Agree, disagree, have a question, or want to suggest a correction? Your perspective is welcome.',open:'Comment or suggest a correction',follow:'Follow the series',followDesc:'Get the next episode by email if you’d like to keep exploring with us.',followBtn:'Subscribe to new episodes',notice:'May we collect optional reading and visit statistics? No email address or name is shared with analytics. You can change this choice anytime.',accept:'Allow analytics',decline:'No thanks',preferences:'Privacy settings'}
  };
  function lang(){return document.documentElement.lang==='en'?'en':'fa'}
  function route(){
    const m=(location.hash||'').match(/^#\/(home|intro|episode|library)(?:\/([A-Za-z0-9-]+))?(?:\/(fa|en))?/);
    if(!m)return {kind:'home',id:'',language:lang()};
    return {kind:m[1],id:m[1]==='episode'?m[2]||'':m[1]==='intro'?'intro':'',language:m[3]||lang()};
  }
  function safeCampaign(){
    // Strictly allow these four public labels; NEVER transmit arbitrary URL query or personal data.
    const params=new URLSearchParams(location.search),result={};
    for(const k of ['utm_source','utm_medium','utm_campaign','utm_content']){
      const value=params.get(k);
      if(value && /^[A-Za-z0-9_-]{1,70}$/.test(value))result[k]=value;
    }
    return result;
  }
  function track(event,props){
    if(!enabled || !initialized || !window.posthog || !settings.analytics)return;
    window.posthog.capture(event,{...props,...safeCampaign()});
  }
  function captureRoute(force=false){
    const r=route();const key=`${r.kind}:${r.id}:${r.language}`;
    if(!force && key===lastPage)return;
    lastPage=key;lastScrollKey='';readPercent=0;
    if(!enabled)return;
    // Deliberately omit the raw querystring: source tags are separately sanitized.
    const cleanUrl=location.origin+location.pathname+(location.hash||'#/home/fa');
    track('$pageview',{'$current_url':cleanUrl,ftis_page_type:r.kind,ftis_episode:r.id,ftis_language:r.language});
  }
  function startAnalytics(){
    if(!settings.analytics || initialized)return;
    initialized=true;enabled=true;
    // Use the official PostHog loader stub; load nothing before consent.
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split('.');2===o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement('script')).type='text/javascript',p.crossOrigin='anonymous',p.async=true,p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js',(r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],u.toString=function(t){var e='posthog';return a!=='posthog'&&(e+='.'+a),t?e+'.people':e},o='capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset onSessionId'.split(' '),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(cfg.posthogProjectToken,{api_host:cfg.posthogHost,defaults:'2026-08-30',capture_pageview:false,capture_pageleave:false,autocapture:false,disable_session_recording:true,person_profiles:'identified_only',persistence:'localStorage',opt_out_capturing_by_default:false});
    captureRoute(true);
  }
  function revoke(){
    enabled=false;
    if(window.posthog && initialized){
      try{window.posthog.opt_out_capturing();window.posthog.reset()}catch(e){/* privacy control remains revoked */}
    }
  }
  function hideNotice(){const n=$('ftis-analytics-consent');if(n)n.hidden=true}
  function consent(value){
    try{localStorage.setItem(consentKey,value)}catch(e){}
    hideNotice();if(value==='yes'){enabled=true;if(initialized){try{window.posthog.opt_in_capturing()}catch(e){}captureRoute(true)}else startAnalytics()}else revoke();
  }
  function configureConsent(){
    const notice=$('ftis-analytics-consent'), privacy=$('ftis-privacy');
    if(!settings.analytics){if(privacy)privacy.hidden=true;return;}
    // Always expose settings, including after decline; consent must remain reversible.
    if(privacy)privacy.hidden=false;
    const current=(()=>{try{return localStorage.getItem(consentKey)}catch(e){return null}})();
    if(current==='yes'){startAnalytics()}
    else if(current===null && notice){notice.hidden=false;}
    if($('ftis-consent-yes'))$('ftis-consent-yes').addEventListener('click',()=>consent('yes'));
    if($('ftis-consent-no'))$('ftis-consent-no').addEventListener('click',()=>consent('no'));
    if(privacy)privacy.addEventListener('click',()=>{if(notice)notice.hidden=false});
  }
  function renderLocale(){
    const tr=labels[lang()];
    for(const [key,id] of [['discussion','ftis-discussion-heading'],['detail','ftis-discussion-description'],['open','ftis-discussion-link'],['follow','ftis-follow-heading'],['followDesc','ftis-follow-description'],['followBtn','ftis-follow-link'],['notice','ftis-consent-text'],['accept','ftis-consent-yes'],['decline','ftis-consent-no'],['preferences','ftis-privacy']]){
      const e=$(id);if(e)e.textContent=tr[key];
    }
    const policy=$('ftis-data-policy'),details=$('ftis-consent-details');
    if(policy){policy.href='privacy.html#'+lang();policy.textContent=lang()==='fa'?'درباره داده‌ها':'About your data';}
    if(details){details.href='privacy.html#'+lang();details.textContent=lang()==='fa'?'آمار و حریم خصوصی چگونه کار می‌کند؟':'How does analytics and privacy work?';}
    const n=$('ftis-analytics-consent');if(n)n.dir=lang()==='fa'?'rtl':'ltr';
  }
  function renderCommunity(){
    renderLocale();
    const r=route(),area=$('ftis-community');if(!area)return;
    const relevant=r.kind==='episode'||r.kind==='intro';
    area.hidden=!relevant || (!settings.feedback && !settings.newsletter);
    const discussion=$('ftis-discussion');if(discussion){
      discussion.hidden=!relevant||!settings.feedback;
      const a=$('ftis-discussion-link');
      if(a){
        const id=r.kind==='intro'?'intro':r.id;
        const locationPath=`discuss/${encodeURIComponent(id)}-${r.language}.html`;
        a.href=locationPath;
        a.dataset.episode=id;
      }
    }
    const follow=$('ftis-follow');if(follow){
      follow.hidden=!settings.newsletter;
      const a=$('ftis-follow-link');if(a){a.href=cfg.newsletterFormUrl;a.target='_blank';a.rel='noopener noreferrer';}
    }
  }
  function onNavigation(){renderCommunity();captureRoute()}
  function ready(){
    renderCommunity();configureConsent();
    window.addEventListener('hashchange',()=>setTimeout(onNavigation,0));
    const link=$('ftis-discussion-link');if(link)link.addEventListener('click',()=>track('ftis_open_discussion',{ftis_episode:link.dataset.episode,ftis_language:lang()}));
    const subscribe=$('ftis-follow-link');if(subscribe)subscribe.addEventListener('click',()=>track('ftis_newsletter_click',{ftis_language:lang()}));
    window.addEventListener('scroll',()=>{
      if(!enabled || document.visibilityState!=='visible')return;
      const article=$('reader-article');if(!article || !['episode','intro'].includes(document.body.dataset.page))return;
      const rect=article.getBoundingClientRect();const span=rect.height-window.innerHeight;
      if(span<=0)return;
      const progress=Math.max(0,Math.min(1,-rect.top/span));
      for(const target of [0.25,0.5,0.75,1]){
        if(progress>=target && readPercent<target){readPercent=target;const r=route();track('ftis_read_depth',{ftis_episode:r.id,ftis_language:r.language,percent:target*100});}
      }
    },{passive:true});
  }
  window.FTISCommunity={trackRoute:captureRoute,route,settings};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
