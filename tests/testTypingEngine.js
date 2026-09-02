import {
  TypingEngine,
  parseReadingToTokens,
  generateCanonicalSequence,
  katakanaToHiragana
} from "../src/engine/typingEngine.js";
import { loadQuestionsFromFile } from "../src/data/nodeQuestionLoader.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../data/questions/takamiya-typing-game-master-v3.csv");

export function runTypingEngineTests() {
  console.log("\n=== Testing Typing Engine & Comprehensive Variant Coverage ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  function simulateTyping(engine, inputStr) {
    for (const char of inputStr) {
      const res = engine.inputKey(char);
      if (!res.accepted) return false;
    }
    return engine.isComplete;
  }

  // --- 1. Basic Conversion & Parsing ---
  const kata = katakanaToHiragana("ジャッキベースAI-2S");
  assert(kata === "じゃっきべーすAI-2S", `katakanaToHiragana converts properly: got "${kata}"`);

  // --- 2. Basic Kana Single Variants ---
  // し: shi, si, ci
  assert(simulateTyping(new TypingEngine("し"), "shi"), "し completed via 'shi'");
  assert(simulateTyping(new TypingEngine("し"), "si"), "し completed via 'si'");
  assert(simulateTyping(new TypingEngine("し"), "ci"), "し completed via 'ci'");

  // じ: ji, zi
  assert(simulateTyping(new TypingEngine("じ"), "ji"), "じ completed via 'ji'");
  assert(simulateTyping(new TypingEngine("じ"), "zi"), "じ completed via 'zi'");

  // ち: chi, ti
  assert(simulateTyping(new TypingEngine("ち"), "chi"), "ち completed via 'chi'");
  assert(simulateTyping(new TypingEngine("ち"), "ti"), "ち completed via 'ti'");

  // つ: tsu, tu
  assert(simulateTyping(new TypingEngine("つ"), "tsu"), "つ completed via 'tsu'");
  assert(simulateTyping(new TypingEngine("つ"), "tu"), "つ completed via 'tu'");

  // ふ: fu, hu
  assert(simulateTyping(new TypingEngine("ふ"), "fu"), "ふ completed via 'fu'");
  assert(simulateTyping(new TypingEngine("ふ"), "hu"), "ふ completed via 'hu'");

  // ぢ: di (and distinct from ji/zi)
  assert(simulateTyping(new TypingEngine("ぢ"), "di"), "ぢ completed via 'di'");
  const engDi = new TypingEngine("ぢ");
  assert(engDi.inputKey("j").accepted === false, "ぢ rejects 'j'");

  // づ: du (and distinct from zu)
  assert(simulateTyping(new TypingEngine("づ"), "du"), "づ completed via 'du'");
  const engDu = new TypingEngine("づ");
  assert(engDu.inputKey("z").accepted === false, "づ rejects 'z'");

  // --- 3. 拗音 (Digraphs) Variants ---
  // しゃ/しゅ/しょ
  assert(simulateTyping(new TypingEngine("しゃ"), "sha"), "しゃ completed via 'sha'");
  assert(simulateTyping(new TypingEngine("しゃ"), "sya"), "しゃ completed via 'sya'");
  assert(simulateTyping(new TypingEngine("しゅ"), "shu"), "しゅ completed via 'shu'");
  assert(simulateTyping(new TypingEngine("しゅ"), "syu"), "しゅ completed via 'syu'");
  assert(simulateTyping(new TypingEngine("しょ"), "sho"), "しょ completed via 'sho'");
  assert(simulateTyping(new TypingEngine("しょ"), "syo"), "しょ completed via 'syo'");

  // じゃ/じゅ/じょ
  assert(simulateTyping(new TypingEngine("じゃ"), "ja"), "じゃ completed via 'ja'");
  assert(simulateTyping(new TypingEngine("じゃ"), "zya"), "じゃ completed via 'zya'");
  assert(simulateTyping(new TypingEngine("じゃ"), "jya"), "じゃ completed via 'jya'");
  assert(simulateTyping(new TypingEngine("じゅ"), "ju"), "じゅ completed via 'ju'");
  assert(simulateTyping(new TypingEngine("じゅ"), "zyu"), "じゅ completed via 'zyu'");
  assert(simulateTyping(new TypingEngine("じゅ"), "jyu"), "じゅ completed via 'jyu'");
  assert(simulateTyping(new TypingEngine("じょ"), "jo"), "じょ completed via 'jo'");
  assert(simulateTyping(new TypingEngine("じょ"), "zyo"), "じょ completed via 'zyo'");
  assert(simulateTyping(new TypingEngine("じょ"), "jyo"), "じょ completed via 'jyo'");

  // ちゃ/ちゅ/ちょ
  assert(simulateTyping(new TypingEngine("ちゃ"), "cha"), "ちゃ completed via 'cha'");
  assert(simulateTyping(new TypingEngine("ちゃ"), "tya"), "ちゃ completed via 'tya'");
  assert(simulateTyping(new TypingEngine("ちゃ"), "cya"), "ちゃ completed via 'cya'");
  assert(simulateTyping(new TypingEngine("ちゅ"), "chu"), "ちゅ completed via 'chu'");
  assert(simulateTyping(new TypingEngine("ちゅ"), "tyu"), "ちゅ completed via 'tyu'");
  assert(simulateTyping(new TypingEngine("ちゅ"), "cyu"), "ちゅ completed via 'cyu'");
  assert(simulateTyping(new TypingEngine("ちょ"), "cho"), "ちょ completed via 'cho'");
  assert(simulateTyping(new TypingEngine("ちょ"), "tyo"), "ちょ completed via 'tyo'");
  assert(simulateTyping(new TypingEngine("ちょ"), "cyo"), "ちょ completed via 'cyo'");

  // きゃ/きゅ/きょ, ぎゃ/ぎゅ/ぎょ, にゃ/にゅ/にょ, etc.
  assert(simulateTyping(new TypingEngine("きゃ"), "kya"), "きゃ completed via 'kya'");
  assert(simulateTyping(new TypingEngine("きゅ"), "kyu"), "きゅ completed via 'kyu'");
  assert(simulateTyping(new TypingEngine("きょ"), "kyo"), "きょ completed via 'kyo'");
  assert(simulateTyping(new TypingEngine("ぎゃ"), "gya"), "ぎゃ completed via 'gya'");
  assert(simulateTyping(new TypingEngine("ぎゅ"), "gyu"), "ぎゅ completed via 'gyu'");
  assert(simulateTyping(new TypingEngine("ぎょ"), "gyo"), "ぎょ completed via 'gyo'");
  assert(simulateTyping(new TypingEngine("にゃ"), "nya"), "にゃ completed via 'nya'");
  assert(simulateTyping(new TypingEngine("にゅ"), "nyu"), "にゅ completed via 'nyu'");
  assert(simulateTyping(new TypingEngine("にょ"), "nyo"), "にょ completed via 'nyo'");
  assert(simulateTyping(new TypingEngine("ひゃ"), "hya"), "ひゃ completed via 'hya'");
  assert(simulateTyping(new TypingEngine("ひゅ"), "hyu"), "ひゅ completed via 'hyu'");
  assert(simulateTyping(new TypingEngine("ひょ"), "hyo"), "ひょ completed via 'hyo'");
  assert(simulateTyping(new TypingEngine("びゃ"), "bya"), "びゃ completed via 'bya'");
  assert(simulateTyping(new TypingEngine("びゅ"), "byu"), "びゅ completed via 'byu'");
  assert(simulateTyping(new TypingEngine("びょ"), "byo"), "びょ completed via 'byo'");
  assert(simulateTyping(new TypingEngine("ぴゃ"), "pya"), "ぴゃ completed via 'pya'");
  assert(simulateTyping(new TypingEngine("ぴゅ"), "pyu"), "ぴゅ completed via 'pyu'");
  assert(simulateTyping(new TypingEngine("ぴょ"), "pyo"), "ぴょ completed via 'pyo'");
  assert(simulateTyping(new TypingEngine("みゃ"), "mya"), "みゃ completed via 'mya'");
  assert(simulateTyping(new TypingEngine("みゅ"), "myu"), "みゅ completed via 'myu'");
  assert(simulateTyping(new TypingEngine("みょ"), "myo"), "みょ completed via 'myo'");
  assert(simulateTyping(new TypingEngine("りゃ"), "rya"), "りゃ completed via 'rya'");
  assert(simulateTyping(new TypingEngine("りゅ"), "ryu"), "りゅ completed via 'ryu'");
  assert(simulateTyping(new TypingEngine("りょ"), "ryo"), "りょ completed via 'ryo'");

  // --- 4. Small Tsu & N & Long Vowels & Mixed ASCII ---
  assert(simulateTyping(new TypingEngine("じゃっき"), "jakki"), "じゃっき completed via 'jakki'");
  assert(simulateTyping(new TypingEngine("じゃっき"), "zyakki"), "じゃっき completed via 'zyakki'");
  assert(simulateTyping(new TypingEngine("じゃっき"), "jyakki"), "じゃっき completed via 'jyakki'");
  assert(simulateTyping(new TypingEngine("じゃっき"), "jaxtsuki"), "じゃっき completed via 'jaxtsuki'");
  assert(simulateTyping(new TypingEngine("あんぜんたい"), "anzentai"), "あんぜんたい completed via 'anzentai'");
  assert(simulateTyping(new TypingEngine("あんぜんたい"), "annzenntai"), "あんぜんたい completed via 'annzenntai'");
  assert(simulateTyping(new TypingEngine("AIじどういんずう"), "aijidouinzuu"), "AIじどういんずう completed via 'aijidouinzuu'");
  assert(simulateTyping(new TypingEngine("AIじどういんずう"), "aizidouinzuu"), "AIじどういんずう completed via 'aizidouinzuu' (zi variant)");
  assert(simulateTyping(new TypingEngine("2Sかつどう"), "2skatsudou"), "2Sかつどう completed with '2skatsudou'");
  assert(simulateTyping(new TypingEngine("2Sかつどう"), "2skatudou"), "2Sかつどう completed with '2skatudou' (tu variant)");
  assert(simulateTyping(new TypingEngine("OPE-MANE"), "ope-mane"), "OPE-MANE completed with 'ope-mane'");
  assert(simulateTyping(new TypingEngine("T-Earth"), "t-earth"), "T-Earth completed with 't-earth'");

  // --- 5. Real Question Master Questions Alternate Path Tests ---
  const questions = loadQuestionsFromFile(CSV_PATH);

  // B001: 足場 (あしば) -> asiba (si variant)
  const qB001 = questions.find((q) => q.id === "B001");
  assert(simulateTyping(new TypingEngine(qB001), "asiba"), "B001 (足場: あしば) completed via 'asiba' (si variant)");

  // B002: 支柱 (しちゅう) -> sityuu, sicyuu, shityuu, shichuu
  const qB002 = questions.find((q) => q.id === "B002");
  assert(simulateTyping(new TypingEngine(qB002), "shichuu"), "B002 (支柱: しちゅう) completed via 'shichuu'");
  assert(simulateTyping(new TypingEngine(qB002), "sityuu"), "B002 (支柱: しちゅう) completed via 'sityuu' (si+tyu variants)");
  assert(simulateTyping(new TypingEngine(qB002), "sicyuu"), "B002 (支柱: しちゅう) completed via 'sicyuu' (si+cyu variants)");

  // B003: 出荷 (しゅっか) -> syukka (syu variant)
  const qB003 = questions.find((q) => q.id === "B003");
  assert(simulateTyping(new TypingEngine(qB003), "syukka"), "B003 (出荷: しゅっか) completed via 'syukka' (syu variant)");

  // B013: 工場 (こうじょう) -> kouzyou (zyo variant), koujyou (jyo variant)
  const qB013 = questions.find((q) => q.id === "B013");
  assert(simulateTyping(new TypingEngine(qB013), "kouzyou"), "B013 (工場: こうじょう) completed via 'kouzyou' (zyo variant)");
  assert(simulateTyping(new TypingEngine(qB013), "koujyou"), "B013 (工場: こうじょう) completed via 'koujyou' (jyo variant)");

  // I001: Iqシステム (Iqしすてむ) -> iqsisutemu
  const qI001 = questions.find((q) => q.id === "I001");
  assert(simulateTyping(new TypingEngine(qI001), "iqsisutemu"), "I001 (Iqシステム) completed via 'iqsisutemu' (si variant)");

  // I002: 自考自走 (じこうじそう) -> zikouzisou (zi variants)
  const qI002 = questions.find((q) => q.id === "I002");
  assert(simulateTyping(new TypingEngine(qI002), "zikouzisou"), "I002 (自考自走: じこうじそう) completed via 'zikouzisou' (zi variants)");

  // I008: ジャッキベース (じゃっきべーす) -> zyakkibe-su, jyakkibe-su
  const qI008 = questions.find((q) => q.id === "I008");
  assert(simulateTyping(new TypingEngine(qI008), "zyakkibe-su"), "I008 (ジャッキベース) completed via 'zyakkibe-su' (zya variant)");
  assert(simulateTyping(new TypingEngine(qI008), "jyakkibe-su"), "I008 (ジャッキベース) completed via 'jyakkibe-su' (jya variant)");

  // A001: 一歩・一秒・一円活動に取り組む (いっぽいちびょういちえんかつどうにとりくむ) -> ti, tu variants
  const qA001 = questions.find((q) => q.id === "A001");
  assert(
    simulateTyping(new TypingEngine(qA001), "ippoitibyouitienkatudounitorikumu"),
    "A001 completed via combined alternate variants (ti, tu)"
  );

  // --- 6. Dynamic Target Switching & Mistake Semantics ---
  const engSwitch = new TypingEngine("じどうしゃ"); // Canonical: JIDOUSHA
  assert(engSwitch.getState().currentTarget === "JIDOUSHA", "Initial canonical target is JIDOUSHA");

  // User types 'Z' instead of 'J'
  const resZ = engSwitch.inputKey("z");
  assert(resZ.accepted === true, "Typing 'z' for 'じ' is accepted without error");
  assert(resZ.mistakeCount === 0, "Mistake count remains 0 after valid variant input");
  assert(engSwitch.getState().typedSoFar === "Z", "typedSoFar updated to 'Z'");
  assert(engSwitch.getState().currentTarget === "ZIDOUSHA", "currentTarget dynamically switched to 'ZIDOUSHA'");
  assert(engSwitch.getState().remainingTarget === "IDOUSHA", "remainingTarget updated to 'IDOUSHA'");

  // Finish typing the rest: "idousha"
  simulateTyping(engSwitch, "idousha");
  assert(engSwitch.isComplete === true, "Word fully completed with 'zidousha'");
  assert(engSwitch.getState().mistakeCount === 0, "Mistake count is 0 at finish");

  // --- 7. Mistake Handling ---
  const engMistake = new TypingEngine("てすり");
  const resWrong = engMistake.inputKey("x");
  assert(resWrong.accepted === false, "Wrong key 'x' rejected");
  assert(resWrong.mistakeCount === 1, "Mistake count incremented to 1");

  return { passed, failed };
}
