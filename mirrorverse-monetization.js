/**
 * ============================================================
 *  MIRRORVERSE MONETIZATION ENGINE
 *  mirrorverse-monetization.js  |  Version 1.0.0
 *  Load AFTER mirrorverse-core.js on every tool page
 * ============================================================
 *
 *  WHAT THIS FILE DOES:
 *  ─────────────────────────────────────────────────────────
 *  1. Manages the "Generate Passport Report" button + pop-under
 *  2. Injects the Interstitial trigger into tool processing screens
 *  3. Updates Social Bar copy to mirror MirrorVerse language
 *  4. Tracks ad interactions for optimization
 *  5. Handles Phase 1 → Phase 2 transition logic
 *
 *  LOAD ORDER (in Blogger theme or each page):
 *  1. mirrorverse-core.js         ← Passport Engine
 *  2. mirrorverse-monetization.js ← This file (after core)
 *  3. [individual tool JS]        ← Tool-specific logic
 *
 *  CONFIGURATION — Edit the CONFIG block below:
 * ============================================================
 */

;(function(global) {
  'use strict';

  /* ══════════════════════════════════════════════════════════
   *  CONFIGURATION
   *  Edit these values to match your Adsterra account details
   * ══════════════════════════════════════════════════════════ */

  const MV_ADS_CONFIG = {

    /* ── PHASE CONTROL ──────────────────────────────────────
     * 'phase1'  = Adsterra only (popunder active)
     * 'phase2'  = Adsterra + AdSense (popunder DISABLED)
     */
    phase: 'phase1',

    /* ── ADSTERRA KEYS ──────────────────────────────────────
     * Replace 'YOUR_KEY_HERE' with your actual Adsterra keys
     * Get them from: publishers.adsterra.com → Your Website → Formats
     */
    adsterra: {
      socialBarKey   : 'YOUR_SOCIAL_BAR_KEY_HERE',
      nativeBannerKey: 'YOUR_NATIVE_BANNER_KEY_HERE',
      leaderboardKey : 'YOUR_LEADERBOARD_KEY_HERE',
      popunderKey    : 'YOUR_POPUNDER_KEY_HERE',
      interstitialKey: 'YOUR_INTERSTITIAL_KEY_HERE',
    },

    /* ── SOCIAL BAR CUSTOM COPY ─────────────────────────────
     * Custom notification messages per page type.
     * If your Adsterra plan supports custom Social Bar text,
     * these strings are used. Otherwise they serve as internal
     * reference for the notification timing strategy.
     */
    socialBarCopy: {
      homepage          : '🪞 Your Passport is incomplete — 3 discoveries waiting',
      toolIntro         : '⚡ 847 people discovered their archetype today',
      toolResult        : '✅ Archetype Identification Complete — View Report',
      wealthResult      : '📊 Wealth Pattern Analysis Complete — Score: Processing',
      decisionResult    : '🔍 Decision Profile Verified — View Full Analysis',
      futureResult      : '📈 Future Trajectory Mapped — 94% Pattern Match',
      passportDashboard : '📊 Your Passport is 34% complete — 6 layers still locked',
      hiddenResult      : '🔮 Your hidden talent has been added to your Passport',
    },

    /* ── INTERSTITIAL TIMING ────────────────────────────────
     * When to fire the interstitial during the processing animation.
     * The processing animation runs for 3800ms total.
     * Best window: 1500ms (user is engaged, nothing is interrupted)
     */
    interstitialDelay: 1500,

    /* ── POPUNDER SETTINGS ──────────────────────────────────
     * Delay before navigation after pop-under trigger fires.
     * Short enough to not feel broken, long enough for pop to register.
     */
    popunderDelay: 300,

    /* ── REPORT BUTTON SETTINGS ─────────────────────────────
     * Minimum tools completed before premium report is offered.
     * Below this threshold, show "complete more tools" prompt.
     */
    minToolsForReport: 3,

    /* ── PREMIUM REPORT PRICE ───────────────────────────────
     * Phase 2 pricing (displayed on the button in premium mode)
     */
    reportPrice: '$7',
  };


  /* ══════════════════════════════════════════════════════════
   *  SOCIAL BAR NOTIFICATION SYSTEM
   *  Detects current page and applies appropriate copy timing
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.detectPageContext()
   * Returns the current page type based on URL or DOM markers.
   */
  function detectPageContext() {
    const path = window.location.pathname.toLowerCase();
    if (path === '/' || path.includes('index'))        return 'homepage';
    if (path.includes('my-passport'))                  return 'passportDashboard';
    if (path.includes('wealth'))                       return 'wealthResult';
    if (path.includes('decision'))                     return 'decisionResult';
    if (path.includes('future'))                       return 'futureResult';
    if (path.includes('hidden'))                       return 'hiddenResult';
    // Check if we're on a result screen
    if (document.getElementById('screen-result') &&
        document.getElementById('screen-result').classList.contains('mv-screen--active')) {
      return 'toolResult';
    }
    if (document.getElementById('screen-intro') &&
        document.getElementById('screen-intro').classList.contains('mv-screen--active')) {
      return 'toolIntro';
    }
    return 'toolIntro';
  }

  /**
   * MV_ADS.triggerSocialBarCopy(context)
   * If Adsterra's Social Bar API supports dynamic copy injection,
   * this function applies the MirrorVerse-specific message.
   * Falls back gracefully if API not available.
   */
  function triggerSocialBarCopy(context) {
    const copy = MV_ADS_CONFIG.socialBarCopy[context] || MV_ADS_CONFIG.socialBarCopy.toolIntro;
    // Attempt to inject into Adsterra Social Bar if API exists
    if (typeof window._astSocialBar !== 'undefined' && window._astSocialBar.setMessage) {
      try {
        window._astSocialBar.setMessage(copy);
      } catch(e) {
        // Fail silently — Social Bar will show default Adsterra creative
      }
    }
    // Log for monitoring
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[MirrorVerse Ads] Social Bar copy:', copy);
    }
  }


  /* ══════════════════════════════════════════════════════════
   *  INTERSTITIAL ENGINE
   *  Hooks into the tool processing animation timing
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.fireInterstitial()
   * Called from within the runProcessing() function in each tool.
   * Fires the Adsterra interstitial at the optimal timing window.
   */
  function fireInterstitial() {
    try {
      // Method 1: Adsterra interstitial via global function (common pattern)
      if (typeof window.showAdsterraPop === 'function') {
        window.showAdsterraPop();
        return;
      }
      // Method 2: Adsterra interstitial via _int object
      if (typeof window._int !== 'undefined' && window._int.show) {
        window._int.show();
        return;
      }
      // Method 3: Adsterra interstitial via direct iframe injection
      // (Some Adsterra formats work by the script tag in head — no JS call needed)
      // In this case the interstitial fires automatically and no call is required.
      console.log('[MirrorVerse Ads] Interstitial trigger fired at processing screen');
    } catch(e) {
      // Fail silently — never break the user experience
    }
  }

  /**
   * MV_ADS.hookProcessingScreen()
   * Watches for the processing screen to become active,
   * then fires the interstitial at the configured delay.
   *
   * Call this after the tool page initializes.
   * OR — tools can call MV_ADS.fireInterstitial() directly
   * inside their runProcessing() function at the 1500ms mark.
   */
  function hookProcessingScreen() {
    // Option A: Watch for screen-processing to become active
    const processingScreen = document.getElementById('screen-processing');
    if (!processingScreen) return;

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' &&
            mutation.attributeName === 'class') {
          if (processingScreen.classList.contains('mv-screen--active')) {
            // Processing screen just activated — fire interstitial after delay
            setTimeout(fireInterstitial, MV_ADS_CONFIG.interstitialDelay);
          }
        }
      });
    });

    observer.observe(processingScreen, { attributes: true });
  }


  /* ══════════════════════════════════════════════════════════
   *  GENERATE PASSPORT REPORT BUTTON
   *  Phase 1: Pop-under trigger
   *  Phase 2: Premium checkout gateway
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.initReportButton()
   * Finds the Generate Report button and wires up the correct
   * behavior based on current phase configuration.
   */
  function initReportButton() {
    const btn = document.getElementById('btn-generate-report');
    if (!btn) return;

    if (MV_ADS_CONFIG.phase === 'phase1') {
      /* ── PHASE 1: Pop-under trigger ── */
      btn.addEventListener('click', function(e) {
        e.preventDefault();

        // Fire Adsterra pop-under (the popunder script installed in <head>
        // typically fires automatically on navigation events.
        // If manual trigger is needed, call it here)
        try {
          if (typeof window._pop !== 'undefined') {
            _pop.push(['trigger']);
          }
        } catch(err) {
          // Fail silently
        }

        // Show processing feedback
        btn.textContent = 'Opening Report...';
        btn.disabled = true;

        // Navigate to passport after short delay (lets pop-under register)
        setTimeout(function() {
          window.location.href = '/my-passport';
        }, MV_ADS_CONFIG.popunderDelay);
      });

    } else {
      /* ── PHASE 2: Premium checkout ── */
      btn.addEventListener('click', function() {
        const profile = (typeof MirrorVerse !== 'undefined')
          ? MirrorVerse.getPassport()
          : null;

        const toolsDone = profile
          ? (profile.achievements.toolsCompleted.length || 0)
          : 0;

        if (toolsDone >= MV_ADS_CONFIG.minToolsForReport) {
          // Enough data — redirect to premium checkout
          window.location.href = '/passport-report-checkout';
        } else {
          // Not enough data — prompt to complete more tools
          const remaining = MV_ADS_CONFIG.minToolsForReport - toolsDone;
          alert(`Complete ${remaining} more tool${remaining === 1 ? '' : 's'} to unlock your Full Passport Report.`);
        }
      });

      // Update button text to show price in Phase 2
      btn.textContent = 'Generate Report — ' + MV_ADS_CONFIG.reportPrice + ' →';
    }
  }


  /* ══════════════════════════════════════════════════════════
   *  REPORT BUTTON HTML INJECTOR
   *  Automatically injects the Generate Report button
   *  into any tool result screen that has the placeholder
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.injectReportButton()
   * Looks for the #mv-report-cta-placeholder element in the tool HTML.
   * If found, replaces it with the full report button component.
   * This allows adding the button to tool pages without editing each file.
   */
  function injectReportButton() {
    const placeholder = document.getElementById('mv-report-cta-placeholder');
    if (!placeholder) return;

    const buttonHTML = `
      <div class="mv-report-cta" id="mv-report-cta">
        <div class="mv-report-cta__inner">
          <div class="mv-report-cta__icon">📋</div>
          <div class="mv-report-cta__text">
            <div class="mv-report-cta__title">Generate My Full Passport Report</div>
            <div class="mv-report-cta__sub">
              ${MV_ADS_CONFIG.phase === 'phase1'
                ? 'A complete breakdown of everything your Passport has revealed'
                : 'Premium PDF — ' + MV_ADS_CONFIG.reportPrice + ' one-time'}
            </div>
          </div>
          <button class="mv-btn mv-btn--primary mv-btn--sm" id="btn-generate-report">
            Generate Report →
          </button>
        </div>
      </div>
    `;

    placeholder.outerHTML = buttonHTML;
  }


  /* ══════════════════════════════════════════════════════════
   *  RESPONSIVE AD CONTAINER OPTIMIZER
   *  Ensures ad containers serve the right format on mobile
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.optimizeAdContainers()
   * On mobile, swaps 728x90 leaderboard containers to 320x50.
   * Adsterra handles this automatically for most formats,
   * but this ensures our CSS containers size correctly too.
   */
  function optimizeAdContainers() {
    const isMobile = window.innerWidth < 768;
    const banners = document.querySelectorAll('.mv-ad-banner');

    banners.forEach(function(banner) {
      if (isMobile) {
        banner.style.minHeight = '60px';
        banner.setAttribute('data-size', '320x50');
      } else {
        banner.style.minHeight = '90px';
        banner.setAttribute('data-size', '728x90');
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
   *  RESULT SCREEN DETECTOR
   *  Updates Social Bar copy when result screen activates
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.watchForResultScreen()
   * When a tool's result screen becomes visible,
   * update Social Bar copy to validation-confirmation language.
   */
  function watchForResultScreen() {
    const resultScreen = document.getElementById('screen-result');
    if (!resultScreen) return;

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' &&
            mutation.attributeName === 'class') {
          if (resultScreen.classList.contains('mv-screen--active')) {
            // Result just revealed — fire validation-copy Social Bar
            const path = window.location.pathname.toLowerCase();
            let context = 'toolResult';
            if (path.includes('wealth'))   context = 'wealthResult';
            if (path.includes('decision')) context = 'decisionResult';
            if (path.includes('future'))   context = 'futureResult';
            if (path.includes('hidden'))   context = 'hiddenResult';
            triggerSocialBarCopy(context);
            // Init the report button once result screen is active
            initReportButton();
          }
        }
      });
    });

    observer.observe(resultScreen, { attributes: true });
  }


  /* ══════════════════════════════════════════════════════════
   *  AD IMPRESSION TRACKER
   *  Lightweight tracking for optimization (no external calls)
   * ══════════════════════════════════════════════════════════ */

  /**
   * MV_ADS.trackImpression(format, page)
   * Stores ad impression data in localStorage for self-optimization.
   * No external calls. No privacy concerns. Pure internal data.
   */
  function trackImpression(format, page) {
    try {
      const key = 'mv_ad_impressions';
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      const today = new Date().toISOString().split('T')[0];

      if (!existing[today]) existing[today] = {};
      if (!existing[today][format]) existing[today][format] = 0;
      existing[today][format]++;

      // Keep only last 30 days
      const dates = Object.keys(existing).sort();
      if (dates.length > 30) {
        delete existing[dates[0]];
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch(e) {
      // Fail silently
    }
  }

  /**
   * MV_ADS.getImpressionReport()
   * Returns a summary of ad impressions for the last 30 days.
   * Call from browser console for optimization insights.
   */
  function getImpressionReport() {
    try {
      const data = JSON.parse(localStorage.getItem('mv_ad_impressions') || '{}');
      console.group('[MirrorVerse Ads] Impression Report');
      console.table(data);
      console.groupEnd();
      return data;
    } catch(e) {
      return {};
    }
  }


  /* ══════════════════════════════════════════════════════════
   *  PUBLIC API
   * ══════════════════════════════════════════════════════════ */

  const MV_ADS = {
    config              : MV_ADS_CONFIG,
    fireInterstitial,
    initReportButton,
    injectReportButton,
    trackImpression,
    getImpressionReport,
    detectPageContext,
  };


  /* ══════════════════════════════════════════════════════════
   *  AUTO-INIT
   *  Runs immediately when script loads on any page
   * ══════════════════════════════════════════════════════════ */

  (function _autoInit() {
    // Wait for DOM to be ready
    function onReady(fn) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    }

    onReady(function() {
      // 1. Detect page context
      const ctx = detectPageContext();

      // 2. Apply Social Bar copy for current page
      triggerSocialBarCopy(ctx);

      // 3. Optimize ad containers for device
      optimizeAdContainers();

      // 4. Hook processing screen interstitial (tool pages)
      hookProcessingScreen();

      // 5. Watch for result screen activation (tool pages)
      watchForResultScreen();

      // 6. Inject report button if placeholder exists
      injectReportButton();

      // 7. Init report button if already on result screen
      if (ctx === 'toolResult') {
        initReportButton();
      }

      // 8. Track page impression
      trackImpression('pageview', ctx);

      // 9. Re-optimize on resize
      window.addEventListener('resize', optimizeAdContainers, { passive: true });

      // 10. Expose globally
      global.MV_ADS = MV_ADS;

      console.log(
        '%c[MirrorVerse Ads] Monetization Engine v1.0 loaded. Phase: ' + MV_ADS_CONFIG.phase,
        'color:#f59e0b;font-weight:bold;'
      );
    });
  })();

})(window);

/* ============================================================
 *  END OF mirrorverse-monetization.js
 * ============================================================ */
