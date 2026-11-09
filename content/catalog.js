/* FTIS catalog — one publication record per episode, including Episode 1.
   Keep dates as original first-publication dates, not subsequent edits. */
window.SERIES_CATALOG = {
  title: { fa: 'از اطلاعات تا جامعه', en: 'From Information to Society' },
  episodes: [
    { id: '01', order: 1, publishedAt: '2026-10-30', file: 'content/intro.js',
      title: { fa: 'از اطلاعات تا جامعه', en: 'From Information to Society' },
      description: { fa: 'از یک سؤال شروع می‌کنیم: اطلاعات یکسان چطور می‌تونه به برداشت‌ها و تصمیم‌های متفاوت برسه؟', en: 'Our starting question: how can similar information lead to different interpretations and decisions?' },
      posterPreview: { fa: 'assets/poster-fa-preview.webp', en: 'assets/poster-en-preview.webp' }
    },
    { id: '02', order: 2, publishedAt: '2026-11-08', file: 'content/episode-02.js',
      title: { fa: 'یک آسمون، دو تصمیم', en: 'One Sky, Two Decisions' },
      description: { fa: 'یک آسمون ابری، دو انتخاب متفاوت؛ بین دیدن و تصمیم‌گرفتن چه اتفاقی می‌افته؟', en: 'One cloudy sky, two different choices. What happens between seeing and deciding?' },
      posterPreview: { fa: 'assets/episodes/02/poster-fa-preview.webp', en: 'assets/episodes/02/poster-en-preview.webp' }
    }
  ]
};
