/**
 * Typing Engine & Dynamic Multi-Pattern Roman Matcher
 * Parses Japanese reading and mixed ASCII phrases into valid typing paths.
 * Supports flexible Romanized Japanese variations, small tsu (促音), n (撥音), long vowels (ー), and ASCII case-insensitivity.
 */

// Kana to Romaji definitions (sorted longest mora first, primary/canonical variant first)
const MULTI_KANA_MAP = {
  // Digraphs (3-letter or 2-letter combos)
  "きゃ": ["kya"],
  "きゅ": ["kyu"],
  "きょ": ["kyo"],
  "しゃ": ["sha", "sya"],
  "しゅ": ["shu", "syu"],
  "しょ": ["sho", "syo"],
  "しぇ": ["she", "sye"],
  "ちゃ": ["cha", "tya", "cya"],
  "ちゅ": ["chu", "tyu", "cyu"],
  "ちょ": ["cho", "tyo", "cyo"],
  "ちぇ": ["che", "tye"],
  "にゃ": ["nya"],
  "にゅ": ["nyu"],
  "にょ": ["nyo"],
  "ひゃ": ["hya"],
  "ひゅ": ["hyu"],
  "ひょ": ["hyo"],
  "みゃ": ["mya"],
  "みゅ": ["myu"],
  "みょ": ["myo"],
  "りゃ": ["rya"],
  "りゅ": ["ryu"],
  "りょ": ["ryo"],
  "ぎゃ": ["gya"],
  "ぎゅ": ["gyu"],
  "ぎょ": ["gyo"],
  "じゃ": ["ja", "zya", "jya"],
  "じゅ": ["ju", "zyu", "jyu"],
  "じょ": ["jo", "zyo", "jyo"],
  "じぇ": ["je", "zye", "jye"],
  "ぢゃ": ["dya", "dja"],
  "ぢゅ": ["dyu", "dju"],
  "ぢょ": ["dyo", "djo"],
  "びゃ": ["bya"],
  "びゅ": ["byu"],
  "びょ": ["byo"],
  "ぴゃ": ["pya"],
  "ぴゅ": ["pyu"],
  "ぴょ": ["pyo"],
  "ふぁ": ["fa", "fwa", "huxa"],
  "ふぃ": ["fi", "fwi", "huxi"],
  "ふぇ": ["fe", "fwe", "huxe"],
  "ふぉ": ["fo", "fwo", "huxo"],
  "うぃ": ["wi", "uxi", "lxi", "ui"],
  "うぇ": ["we", "uxe", "lxe", "ue"],
  "うぉ": ["wo", "uxo", "lxo"],
  "てぃ": ["thi", "ti", "texi", "teli"],
  "でぃ": ["dhi", "di", "dexi", "deli"],
  "とぅ": ["twu", "toxi", "toli", "tu"],
  "どぅ": ["dwu", "doxi", "doli", "du"],
  "ゔぁ": ["va"],
  "ゔぃ": ["vi"],
  "ゔ": ["vu"],
  "ゔぇ": ["ve"],
  "ゔぉ": ["vo"]
};

const SINGLE_KANA_MAP = {
  "あ": ["a"],
  "い": ["i", "yi"],
  "う": ["u", "wu", "whu"],
  "え": ["e"],
  "お": ["o"],
  "か": ["ka", "ca"],
  "き": ["ki"],
  "く": ["ku", "cu", "qu"],
  "け": ["ke"],
  "こ": ["ko", "co"],
  "さ": ["sa"],
  "し": ["shi", "si", "ci"],
  "す": ["su"],
  "せ": ["se", "ce"],
  "そ": ["so"],
  "た": ["ta"],
  "ち": ["chi", "ti"],
  "つ": ["tsu", "tu"],
  "て": ["te"],
  "と": ["to"],
  "な": ["na"],
  "に": ["ni"],
  "ぬ": ["nu"],
  "ね": ["ne"],
  "の": ["no"],
  "は": ["ha"],
  "ひ": ["hi"],
  "ふ": ["fu", "hu"],
  "へ": ["he"],
  "ほ": ["ho"],
  "ま": ["ma"],
  "み": ["mi"],
  "む": ["mu"],
  "め": ["me"],
  "も": ["mo"],
  "や": ["ya"],
  "ゆ": ["yu"],
  "よ": ["yo"],
  "ら": ["ra"],
  "り": ["ri"],
  "る": ["ru"],
  "れ": ["re"],
  "ろ": ["ro"],
  "わ": ["wa"],
  "を": ["wo", "o"],
  "ん": ["n", "nn", "xn"],
  "が": ["ga"],
  "ぎ": ["gi"],
  "ぐ": ["gu"],
  "げ": ["ge"],
  "ご": ["go"],
  "ざ": ["za"],
  "じ": ["ji", "zi"],
  "ず": ["zu"],
  "ぜ": ["ze"],
  "ぞ": ["zo"],
  "だ": ["da"],
  "ぢ": ["di", "dji"],
  "づ": ["du", "dzu"],
  "で": ["de"],
  "ど": ["do"],
  "ば": ["ba"],
  "び": ["bi"],
  "ぶ": ["bu"],
  "べ": ["be"],
  "ぼ": ["bo"],
  "ぱ": ["pa"],
  "ぴ": ["pi"],
  "ぷ": ["pu"],
  "ぺ": ["pe"],
  "ぽ": ["po"],
  "ぁ": ["xa", "la"],
  "ぃ": ["xi", "li"],
  "ぅ": ["xu", "lu"],
  "ぇ": ["xe", "le"],
  "ぉ": ["xo", "lo"],
  "ゃ": ["xya", "lya"],
  "ゅ": ["xyu", "lyu"],
  "ょ": ["xyo", "lyo"],
  "ゎ": ["xwa", "lwa"],
  "っ": ["xtsu", "ltu", "xtu"],
  "ー": ["-"],
  "-": ["-"],
  "、": [","],
  "。": ["."],
  "・": ["/"],
  " ": [" "]
};

