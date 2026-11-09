(() => {
  'use strict';
  const cfg=window.FTIS_COMMUNITY_CONFIG||{};
  const root=document.documentElement;
  const language=root.lang==='en'?'en':'fa';
  const key=String(cfg.commentsPublicKey||'');
  const mount=document.getElementById('hakanai-connect');
  const status=document.getElementById('comment-status');
  if(!/^[A-Za-z0-9_-]{12,}$/.test(key)){
    status.hidden=false;
    status.textContent=language==='fa'?'ثبت دیدگاه هنوز فعال نشده است.':'Comments are not enabled yet.';
    mount.hidden=true;
    return;
  }
  const page=root.dataset.threadId;
  if(!/^(intro|02)-(fa|en)$/.test(page))throw Error('Invalid thread identity');
  const script=document.createElement('script');
  script.async=true;
  script.src='https://connect.hakanai.io/embed.js';
  script.dataset.key=key;
  script.dataset.pageId='ftis-'+page;
  script.dataset.url=window.location.origin+window.location.pathname;
  script.dataset.theme='light';
  // Provider currently documents en/fr localization, not fa. Avoid spoofing fa support.
  script.dataset.locale='en';
  script.onerror=()=>{status.hidden=false;status.textContent=language==='fa'?'بخش دیدگاه‌ها بارگیری نشد. لطفاً دوباره تلاش کن.':'Comments could not load. Please try again.'};
  document.body.appendChild(script);
})();
