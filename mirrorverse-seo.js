/**
 * ============================================================
 *  MIRRORVERSE SEO ENGINE
 *  mirrorverse-seo.js  |  Version 1.0.0
 *  Load in <head> on every Blogger page
 * ============================================================
 *
 *  WHAT THIS FILE DOES:
 *  ─────────────────────────────────────────────────────────
 *  1. Dynamically sets title, meta description, keywords
 *  2. Injects Open Graph tags for social sharing
 *  3. Injects Twitter Card meta tags
 *  4. Injects Schema.org JSON-LD structured data
 *  5. Sets canonical URLs to prevent duplicate content
 *  6. Updates meta tags when quiz result screens activate
 *     (so sharing a result shares the right description)
 *
 *  HOW TO INSTALL:
 *  ─────────────────────────────────────────────────────────
 *  In Blogger → Theme → Edit HTML
 *  Add inside <head>, before </head>:
 *
 *  <script src='YOUR_HOSTED_URL/mirrorverse-seo.js'></script>
 *
 *  CONFIGURATION:
 *  ─────────────────────────────────────────────────────────
 *  Edit MV_SEO_CONFIG below to match your actual domain.
 * ============================================================
 */

;(function(global) {
  'use strict';

  /* ══════════════════════════════════════════════════════════
   *  CONFIGURATION — EDIT THESE VALUES
   * ══════════════════════════════════════════════════════════ */

  const MV_SEO_CONFIG = {
    /* Your live Blogger/website domain — no trailing slash */
    domain    : 'https://yoursite.blogspot.com',

    /* Default image for OG/Twitter cards (upload to your site) */
    ogImage   : 'https://yoursite.blogspot.com/images/mirrorverse-og-card.jpg',
    ogImageW  : 1200,
    ogImageH  : 630,

    /* Twitter handle if you have one */
    twitterHandle: '@MirrorVerseApp',

    /* Site name for OG tags */
    siteName  : 'MirrorVerse',

    /* Default locale */
    locale    : 'en_US',
  };


  /* ══════════════════════════════════════════════════════════
   *  SEO DATA MAP
   *  Complete meta data for every page and tool
   * ══════════════════════════════════════════════════════════ */

  const MV_SEO_MAP = {
  "/": {
    "title": "MirrorVerse — The World's Largest Self-Discovery Ecosystem",
    "desc": "MirrorVerse is a self-discovery platform where every tool reveals something new about you. Discover your Personality Archetype, Hidden Talent, Future Self, and more. Free. Instant.",
    "kw": "self discovery platform, personality quiz free, who am I quiz, self discovery ecosystem, personality archetype test, hidden talent finder",
    "schema": "WebSite",
    "og_type": "website"
  },
  "/personality-archetype": {
    "title": "Personality Archetype Test — Discover Your True Type | MirrorVerse",
    "desc": "Take the free Personality Archetype test. 10 questions reveal if you are The Visionary, Guardian, Architect, Explorer, Catalyst, or Sage. Instant results. No sign-up required.",
    "kw": "personality archetype test, personality archetype quiz, what is my personality archetype, free personality test, personality type quiz online",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/hidden-talent-finder": {
    "title": "Hidden Talent Finder — What Gift Are You Not Using? | MirrorVerse",
    "desc": "Discover your hidden talent in 10 questions. The free Hidden Talent Finder reveals the gift you have but haven't fully claimed — Storyteller, Pattern Hunter, Healer, Builder, Strategist, or Performer.",
    "kw": "hidden talent finder, what is my hidden talent, hidden talent quiz, discover your hidden talent, untapped talent test",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/future-self-predictor": {
    "title": "Future Self Predictor — Who Will You Become In 10 Years? | MirrorVerse",
    "desc": "The free Future Self Predictor reveals who you are becoming. 10 questions map your trajectory — Founder, Master Craftsman, Influencer, Pioneer, Sage Mentor, or Free Spirit.",
    "kw": "future self predictor, who will I become quiz, future self quiz, predict my future quiz, future personality test",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/career-finder": {
    "title": "Career Finder Quiz — What Career Is Right For You? | MirrorVerse",
    "desc": "Find the career that fits your natural strengths. The free Career Finder quiz matches your personality to 6 paths — Creative Director, Founder & CEO, Strategic Advisor, Educator, Builder & Engineer, or Freelance Explorer.",
    "kw": "career finder quiz, what career is right for me, career personality quiz, free career test, career path quiz",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/wealth-potential-analyzer": {
    "title": "Wealth Potential Analyzer — What's Your Money-Building Style? | MirrorVerse",
    "desc": "Discover how you're wired to build wealth. The free Wealth Potential Analyzer reveals your money style in 10 questions — Builder, Saver, Investor, Hustler, Strategist, or Connector.",
    "kw": "wealth potential analyzer, money personality test, wealth building style quiz, how will I become wealthy quiz, financial personality test",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/relationship-style": {
    "title": "Relationship Style Quiz — How Do You Naturally Love? | MirrorVerse",
    "desc": "Discover your true relationship style in 10 questions. The free quiz reveals how you love — Nurturer, Independent, Partner-In-Crime, Romantic, Steady Anchor, or Free-Flowing Lover.",
    "kw": "relationship style quiz, how do I love quiz, love style test, relationship personality quiz, attachment style quiz free",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/decision-style": {
    "title": "Decision Style Quiz — How Do You Really Make Decisions? | MirrorVerse",
    "desc": "Uncover your true decision-making style in 10 questions. Free quiz reveals if you are an Analyst, Intuitive, Consultant, Fast Mover, Cautious Planner, or Principled Decider.",
    "kw": "decision style quiz, decision making personality test, how do I make decisions quiz, decision making style test, cognitive decision style",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/thinking-style": {
    "title": "Thinking Style Quiz — How Does Your Mind Actually Work? | MirrorVerse",
    "desc": "Reveal your cognitive thinking style in 10 questions. Free quiz identifies if you are an Analytical, Creative, Strategic, Practical, Relational, or Intuitive Thinker.",
    "kw": "thinking style quiz, cognitive style test, how do I think quiz, thinking personality test, what is my thinking style",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/purpose-finder": {
    "title": "Purpose Finder — What Is Your Life's True Purpose? | MirrorVerse",
    "desc": "Discover the deeper purpose driving everything you do. The free Purpose Finder quiz reveals your life purpose in 10 questions — Creator, Protector, Teacher, Builder Of Systems, Healer, or Trailblazer.",
    "kw": "purpose finder quiz, what is my life purpose quiz, find my purpose test, life purpose test free, what is my purpose",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/life-path-explorer": {
    "title": "Life Path Explorer — What Shape Is Your Life Taking? | MirrorVerse",
    "desc": "Discover the deeper pattern your life is already following. The free Life Path Explorer reveals your path in 10 questions — Steady Climb, Winding Road, Meteoric Rise, Quiet Depth, Bridge Builder, or Reinvention Arc.",
    "kw": "life path explorer, life path quiz, what is my life path, life journey quiz, life trajectory quiz",
    "schema": "Quiz",
    "og_type": "website"
  },
  "/my-passport": {
    "title": "My MirrorVerse Passport — Your Living Identity Profile",
    "desc": "Your MirrorVerse Passport is a living identity profile built from every discovery you make. Track your XP, level, badges, realm progress, and every layer of who you are.",
    "kw": "mirrorverse passport, personality profile dashboard, self discovery profile, identity profile online, personality score tracker",
    "schema": "WebPage",
    "og_type": "website"
  }
};


  /* ══════════════════════════════════════════════════════════
   *  DYNAMIC RESULT META
   *  When a tool result loads, update meta to reflect the
   *  specific result — so sharing captures the right content
   * ══════════════════════════════════════════════════════════ */

  const MV_RESULT_META = {
    /* personality-archetype results */
    'The Visionary'         : { desc: 'I just discovered I am The Visionary on MirrorVerse — a personality archetype defined by seeing what others miss. What is yours? Free quiz.' },
    'The Guardian'          : { desc: 'I just discovered I am The Guardian on MirrorVerse — the archetype of calm strength and deep loyalty. What is yours? Free quiz.' },
    'The Architect'         : { desc: 'I just discovered I am The Architect on MirrorVerse — the builder who turns vision into reality. What is yours? Free quiz.' },
    'The Explorer'          : { desc: 'I just discovered I am The Explorer on MirrorVerse — the archetype of curiosity and fearless adaptability. What is yours? Free quiz.' },
    'The Catalyst'          : { desc: 'I just discovered I am The Catalyst on MirrorVerse — the archetype of bold ambition and magnetic energy. What is yours? Free quiz.' },
    'The Sage'              : { desc: 'I just discovered I am The Sage on MirrorVerse — the archetype of deep wisdom and relentless curiosity. What is yours? Free quiz.' },
    /* hidden-talent-finder results */
    'The Storyteller'       : { desc: 'My hidden talent is The Storyteller — I transport people with words and narrative. Discover your hidden talent free on MirrorVerse.' },
    'The Pattern Hunter'    : { desc: 'My hidden talent is The Pattern Hunter — I see structure where others see noise. Discover your hidden talent free on MirrorVerse.' },
    'The Healer'            : { desc: 'My hidden talent is The Healer — I make people feel safe without trying. Discover your hidden talent free on MirrorVerse.' },
    'The Builder'           : { desc: 'My hidden talent is The Builder — I finish what others only start. Discover your hidden talent free on MirrorVerse.' },
    'The Strategist'        : { desc: 'My hidden talent is The Strategist — I think several moves ahead automatically. Discover your hidden talent free on MirrorVerse.' },
    'The Performer'         : { desc: 'My hidden talent is The Performer — I hold attention without effort. Discover your hidden talent free on MirrorVerse.' },
    /* future-self-predictor results */
    'The Founder'           : { desc: 'My Future Self is The Founder — in 10 years I will be building something from nothing. Who is your Future Self? Free quiz on MirrorVerse.' },
    'The Master Craftsman'  : { desc: 'My Future Self is The Master Craftsman — elite mastery through relentless depth. Who is your Future Self? Free quiz on MirrorVerse.' },
    'The Influencer'        : { desc: 'My Future Self is The Influencer — people will orient around my direction. Who is your Future Self? Free quiz on MirrorVerse.' },
    'The Pioneer'           : { desc: 'My Future Self is The Pioneer — I will go where no path exists yet. Who is your Future Self? Free quiz on MirrorVerse.' },
    'The Sage Mentor'       : { desc: 'My Future Self is The Sage Mentor — wisdom that compounds and gets passed on. Who is your Future Self? Free quiz on MirrorVerse.' },
    'The Free Spirit'       : { desc: 'My Future Self is The Free Spirit — life designed on my own terms. Who is your Future Self? Free quiz on MirrorVerse.' },
  };


  /* ══════════════════════════════════════════════════════════
   *  META TAG UTILITIES
   * ══════════════════════════════════════════════════════════ */

  function setMeta(name, content, attr) {
    attr = attr || 'name';
    let el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setLink(rel, href) {
    let el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function setTitle(title) {
    document.title = title;
    let el = document.querySelector('meta[property="og:title"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', 'og:title');
      document.head.appendChild(el);
    }
    el.setAttribute('content', title);
  }

  function injectSchema(data) {
    /* Remove any existing MirrorVerse schema tag */
    const existing = document.getElementById('mv-schema');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'mv-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  }


  /* ══════════════════════════════════════════════════════════
   *  SCHEMA GENERATORS
   * ══════════════════════════════════════════════════════════ */

  function buildWebSiteSchema() {
    return {
      '@context' : 'https://schema.org',
      '@type'    : 'WebSite',
      'name'     : MV_SEO_CONFIG.siteName,
      'url'      : MV_SEO_CONFIG.domain,
      'description': 'The world\'s largest self-discovery ecosystem. Free personality quizzes that update your permanent Passport.',
      'potentialAction': {
        '@type'       : 'SearchAction',
        'target'      : MV_SEO_CONFIG.domain + '/search?q={search_term_string}',
        'query-input' : 'required name=search_term_string',
      },
    };
  }

  function buildQuizSchema(pageData, slug) {
    return {
      '@context' : 'https://schema.org',
      '@type'    : 'Quiz',
      'name'     : pageData.title.split(' | ')[0],
      'description': pageData.desc,
      'url'      : MV_SEO_CONFIG.domain + slug,
      'educationalLevel': 'beginner',
      'learningResourceType': 'Quiz',
      'isAccessibleForFree': true,
      'provider' : {
        '@type': 'Organization',
        'name' : MV_SEO_CONFIG.siteName,
        'url'  : MV_SEO_CONFIG.domain,
      },
      'about': {
        '@type': 'Thing',
        'name' : 'Self Discovery',
      },
    };
  }

  function buildBreadcrumbSchema(slug, label) {
    return {
      '@context' : 'https://schema.org',
      '@type'    : 'BreadcrumbList',
      'itemListElement': [
        {
          '@type'   : 'ListItem',
          'position': 1,
          'name'    : 'Home',
          'item'    : MV_SEO_CONFIG.domain + '/',
        },
        {
          '@type'   : 'ListItem',
          'position': 2,
          'name'    : label,
          'item'    : MV_SEO_CONFIG.domain + slug,
        },
      ],
    };
  }

  function buildOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type'   : 'Organization',
      'name'    : MV_SEO_CONFIG.siteName,
      'url'     : MV_SEO_CONFIG.domain,
      'description': 'The world\'s largest self-discovery ecosystem.',
      'sameAs'  : [],
    };
  }


  /* ══════════════════════════════════════════════════════════
   *  PAGE DETECTOR
   * ══════════════════════════════════════════════════════════ */

  function getSlug() {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    /* Handle Blogger URL patterns (e.g. /p/personality-archetype.html) */
    if (path.includes('personality-archetype')) return '/personality-archetype';
    if (path.includes('hidden-talent'))         return '/hidden-talent-finder';
    if (path.includes('future-self'))           return '/future-self-predictor';
    if (path.includes('career-finder'))         return '/career-finder';
    if (path.includes('wealth-potential'))      return '/wealth-potential-analyzer';
    if (path.includes('relationship-style'))    return '/relationship-style';
    if (path.includes('decision-style'))        return '/decision-style';
    if (path.includes('thinking-style'))        return '/thinking-style';
    if (path.includes('purpose-finder'))        return '/purpose-finder';
    if (path.includes('life-path'))             return '/life-path-explorer';
    if (path.includes('my-passport') || path.includes('passport')) return '/my-passport';
    return '/';
  }


  /* ══════════════════════════════════════════════════════════
   *  MAIN SEO INJECTOR
   * ══════════════════════════════════════════════════════════ */

  function applyPageSEO(slug, overrideDesc) {
    const data = MV_SEO_MAP[slug] || MV_SEO_MAP['/'];
    const cfg  = MV_SEO_CONFIG;
    const url  = cfg.domain + slug;
    const desc = overrideDesc || data.desc;

    /* ── Core meta ── */
    setTitle(data.title);
    setMeta('description', desc);
    setMeta('keywords', data.kw);
    setMeta('robots', 'index, follow');
    setMeta('author', 'MirrorVerse');

    /* ── Canonical ── */
    setLink('canonical', url);

    /* ── Open Graph ── */
    setMeta('og:title',       data.title,     'property');
    setMeta('og:description', desc,           'property');
    setMeta('og:type',        data.og_type,   'property');
    setMeta('og:url',         url,            'property');
    setMeta('og:site_name',   cfg.siteName,   'property');
    setMeta('og:locale',      cfg.locale,     'property');
    setMeta('og:image',       cfg.ogImage,    'property');
    setMeta('og:image:width', String(cfg.ogImageW), 'property');
    setMeta('og:image:height',String(cfg.ogImageH), 'property');
    setMeta('og:image:alt',   'MirrorVerse — Self-Discovery Ecosystem', 'property');

    /* ── Twitter Card ── */
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       data.title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image',       cfg.ogImage);
    setMeta('twitter:site',        cfg.twitterHandle);
    setMeta('twitter:creator',     cfg.twitterHandle);

    /* ── Schema.org Structured Data ── */
    const schemas = [];
    if (slug === '/') {
      schemas.push(buildWebSiteSchema());
      schemas.push(buildOrganizationSchema());
    } else if (data.schema === 'Quiz') {
      schemas.push(buildQuizSchema(data, slug));
      schemas.push(buildBreadcrumbSchema(slug, data.title.split(' | ')[0]));
    } else {
      schemas.push(buildBreadcrumbSchema(slug, data.title.split(' | ')[0]));
    }

    /* Inject as single array for cleanliness */
    if (schemas.length === 1) {
      injectSchema(schemas[0]);
    } else {
      schemas.forEach(function(s, i) {
        const script = document.createElement('script');
        script.id = 'mv-schema-' + i;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(s, null, 2);
        document.head.appendChild(script);
      });
    }
  }


  /* ══════════════════════════════════════════════════════════
   *  RESULT SHARE META UPDATER
   *  When user shares a result, update OG tags to reflect
   *  their specific result for richer social previews
   * ══════════════════════════════════════════════════════════ */

  function updateMetaForResult(resultTitle) {
    const override = MV_RESULT_META[resultTitle];
    if (!override) return;
    setMeta('og:description',      override.desc, 'property');
    setMeta('twitter:description', override.desc);
    setMeta('description',         override.desc);
    if (override.title) {
      setTitle(override.title + ' | MirrorVerse');
      setMeta('og:title',      override.title + ' | MirrorVerse', 'property');
      setMeta('twitter:title', override.title + ' | MirrorVerse');
    }
  }


  /* ══════════════════════════════════════════════════════════
   *  RESULT SCREEN WATCHER
   *  Auto-updates meta when result screen activates on tools
   * ══════════════════════════════════════════════════════════ */

  function watchForResult() {
    /* Watch for result title element to be populated */
    const resultTitle = document.getElementById('result-title');
    if (!resultTitle) return;

    const observer = new MutationObserver(function() {
      const title = resultTitle.textContent.trim();
      if (title) {
        updateMetaForResult(title);
        observer.disconnect();
      }
    });

    observer.observe(resultTitle, { childList: true, subtree: true, characterData: true });
  }


  /* ══════════════════════════════════════════════════════════
   *  PUBLIC API
   * ══════════════════════════════════════════════════════════ */

  const MV_SEO = {
    apply           : applyPageSEO,
    updateForResult : updateMetaForResult,
    getSlug,
    config          : MV_SEO_CONFIG,
    data            : MV_SEO_MAP,
  };

  global.MV_SEO = MV_SEO;


  /* ══════════════════════════════════════════════════════════
   *  AUTO-INIT — runs immediately on script load
   * ══════════════════════════════════════════════════════════ */

  (function _init() {
    const slug = getSlug();
    applyPageSEO(slug);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', watchForResult);
    } else {
      watchForResult();
    }
    console.log(
      '%c[MirrorVerse SEO] Meta layer active. Page: ' + slug,
      'color:#06b6d4;font-weight:bold;'
    );
  })();

})(window);

/* ============================================================
 *  END OF mirrorverse-seo.js
 * ============================================================ */