/**
 * Converts Katakana characters in a string to Hiragana, keeping ASCII and special symbols.
 * @param {string} str
 * @returns {string}
 */
export function katakanaToHiragana(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const code = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(code);
  });
}

/**
 * Tokenizes a reading string into structured typing tokens.
 * Handles Hiragana moras, small tsu, n, and mixed ASCII characters.
 * @param {string} rawReading
 * @returns {Array<object>}
 */
export function parseReadingToTokens(rawReading) {
  if (typeof rawReading !== "string" || rawReading.length === 0) {
    return [];
  }

  const normalized = katakanaToHiragana(rawReading);
  const tokens = [];
  let i = 0;

  while (i < normalized.length) {
    const char = normalized[i];
    const nextChar = i + 1 < normalized.length ? normalized[i + 1] : "";
    const twoChars = char + nextChar;

    // 1. Check digraphs (2 kana characters e.g. しゃ, きゅ)
    if (nextChar && MULTI_KANA_MAP[twoChars]) {
      tokens.push({
        type: "kana",
        raw: twoChars,
        options: [...MULTI_KANA_MAP[twoChars]]
      });
      i += 2;
      continue;
    }

    // 2. Check small tsu (っ)
    if (char === "っ") {
      tokens.push({
        type: "small_tsu",
        raw: char,
        options: ["xtsu", "ltu", "xtu"]
      });
      i += 1;
      continue;
    }

    // 3. Check n (ん)
    if (char === "ん") {
      tokens.push({
        type: "n",
        raw: char,
        options: ["n", "nn", "xn"]
      });
      i += 1;
      continue;
    }

    // 4. Check single kana / symbol
    if (SINGLE_KANA_MAP[char]) {
      tokens.push({
        type: "kana",
        raw: char,
        options: [...SINGLE_KANA_MAP[char]]
      });
      i += 1;
      continue;
    }

    // 5. ASCII or other character (direct match)
    tokens.push({
      type: "ascii",
      raw: char,
      options: [char]
    });
    i += 1;
  }

  return tokens;
}

/**
 * Builds a deterministic canonical typing sequence from parsed tokens.
 * @param {Array<object>} tokens
 * @returns {string}
 */
export function generateCanonicalSequence(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return "";
  }

  let result = "";
  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];
    if (token.type === "small_tsu") {
      const nextToken = tokens[idx + 1];
      if (nextToken) {
        const nextFirst = nextToken.options[0][0].toLowerCase();
        if (nextFirst >= "a" && nextFirst <= "z" && !["a", "i", "u", "e", "o"].includes(nextFirst)) {
          result += nextFirst;
          continue;
        }
      }
      result += "xtsu";
    } else if (token.type === "n") {
      const nextToken = tokens[idx + 1];
      if (nextToken) {
        const nextFirst = nextToken.options[0][0].toLowerCase();
        if (["a", "i", "u", "e", "o", "y", "n"].includes(nextFirst)) {
          result += "nn";
          continue;
        }
      }
      result += "n";
    } else {
      result += token.options[0];
    }
  }
  return result.toUpperCase();
}

/**
 * Typing Engine Class
 * Manages incremental keystroke processing, active path matching, and progress tracking.
 */
export class TypingEngine {
  /**
   * @param {string|object} questionOrReading - Question object or reading string
   */
  constructor(questionOrReading = "") {
    this.reset();
    if (questionOrReading) {
      this.setQuestion(questionOrReading);
    }
  }

