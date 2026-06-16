/**
 * ============================================================
 *  MIRRORVERSE PASSPORT ENGINE
 *  mirrorverse-core.js  |  Version 1.0.0
 *  Classification: Core Infrastructure — Load on Every Page
 * ============================================================
 *
 *  WHAT THIS FILE DOES:
 *  ─────────────────────────────────────────────────────────
 *  1. Defines the complete MirrorVerse Passport schema
 *  2. Reads and writes the Passport from/to localStorage
 *  3. Manages XP, Levels, Badges, and Streaks
 *  4. Tracks tool completions and realm progress
 *  5. Provides helper functions every tool uses
 *  6. Fires events so UI components can react to changes
 *  7. Protects against data corruption and missing fields
 *
 *  HOW TO USE:
 *  ─────────────────────────────────────────────────────────
 *  Include this script BEFORE any tool or dashboard code.
 *  All tools interact with the Passport through this API.
 *  Never write directly to localStorage from a tool file.
 *
 *  LOAD ORDER:
 *  1. mirrorverse-core.js     ← this file (always first)
 *  2. mirrorverse-ui.css      ← design system
 *  3. [individual tool JS]    ← tool-specific logic
 * ============================================================
 */

;(function (global) {
  'use strict';

  /* ══════════════════════════════════════════════════════════
   *  SECTION 1 — CONSTANTS & CONFIGURATION
   * ══════════════════════════════════════════════════════════ */

  const MV_CONFIG = {
    STORAGE_KEY     : 'mirrorProfile',
    VERSION         : '1.0.0',
    XP_PER_TOOL     : 25,
    XP_PER_REALM    : 100,
    XP_STREAK_BONUS : 10,

    /* Level thresholds — XP required to REACH that level */
    LEVELS: [
      { id: 1, name: 'Explorer',         xpRequired: 0    },
      { id: 2, name: 'Seeker',           xpRequired: 100  },
      { id: 3, name: 'Discoverer',       xpRequired: 250  },
      { id: 4, name: 'Pathfinder',       xpRequired: 500  },
      { id: 5, name: 'Architect',        xpRequired: 800  },
      { id: 6, name: 'Visionary',        xpRequired: 1200 },
      { id: 7, name: 'Master of Mirrors',xpRequired: 1700 },
    ],

    /* All 8 realms and the tools that count toward each */
    REALMS: {
      identity : {
        label    : 'Identity Realm',
        icon     : '🪞',
        question : 'Who am I?',
        tools    : ['personality-archetype','decision-style','thinking-style','purpose-finder','energy-type','leadership-style'],
      },
      hidden   : {
        label    : 'Hidden Realm',
        icon     : '🔮',
        question : 'What don\'t I know about myself?',
        tools    : ['hidden-talent-finder','genius-type','blind-spot-finder','opportunity-detector'],
      },
      future   : {
        label    : 'Future Realm',
        icon     : '🌌',
        question : 'Who can I become?',
        tools    : ['future-self-predictor','life-path-explorer','success-predictor','legacy-builder'],
      },
      wealth   : {
        label    : 'Wealth Realm',
        icon     : '💎',
        question : 'Can I become rich?',
        tools    : ['wealth-potential-analyzer','entrepreneur-score','money-personality','investor-type'],
      },
      love     : {
        label    : 'Love Realm',
        icon     : '❤️',
        question : 'Who matches me?',
        tools    : ['relationship-style','compatibility-finder','communication-type'],
      },
      career   : {
        label    : 'Career Realm',
        icon     : '🚀',
        question : 'What should I become?',
        tools    : ['career-finder','work-style-analyzer','leadership-potential'],
      },
      mind     : {
        label    : 'Mind Realm',
        icon     : '🧠',
        question : 'How do I think?',
        tools    : ['thinking-style','focus-type','learning-style','decision-style'],
      },
      social   : {
        label    : 'Social Realm',
        icon     : '🌐',
        question : 'How do I influence others?',
        tools    : ['social-archetype','influence-style','communication-type'],
      },
    },

    /* Badge definitions — id, label, condition description */
    BADGES: [
      { id: 'first-discovery',        label: 'First Discovery',         description: 'Completed your first tool',             icon: '⭐' },
      { id: 'identity-explorer',      label: 'Identity Explorer',       description: 'Completed 2 Identity Realm tools',      icon: '🪞' },
      { id: 'future-seeker',          label: 'Future Seeker',           description: 'Completed 2 Future Realm tools',        icon: '🌌' },
      { id: 'wealth-hunter',          label: 'Wealth Hunter',           description: 'Completed 2 Wealth Realm tools',        icon: '💎' },
      { id: 'love-navigator',         label: 'Love Navigator',          description: 'Completed 2 Love Realm tools',          icon: '❤️' },
      { id: 'career-architect',       label: 'Career Architect',        description: 'Completed 2 Career Realm tools',        icon: '🚀' },
      { id: 'mind-master',            label: 'Mind Master',             description: 'Completed 2 Mind Realm tools',          icon: '🧠' },
      { id: 'social-sovereign',       label: 'Social Sovereign',        description: 'Completed 2 Social Realm tools',        icon: '🌐' },
      { id: 'hidden-uncovered',       label: 'Hidden Uncovered',        description: 'Completed 2 Hidden Realm tools',        icon: '🔮' },
      { id: 'five-tools',             label: 'Deep Diver',              description: 'Completed 5 tools',                    icon: '🏊' },
      { id: 'ten-tools',              label: 'True Explorer',           description: 'Completed 10 tools',                   icon: '🗺️' },
      { id: 'twenty-five-tools',      label: 'MirrorVerse Veteran',     description: 'Completed 25 tools',                   icon: '🏆' },
      { id: 'streak-3',               label: 'Consistent Seeker',       description: '3-day discovery streak',               icon: '🔥' },
      { id: 'streak-7',               label: 'Weekly Pilgrim',          description: '7-day discovery streak',               icon: '🌟' },
      { id: 'passport-25',            label: 'Taking Shape',            description: 'Passport 25% complete',                icon: '📘' },
      { id: 'passport-50',            label: 'Half Revealed',           description: 'Passport 50% complete',                icon: '📗' },
      { id: 'passport-100',           label: 'Fully Unveiled',          description: 'Passport 100% complete',               icon: '📕' },
      { id: 'identity-realm-complete',label: 'Identity Mastery',        description: 'Completed all Identity Realm tools',   icon: '👑' },
      { id: 'seeker-level',           label: 'Level Up: Seeker',        description: 'Reached Seeker level',                 icon: '🎖️' },
      { id: 'discoverer-level',       label: 'Level Up: Discoverer',    description: 'Reached Discoverer level',             icon: '🎖️' },
    ],

    /* Recommendation graph — after each tool, suggest these next */
    RECOMMENDATIONS: {
      'personality-archetype'    : ['hidden-talent-finder', 'future-self-predictor', 'decision-style'],
      'hidden-talent-finder'     : ['genius-type', 'future-self-predictor', 'opportunity-detector'],
      'future-self-predictor'    : ['career-finder', 'life-path-explorer', 'success-predictor'],
      'career-finder'            : ['wealth-potential-analyzer', 'entrepreneur-score', 'leadership-style'],
      'wealth-potential-analyzer': ['entrepreneur-score', 'investor-type', 'money-personality'],
      'relationship-style'       : ['compatibility-finder', 'communication-type', 'social-archetype'],
      'decision-style'           : ['thinking-style', 'focus-type', 'blind-spot-finder'],
      'thinking-style'           : ['learning-style', 'genius-type', 'focus-type'],
      'purpose-finder'           : ['legacy-builder', 'life-path-explorer', 'personality-archetype'],
      'life-path-explorer'       : ['future-self-predictor', 'purpose-finder', 'success-predictor'],
      'entrepreneur-score'       : ['money-personality', 'investor-type', 'leadership-style'],
      'money-personality'        : ['wealth-potential-analyzer', 'investor-type', 'entrepreneur-score'],
      'communication-type'       : ['influence-style', 'social-archetype', 'relationship-style'],
      'genius-type'              : ['hidden-talent-finder', 'learning-style', 'success-predictor'],
      'leadership-style'         : ['influence-style', 'communication-type', 'career-finder'],
      'focus-type'               : ['learning-style', 'thinking-style', 'decision-style'],
      'learning-style'           : ['focus-type', 'thinking-style', 'genius-type'],
      'social-archetype'         : ['influence-style', 'communication-type', 'personality-archetype'],
      'compatibility-finder'     : ['relationship-style', 'communication-type', 'social-archetype'],
      'blind-spot-finder'        : ['hidden-talent-finder', 'decision-style', 'personality-archetype'],
      'legacy-builder'           : ['purpose-finder', 'life-path-explorer', 'success-predictor'],
      'success-predictor'        : ['wealth-potential-analyzer', 'entrepreneur-score', 'future-self-predictor'],
      'influence-style'          : ['leadership-style', 'communication-type', 'social-archetype'],
      'investor-type'            : ['money-personality', 'wealth-potential-analyzer', 'entrepreneur-score'],
      'opportunity-detector'     : ['success-predictor', 'entrepreneur-score', 'future-self-predictor'],
    },

    /* Tool metadata — human-readable labels for every tool */
    TOOL_META: {
      'personality-archetype'    : { label: 'Personality Archetype',     realm: 'identity', emoji: '🪞' },
      'hidden-talent-finder'     : { label: 'Hidden Talent Finder',      realm: 'hidden',   emoji: '🔮' },
      'future-self-predictor'    : { label: 'Future Self Predictor',     realm: 'future',   emoji: '🌌' },
      'career-finder'            : { label: 'Career Finder',             realm: 'career',   emoji: '🚀' },
      'wealth-potential-analyzer': { label: 'Wealth Potential Analyzer', realm: 'wealth',   emoji: '💎' },
      'relationship-style'       : { label: 'Relationship Style',        realm: 'love',     emoji: '❤️' },
      'decision-style'           : { label: 'Decision Style',            realm: 'mind',     emoji: '🧠' },
      'thinking-style'           : { label: 'Thinking Style',            realm: 'mind',     emoji: '🧠' },
      'purpose-finder'           : { label: 'Purpose Finder',            realm: 'identity', emoji: '⭐' },
      'life-path-explorer'       : { label: 'Life Path Explorer',        realm: 'future',   emoji: '🗺️' },
      'entrepreneur-score'       : { label: 'Entrepreneur Score',        realm: 'wealth',   emoji: '💡' },
      'money-personality'        : { label: 'Money Personality',         realm: 'wealth',   emoji: '💰' },
      'communication-type'       : { label: 'Communication Type',        realm: 'social',   emoji: '🗣️' },
      'genius-type'              : { label: 'Genius Type',               realm: 'hidden',   emoji: '✨' },
      'leadership-style'         : { label: 'Leadership Style',          realm: 'career',   emoji: '👑' },
      'focus-type'               : { label: 'Focus Type',                realm: 'mind',     emoji: '🎯' },
      'learning-style'           : { label: 'Learning Style',            realm: 'mind',     emoji: '📚' },
      'social-archetype'         : { label: 'Social Archetype',          realm: 'social',   emoji: '🌐' },
      'compatibility-finder'     : { label: 'Compatibility Finder',      realm: 'love',     emoji: '💞' },
      'blind-spot-finder'        : { label: 'Blind Spot Finder',         realm: 'hidden',   emoji: '👁️' },
      'legacy-builder'           : { label: 'Legacy Builder',            realm: 'future',   emoji: '🏛️' },
      'success-predictor'        : { label: 'Success Predictor',         realm: 'future',   emoji: '📈' },
      'influence-style'          : { label: 'Influence Style',           realm: 'social',   emoji: '🌟' },
      'investor-type'            : { label: 'Investor Type',             realm: 'wealth',   emoji: '📊' },
      'opportunity-detector'     : { label: 'Opportunity Detector',      realm: 'hidden',   emoji: '🔍' },
    },
  };


  /* ══════════════════════════════════════════════════════════
   *  SECTION 2 — DEFAULT PASSPORT SCHEMA
   *  This is the blank passport every new user starts with.
   *  All fields default to null, 0, or [].
   *  Tools write into this structure, never outside it.
   * ══════════════════════════════════════════════════════════ */

  function _buildDefaultPassport() {
    return {
      _version : MV_CONFIG.VERSION,
      _created : new Date().toISOString(),

      /* ── IDENTITY LAYER ── */
      identity: {
        archetype      : null,   // e.g. "The Visionary"
        energyType     : null,   // e.g. "Solar"
        thinkingStyle  : null,   // e.g. "Analytical"
        decisionStyle  : null,   // e.g. "Intuitive"
        leadershipStyle: null,   // e.g. "Servant Leader"
        purposeType    : null,   // e.g. "Creator"
      },

      /* ── HIDDEN LAYER ── */
      hidden: {
        talents    : [],          // array of strings
        strengths  : [],          // array of strings
        blindSpots : [],          // array of strings
        geniusType : null,        // e.g. "Spatial Genius"
      },

      /* ── FUTURE LAYER ── */
      future: {
        futureIdentity : null,    // e.g. "The Architect"
        futurePaths    : [],      // array of strings
        futureCareers  : [],      // array of strings
        futureScore    : 0,       // 0–100
      },

      /* ── WEALTH LAYER ── */
      wealth: {
        wealthPotential  : 0,     // 0–100
        moneyStyle       : null,  // e.g. "Builder"
        entrepreneurScore: 0,     // 0–100
        investorType     : null,  // e.g. "Growth Investor"
      },

      /* ── LOVE LAYER ── */
      love: {
        relationshipStyle  : null, // e.g. "The Nurturer"
        loveLanguage       : null, // e.g. "Words of Affirmation"
        compatibilityType  : null, // e.g. "Complementary"
      },

      /* ── CORE DIMENSION SCORES (0–100, accumulate across tools) ── */
      scores: {
        curiosity    : 0,
        creativity   : 0,
        ambition     : 0,
        confidence   : 0,
        empathy      : 0,
        leadership   : 0,
        discipline   : 0,
        adaptability : 0,
      },

      /* ── ACHIEVEMENT LAYER ── */
      achievements: {
        xp             : 0,
        level          : 1,
        levelName      : 'Explorer',
        badges         : [],       // array of badge IDs earned
        streak         : 0,        // consecutive days
        longestStreak  : 0,
        lastVisit      : null,     // ISO date string
        toolsCompleted : [],       // array of tool IDs (no duplicates)
        totalCompleted : 0,
      },

      /* ── REALM PROGRESS ── */
      realms: {
        identity : { completed: [], progress: 0 },
        hidden   : { completed: [], progress: 0 },
        future   : { completed: [], progress: 0 },
        wealth   : { completed: [], progress: 0 },
        love     : { completed: [], progress: 0 },
        career   : { completed: [], progress: 0 },
        mind     : { completed: [], progress: 0 },
        social   : { completed: [], progress: 0 },
      },
    };
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 3 — STORAGE ENGINE
   *  Safe read/write wrappers around localStorage.
   *  All reads merge with defaults to fill missing fields.
   * ══════════════════════════════════════════════════════════ */

  /**
   * _deepMerge(target, source)
   * Recursively fills missing keys in target from source.
   * Does NOT overwrite existing non-null values.
   */
  function _deepMerge(target, source) {
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (typeof target[key] !== 'object' || target[key] === null) {
          target[key] = {};
        }
        _deepMerge(target[key], source[key]);
      } else {
        if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  /**
   * _loadPassport()
   * Reads passport from localStorage.
   * If missing, creates a fresh default passport.
   * If partial (old version), merges with defaults.
   */
  function _loadPassport() {
    try {
      const raw = localStorage.getItem(MV_CONFIG.STORAGE_KEY);
      if (!raw) {
        return _buildDefaultPassport();
      }
      const parsed = JSON.parse(raw);
      const defaults = _buildDefaultPassport();
      return _deepMerge(parsed, defaults);
    } catch (e) {
      console.warn('[MirrorVerse] Passport read error — resetting to default:', e);
      return _buildDefaultPassport();
    }
  }

  /**
   * _savePassport(profile)
   * Writes the full passport object to localStorage.
   * Fires a custom 'mv:passportUpdated' event for UI listeners.
   */
  function _savePassport(profile) {
    try {
      profile._lastUpdated = new Date().toISOString();
      localStorage.setItem(MV_CONFIG.STORAGE_KEY, JSON.stringify(profile));
      /* Notify all UI components that the passport changed */
      const event = new CustomEvent('mv:passportUpdated', { detail: { profile } });
      document.dispatchEvent(event);
      return true;
    } catch (e) {
      console.error('[MirrorVerse] Passport save error:', e);
      return false;
    }
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 4 — STREAK & DATE UTILITIES
   * ══════════════════════════════════════════════════════════ */

  /**
   * _getTodayString()
   * Returns today's date as YYYY-MM-DD string.
   */
  function _getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * _updateStreak(profile)
   * Checks if user visited yesterday → extends streak.
   * Checks if user visited today already → no change.
   * Otherwise resets streak to 1.
   */
  function _updateStreak(profile) {
    const today     = _getTodayString();
    const lastVisit = profile.achievements.lastVisit;

    if (!lastVisit) {
      /* First ever visit */
      profile.achievements.streak    = 1;
      profile.achievements.lastVisit = today;
      return profile;
    }

    if (lastVisit === today) {
      /* Already visited today — no streak change */
      return profile;
    }

    const last      = new Date(lastVisit);
    const now       = new Date(today);
    const diffDays  = Math.round((now - last) / 86400000);

    if (diffDays === 1) {
      /* Visited yesterday — extend streak */
      profile.achievements.streak += 1;
    } else {
      /* Streak broken */
      profile.achievements.streak = 1;
    }

    /* Track longest streak */
    if (profile.achievements.streak > profile.achievements.longestStreak) {
      profile.achievements.longestStreak = profile.achievements.streak;
    }

    profile.achievements.lastVisit = today;
    return profile;
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 5 — XP & LEVEL ENGINE
   * ══════════════════════════════════════════════════════════ */

  /**
   * _getLevelForXP(xp)
   * Returns the level object matching the given XP total.
   */
  function _getLevelForXP(xp) {
    let currentLevel = MV_CONFIG.LEVELS[0];
    for (const level of MV_CONFIG.LEVELS) {
      if (xp >= level.xpRequired) {
        currentLevel = level;
      }
    }
    return currentLevel;
  }

  /**
   * _getNextLevel(currentLevelId)
   * Returns the next level object, or null if at max.
   */
  function _getNextLevel(currentLevelId) {
    const idx = MV_CONFIG.LEVELS.findIndex(l => l.id === currentLevelId);
    return idx < MV_CONFIG.LEVELS.length - 1 ? MV_CONFIG.LEVELS[idx + 1] : null;
  }

  /**
   * _addXP(profile, amount)
   * Adds XP to the profile and recalculates level.
   * Returns { profile, leveledUp, newLevel }
   */
  function _addXP(profile, amount) {
    const prevLevel = profile.achievements.level;
    profile.achievements.xp += amount;

    const newLevelObj = _getLevelForXP(profile.achievements.xp);
    profile.achievements.level     = newLevelObj.id;
    profile.achievements.levelName = newLevelObj.name;

    const leveledUp = newLevelObj.id > prevLevel;
    return { profile, leveledUp, newLevel: newLevelObj };
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 6 — BADGE ENGINE
   * ══════════════════════════════════════════════════════════ */

  /**
   * _checkAndAwardBadges(profile)
   * Evaluates all badge conditions against the current profile.
   * Awards any newly earned badges.
   * Returns array of newly awarded badge IDs.
   */
  function _checkAndAwardBadges(profile) {
    const earned    = profile.achievements.badges;
    const newBadges = [];

    const award = (id) => {
      if (!earned.includes(id)) {
        earned.push(id);
        newBadges.push(id);
      }
    };

    const total    = profile.achievements.totalCompleted;
    const streak   = profile.achievements.streak;
    const passport = MirrorVerse.getPassportCompletionPercent(profile);

    /* Tool count badges */
    if (total >= 1)  award('first-discovery');
    if (total >= 5)  award('five-tools');
    if (total >= 10) award('ten-tools');
    if (total >= 25) award('twenty-five-tools');

    /* Streak badges */
    if (streak >= 3) award('streak-3');
    if (streak >= 7) award('streak-7');

    /* Passport completion badges */
    if (passport >= 25)  award('passport-25');
    if (passport >= 50)  award('passport-50');
    if (passport >= 100) award('passport-100');

    /* Realm-specific badges — 2+ tools in realm */
    const realmBadgeMap = {
      identity : 'identity-explorer',
      future   : 'future-seeker',
      wealth   : 'wealth-hunter',
      love     : 'love-navigator',
      career   : 'career-architect',
      mind     : 'mind-master',
      social   : 'social-sovereign',
      hidden   : 'hidden-uncovered',
    };

    for (const [realmKey, badgeId] of Object.entries(realmBadgeMap)) {
      const realmData = profile.realms[realmKey];
      if (realmData && realmData.completed.length >= 2) {
        award(badgeId);
      }
    }

    /* Full Identity Realm completion */
    const identityTools   = MV_CONFIG.REALMS.identity.tools;
    const identityDone    = profile.realms.identity.completed;
    const identityComplete = identityTools.every(t => identityDone.includes(t));
    if (identityComplete) award('identity-realm-complete');

    /* Level badges */
    if (profile.achievements.level >= 2) award('seeker-level');
    if (profile.achievements.level >= 3) award('discoverer-level');

    return newBadges;
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 7 — REALM PROGRESS ENGINE
   * ══════════════════════════════════════════════════════════ */

  /**
   * _updateRealmProgress(profile, toolId)
   * Finds which realm(s) the tool belongs to.
   * Adds tool to realm.completed if not already there.
   * Recalculates realm progress percentage.
   */
  function _updateRealmProgress(profile, toolId) {
    for (const [realmKey, realmConfig] of Object.entries(MV_CONFIG.REALMS)) {
      if (realmConfig.tools.includes(toolId)) {
        const realm = profile.realms[realmKey];
        if (!realm.completed.includes(toolId)) {
          realm.completed.push(toolId);
          /* Progress = completed / total tools in realm (capped at 100) */
          realm.progress = Math.min(100, Math.round(
            (realm.completed.length / realmConfig.tools.length) * 100
          ));
        }
      }
    }
    return profile;
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 8 — PASSPORT COMPLETION CALCULATOR
   * ══════════════════════════════════════════════════════════ */

  /**
   * _calcPassportCompletion(profile)
   * Counts how many key passport fields are filled vs. total.
   * Returns a 0–100 percentage.
   */
  function _calcPassportCompletion(profile) {
    const fields = [
      /* Identity */
      profile.identity.archetype,
      profile.identity.energyType,
      profile.identity.thinkingStyle,
      profile.identity.decisionStyle,
      profile.identity.leadershipStyle,
      profile.identity.purposeType,
      /* Hidden */
      profile.hidden.geniusType,
      profile.hidden.talents.length > 0    ? true : null,
      profile.hidden.blindSpots.length > 0 ? true : null,
      /* Future */
      profile.future.futureIdentity,
      profile.future.futureScore > 0 ? true : null,
      profile.future.futurePaths.length > 0 ? true : null,
      /* Wealth */
      profile.wealth.moneyStyle,
      profile.wealth.wealthPotential > 0    ? true : null,
      profile.wealth.entrepreneurScore > 0  ? true : null,
      profile.wealth.investorType,
      /* Love */
      profile.love.relationshipStyle,
      profile.love.loveLanguage,
      profile.love.compatibilityType,
    ];

    const total  = fields.length;
    const filled = fields.filter(f => f !== null && f !== undefined && f !== false).length;
    return Math.round((filled / total) * 100);
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 9 — DIMENSION SCORE UPDATER
   *  Tools submit a partial scores object.
   *  Existing scores are averaged with new values (rolling avg).
   * ══════════════════════════════════════════════════════════ */

  /**
   * _updateDimensionScores(profile, newScores)
   * newScores: object with any subset of the 8 dimensions.
   * Each provided dimension is averaged with existing value.
   */
  function _updateDimensionScores(profile, newScores) {
    if (!newScores || typeof newScores !== 'object') return profile;

    const dims = ['curiosity','creativity','ambition','confidence','empathy','leadership','discipline','adaptability'];
    for (const dim of dims) {
      if (newScores[dim] !== undefined && typeof newScores[dim] === 'number') {
        const current = profile.scores[dim] || 0;
        if (current === 0) {
          profile.scores[dim] = Math.min(100, Math.round(newScores[dim]));
        } else {
          /* Rolling average — gives weight to first reading but allows evolution */
          profile.scores[dim] = Math.min(100, Math.round((current * 0.6) + (newScores[dim] * 0.4)));
        }
      }
    }
    return profile;
  }


  /* ══════════════════════════════════════════════════════════
   *  SECTION 10 — PUBLIC API
   *  Everything a tool or dashboard needs to call.
   * ══════════════════════════════════════════════════════════ */

  const MirrorVerse = {

    /* ── CONFIG ACCESS ── */
    config : MV_CONFIG,


    /* ── GET PASSPORT ── */
    /**
     * MirrorVerse.getPassport()
     * Returns the current full passport object.
     * Always safe — returns defaults if nothing saved yet.
     */
    getPassport() {
      return _loadPassport();
    },


    /* ── RECORD VISIT ── */
    /**
     * MirrorVerse.recordVisit()
     * Call on every page load.
     * Updates streak, saves passport.
     * Returns the updated profile.
     */
    recordVisit() {
      let profile = _loadPassport();
      profile = _updateStreak(profile);
      _savePassport(profile);
      return profile;
    },


    /* ══════════════════════════════════════════════════════
     * CORE TOOL COMPLETION METHOD
     * ══════════════════════════════════════════════════════
     *
     * MirrorVerse.completeTool(toolId, data)
     *
     * Called by every tool when user reaches the result screen.
     *
     * PARAMETERS:
     * ──────────────────────────────────────────────────────
     * toolId  {string}  — The tool's unique ID (kebab-case)
     *                     e.g. 'personality-archetype'
     *
     * data    {object}  — What the tool discovered. Shape:
     * {
     *   // Passport field writes (all optional):
     *   identity : { archetype: 'The Visionary', ... },
     *   hidden   : { geniusType: 'Creative', talents: ['Writing'] },
     *   future   : { futureIdentity: 'Founder', futureScore: 82 },
     *   wealth   : { wealthPotential: 75, moneyStyle: 'Builder' },
     *   love     : { relationshipStyle: 'The Nurturer' },
     *
     *   // Dimension scores this tool measured (all optional):
     *   scores   : { creativity: 80, ambition: 70 },
     *
     *   // Result metadata for the UI:
     *   result   : {
     *     title       : 'The Visionary',
     *     description : 'You see what others miss...',
     *     emoji       : '🔮',
     *     traits      : ['Innovative', 'Big Thinker', 'Restless'],
     *   }
     * }
     *
     * RETURNS:
     * ──────────────────────────────────────────────────────
     * {
     *   profile     : {object}   updated passport
     *   xpAwarded   : {number}   XP given this completion
     *   leveledUp   : {boolean}  whether a level was gained
     *   newLevel    : {object}   new level object if leveled up
     *   newBadges   : {array}    badge IDs newly earned
     *   alreadyDone : {boolean}  true if tool was already completed
     *   realmBonus  : {boolean}  true if realm XP bonus triggered
     * }
     * ══════════════════════════════════════════════════════ */
    completeTool(toolId, data) {
      let profile   = _loadPassport();
      const result  = {
        profile     : null,
        xpAwarded   : 0,
        leveledUp   : false,
        newLevel    : null,
        newBadges   : [],
        alreadyDone : false,
        realmBonus  : false,
      };

      /* ── Duplicate guard ── */
      if (profile.achievements.toolsCompleted.includes(toolId)) {
        result.alreadyDone = true;
        result.profile = profile;
        return result;
      }

      /* ── Write passport fields from data ── */
      const layers = ['identity', 'hidden', 'future', 'wealth', 'love'];
      for (const layer of layers) {
        if (data[layer] && typeof data[layer] === 'object') {
          for (const [key, val] of Object.entries(data[layer])) {
            if (Array.isArray(val)) {
              /* Merge arrays without duplicates */
              const existing = profile[layer][key] || [];
              profile[layer][key] = [...new Set([...existing, ...val])];
            } else if (val !== null && val !== undefined) {
              profile[layer][key] = val;
            }
          }
        }
      }

      /* ── Update dimension scores ── */
      if (data.scores) {
        profile = _updateDimensionScores(profile, data.scores);
      }

      /* ── Mark tool complete ── */
      profile.achievements.toolsCompleted.push(toolId);
      profile.achievements.totalCompleted = profile.achievements.toolsCompleted.length;

      /* ── Update realm progress ── */
      const realmsBefore = {};
      for (const r of Object.keys(MV_CONFIG.REALMS)) {
        realmsBefore[r] = profile.realms[r].progress;
      }
      profile = _updateRealmProgress(profile, toolId);

      /* ── Check for realm completion bonus ── */
      for (const [realmKey, realmConfig] of Object.entries(MV_CONFIG.REALMS)) {
        if (
          profile.realms[realmKey].progress === 100 &&
          realmsBefore[realmKey] < 100
        ) {
          /* Realm just completed — award bonus XP */
          const bonusResult = _addXP(profile, MV_CONFIG.XP_PER_REALM);
          profile          = bonusResult.profile;
          result.xpAwarded += MV_CONFIG.XP_PER_REALM;
          result.realmBonus = true;
          if (bonusResult.leveledUp) {
            result.leveledUp = true;
            result.newLevel  = bonusResult.newLevel;
          }
        }
      }

      /* ── Award standard tool XP ── */
      let xpToAward = MV_CONFIG.XP_PER_TOOL;
      /* Streak bonus */
      if (profile.achievements.streak >= 3) {
        xpToAward += MV_CONFIG.XP_STREAK_BONUS;
      }
      const xpResult   = _addXP(profile, xpToAward);
      profile          = xpResult.profile;
      result.xpAwarded += xpToAward;
      if (xpResult.leveledUp) {
        result.leveledUp = true;
        result.newLevel  = xpResult.newLevel;
      }

      /* ── Check badges ── */
      result.newBadges = _checkAndAwardBadges(profile);

      /* ── Save ── */
      _savePassport(profile);
      result.profile = profile;

      /* ── Fire completion event ── */
      const event = new CustomEvent('mv:toolCompleted', {
        detail: {
          toolId,
          data,
          result,
        }
      });
      document.dispatchEvent(event);

      return result;
    },


    /* ── GET RECOMMENDATIONS ── */
    /**
     * MirrorVerse.getRecommendations(toolId, limit)
     * Returns up to `limit` recommended tool IDs for the given tool.
     * Skips tools the user has already completed.
     */
    getRecommendations(toolId, limit = 3) {
      const profile    = _loadPassport();
      const completed  = profile.achievements.toolsCompleted;
      const recs       = MV_CONFIG.RECOMMENDATIONS[toolId] || [];
      const filtered   = recs.filter(t => !completed.includes(t));
      /* If filtered is too short, pad with any uncompleted tool */
      if (filtered.length < limit) {
        const allTools = Object.keys(MV_CONFIG.TOOL_META);
        for (const t of allTools) {
          if (!completed.includes(t) && !filtered.includes(t) && t !== toolId) {
            filtered.push(t);
            if (filtered.length >= limit) break;
          }
        }
      }
      return filtered.slice(0, limit).map(id => ({
        id,
        ...MV_CONFIG.TOOL_META[id],
        url : `/${id}`,
      }));
    },


    /* ── PASSPORT COMPLETION ── */
    /**
     * MirrorVerse.getPassportCompletionPercent(profile)
     * Pass a profile object or leave empty to auto-load.
     * Returns 0–100 integer.
     */
    getPassportCompletionPercent(profile) {
      const p = profile || _loadPassport();
      return _calcPassportCompletion(p);
    },


    /* ── LEVEL INFO ── */
    /**
     * MirrorVerse.getLevelInfo()
     * Returns current level, XP, progress to next level.
     */
    getLevelInfo() {
      const profile   = _loadPassport();
      const xp        = profile.achievements.xp;
      const levelObj  = _getLevelForXP(xp);
      const nextLevel = _getNextLevel(levelObj.id);
      const xpInLevel = xp - levelObj.xpRequired;
      const xpToNext  = nextLevel ? nextLevel.xpRequired - levelObj.xpRequired : 0;
      const pct       = nextLevel && xpToNext > 0 ? Math.min(100, Math.round((xpInLevel / xpToNext) * 100)) : 100;
      return {
        level        : levelObj.id,
        name         : levelObj.name,
        xp,
        nextLevel,
        xpToNextLevel: nextLevel ? nextLevel.xpRequired - xp : 0,
        progressPct  : pct,
      };
    },


    /* ── REALM SUMMARY ── */
    /**
     * MirrorVerse.getRealmSummary()
     * Returns all realms with their current progress data.
     */
    getRealmSummary() {
      const profile = _loadPassport();
      const summary = {};
      for (const [key, config] of Object.entries(MV_CONFIG.REALMS)) {
        summary[key] = {
          ...config,
          completed : profile.realms[key].completed,
          progress  : profile.realms[key].progress,
          total     : config.tools.length,
        };
      }
      return summary;
    },


    /* ── GET BADGE DETAILS ── */
    /**
     * MirrorVerse.getBadgeDetails(badgeId)
     * Returns the full badge definition for a given ID.
     */
    getBadgeDetails(badgeId) {
      return MV_CONFIG.BADGES.find(b => b.id === badgeId) || null;
    },

    /**
     * MirrorVerse.getEarnedBadges()
     * Returns full badge objects for all earned badges.
     */
    getEarnedBadges() {
      const profile = _loadPassport();
      return profile.achievements.badges.map(id => MirrorVerse.getBadgeDetails(id)).filter(Boolean);
    },


    /* ── TOOL METADATA ── */
    /**
     * MirrorVerse.getToolMeta(toolId)
     * Returns label, realm, emoji for a tool.
     */
    getToolMeta(toolId) {
      return MV_CONFIG.TOOL_META[toolId] || null;
    },


    /* ── RESET PASSPORT (dev/debug only) ── */
    /**
     * MirrorVerse.resetPassport()
     * Wipes the passport and starts fresh.
     * WARNING: irreversible. Only call from a confirmed UI action.
     */
    resetPassport() {
      const fresh = _buildDefaultPassport();
      _savePassport(fresh);
      return fresh;
    },


    /* ── DEBUG HELPER ── */
    /**
     * MirrorVerse.debug()
     * Logs the full current passport to the console.
     */
    debug() {
      const p = _loadPassport();
      console.group('[MirrorVerse] Passport Debug');
      console.log('Full Profile:', p);
      console.log('XP:', p.achievements.xp);
      console.log('Level:', p.achievements.levelName);
      console.log('Tools Completed:', p.achievements.toolsCompleted);
      console.log('Badges:', p.achievements.badges);
      console.log('Streak:', p.achievements.streak, 'days');
      console.log('Passport %:', _calcPassportCompletion(p));
      console.groupEnd();
      return p;
    },

  }; /* end MirrorVerse public API */


  /* ══════════════════════════════════════════════════════════
   *  SECTION 11 — AUTO-INIT
   *  Runs immediately when script loads on any page.
   * ══════════════════════════════════════════════════════════ */

  (function _autoInit() {
    /* Record this visit (updates streak) */
    MirrorVerse.recordVisit();

    /* Expose globally */
    global.MirrorVerse = MirrorVerse;

    /* Signal ready */
    document.dispatchEvent(new CustomEvent('mv:ready', {
      detail: { profile: MirrorVerse.getPassport() }
    }));

    console.log(
      '%c[MirrorVerse] Passport Engine v' + MV_CONFIG.VERSION + ' loaded.',
      'color:#7c3aed;font-weight:bold;'
    );
  })();

})(window);

/* ============================================================
 *  END OF mirrorverse-core.js
 * ============================================================ */