  /**
   * Resets engine state
   */
  reset() {
    this.question = null;
    this.reading = "";
    this.tokens = [];
    this.canonicalTarget = "";
    this.effectiveKeystrokes = 0;
    this.typedSoFar = "";
    this.mistakeCount = 0;
    this.isComplete = false;
    this.activePaths = [];
  }

  /**
   * Sets question or reading and initializes active paths
   * @param {string|object} questionOrReading
   */
  setQuestion(questionOrReading) {
    this.reset();
    if (typeof questionOrReading === "object" && questionOrReading !== null) {
      this.question = questionOrReading;
      this.reading = questionOrReading.reading || questionOrReading.displayText || "";
    } else {
      this.reading = String(questionOrReading);
    }

    this.tokens = parseReadingToTokens(this.reading);
    this.canonicalTarget = generateCanonicalSequence(this.tokens);
    this.effectiveKeystrokes = this.canonicalTarget.length;
    this.activePaths = this._generateAllPaths(this.tokens);
  }

  /**
   * Generates all valid typing paths for given tokens (including double consonants, alternate romanizations)
   * @param {Array<object>} tokens
   * @returns {Array<string>}
   */
  _generateAllPaths(tokens) {
    if (tokens.length === 0) return [""];

    let paths = [""];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      let options = [];

      if (token.type === "small_tsu") {
        if (nextToken) {
          const nextFirstChars = new Set(
            nextToken.options.map((o) => o[0].toLowerCase()).filter((c) => c >= "a" && c <= "z" && !["a", "i", "u", "e", "o"].includes(c))
          );
          for (const c of nextFirstChars) {
            options.push(c);
          }
        }
        options.push("xtsu", "ltu", "xtu");
      } else if (token.type === "n") {
        if (!nextToken) {
          options = ["n", "nn", "xn"];
        } else {
          const nextFirstChars = nextToken.options.map((o) => o[0].toLowerCase());
          const hasConsonantPrefix = nextFirstChars.some((c) => !["a", "i", "u", "e", "o", "y", "n"].includes(c));
          if (hasConsonantPrefix) {
            options = ["n", "nn", "xn"];
          } else {
            options = ["nn", "xn"];
          }
        }
      } else if (token.type === "ascii") {
        options = [token.raw.toLowerCase()];
      } else {
        options = token.options.map((o) => o.toLowerCase());
      }

      // Combine paths
      const newPaths = [];
      for (const prefix of paths) {
        for (const opt of options) {
          newPaths.push(prefix + opt);
        }
      }
      paths = newPaths.length > 2500 ? newPaths.slice(0, 2500) : newPaths;
    }

    return paths;
  }

  /**
   * Processes a single key input
   * @param {string} rawKey - The key typed by user (e.g. 'a', 'S', '1', '-')
   * @returns {object} status: { accepted, isComplete, typedSoFar, currentTarget, remainingTarget, mistakeCount }
   */
  inputKey(rawKey) {
    if (this.isComplete) {
      return { accepted: true, ...this.getState() };
    }
    if (typeof rawKey !== "string" || rawKey.length === 0) {
      return { accepted: false, ...this.getState() };
    }

    const key = rawKey.toLowerCase();
    const candidateTyped = this.typedSoFar + key;

    // Check if candidateTyped is a prefix of any active valid path
    const matchingPaths = this.activePaths.filter((path) => path.startsWith(candidateTyped));

    if (matchingPaths.length > 0) {
      // Key accepted!
      this.typedSoFar = candidateTyped;
      this.activePaths = matchingPaths;

      // Check if exact match reached on any complete path
      if (matchingPaths.some((p) => p === candidateTyped)) {
        this.isComplete = true;
      }

      return {
        accepted: true,
        isComplete: this.isComplete,
        ...this.getState()
      };
    } else {
      // Key rejected!
      this.mistakeCount += 1;
      return {
        accepted: false,
        isComplete: false,
        ...this.getState()
      };
    }
  }

  /**
   * Returns current snapshot of typing state
   * @returns {object}
   */
  getState() {
    const currentBestPath = this.activePaths[0] || this.canonicalTarget.toLowerCase();
    const currentTarget = currentBestPath.toUpperCase();
    const typedUpper = this.typedSoFar.toUpperCase();
    const remainingUpper = currentTarget.slice(typedUpper.length);

    return {
      isComplete: this.isComplete,
      typedSoFar: typedUpper,
      currentTarget,
      remainingTarget: remainingUpper,
      typedLength: typedUpper.length,
      targetLength: currentTarget.length,
      mistakeCount: this.mistakeCount,
      effectiveKeystrokes: this.effectiveKeystrokes
    };
  }
}
