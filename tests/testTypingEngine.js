import { TypingEngine, katakanaToHiragana, parseReadingToTokens, generateCanonicalSequence } from "../src/engine/typingEngine.js";

export function runTypingEngineTests() {
  console.log("\n=== Testing Typing Engine ===");
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

  // Helper to type full string into engine
  function typeString(engine, str) {
    for (const char of str) {
      engine.inputKey(char);
    }
    return engine.getState();
  }

  // Test 1: katakanaToHiragana
  const hira = katakanaToHiragana("ジャッキベースAI-2S");
  assert(hira === "じゃっきべーすAI-2S", `katakanaToHiragana converts properly: got "${hira}"`);

  // Test 2: Standard kana & multiple romaji variants: し (shi / si)
  {
    const engine1 = new TypingEngine("しちゅう");
    typeString(engine1, "shichuu");
    assert(engine1.getState().isComplete === true, "しちゅう completed via 'shichuu'");

    const engine2 = new TypingEngine("しちゅう");
    typeString(engine2, "sityuu");
    assert(engine2.getState().isComplete === true, "しちゅう completed via 'sityuu'");
  }

  // Test 3: ち (chi / ti) and つ (tsu / tu)
  {
    const engine = new TypingEngine("ちつ");
    typeString(engine, "chitsu");
    assert(engine.getState().isComplete === true, "ちつ completed via 'chitsu'");

    const engine2 = new TypingEngine("ちつ");
    typeString(engine2, "titu");
    assert(engine2.getState().isComplete === true, "ちつ completed via 'titu'");
  }

  // Test 4: ふ (fu / hu)
  {
    const engine1 = new TypingEngine("ふうせん");
    typeString(engine1, "fuusen");
    assert(engine1.getState().isComplete === true, "ふうせん completed via 'fuusen'");

    const engine2 = new TypingEngine("ふうせん");
    typeString(engine2, "huusenn");
    assert(engine2.getState().isComplete === true, "ふうせん completed via 'huusenn'");
  }

  // Test 5: Digraphs: しゃ (sha / sya), ちゃ (cha / tya), じゃ (ja / zya / jya)
  {
    const engine1 = new TypingEngine("しゃちょう");
    typeString(engine1, "shachou");
    assert(engine1.getState().isComplete === true, "しゃちょう completed via 'shachou'");

    const engine2 = new TypingEngine("しゃちょう");
    typeString(engine2, "syatyou");
    assert(engine2.getState().isComplete === true, "しゃちょう completed via 'syatyou'");

    const engine3 = new TypingEngine("じゃっき");
    typeString(engine3, "zyakki");
    assert(engine3.getState().isComplete === true, "じゃっき completed via 'zyakki'");
  }

  // Test 6: Small tsu (促音) double consonant & explicit xtsu
  {
    const engine1 = new TypingEngine("じゃっき");
    typeString(engine1, "jakki");
    assert(engine1.getState().isComplete === true, "じゃっき completed via double consonant 'jakki'");

    const engine2 = new TypingEngine("じゃっき");
    typeString(engine2, "jaxtsukki");
    assert(engine2.getState().isComplete === true, "じゃっき completed via explicit 'jaxtsukki'");
  }

  // Test 7: N handling (ん)
  {
    const engine1 = new TypingEngine("あんぜんたい");
    typeString(engine1, "anzentai");
    assert(engine1.getState().isComplete === true, "あんぜんたい completed via single n 'anzentai'");

    const engine2 = new TypingEngine("あんぜんたい");
    typeString(engine2, "annzenntei"); // mistake at end
    assert(engine2.getState().isComplete === false, "Incorrect last char not completed");

    const engine3 = new TypingEngine("あんぜんたい");
    typeString(engine3, "annzenntai");
    assert(engine3.getState().isComplete === true, "あんぜんたい completed via double nn 'annzenntai'");
  }

  // Test 8: Long vowel mark (ー) mapped to hyphen (-)
  {
    const engine = new TypingEngine("じゃっきべーす");
    typeString(engine, "jakki-be-su");
    assert(engine.getState().isComplete === true, "じゃっきべーす completed via 'jakki-be-su'");
  }

  // Test 9: Mixed ASCII and Japanese terms (case-insensitivity)
  {
    const engine1 = new TypingEngine("AIじどういんずう");
    typeString(engine1, "aijidouinnzuu");
    assert(engine1.getState().isComplete === true, "AIじどういんずう completed with lowercase 'ai...'");

    const engine2 = new TypingEngine("AIじどういんずう");
    typeString(engine2, "AIzidouizu"); // partial / mismatch
    assert(engine2.getState().isComplete === false, "Mismatch detected properly");

    const engine3 = new TypingEngine("2Sかつどう");
    typeString(engine3, "2skatsudou");
    assert(engine3.getState().isComplete === true, "2Sかつどう completed with '2skatsudou'");

    const engine4 = new TypingEngine("OPE-MANE");
    typeString(engine4, "ope-mane");
    assert(engine4.getState().isComplete === true, "OPE-MANE completed with lowercase 'ope-mane'");

    const engine5 = new TypingEngine("T-Earth");
    typeString(engine5, "t-earth");
    assert(engine5.getState().isComplete === true, "T-Earth completed with 't-earth'");
  }

  // Test 10: Wrong key rejection and mistake counting
  {
    const engine = new TypingEngine("してき");
    const res1 = engine.inputKey("x");
    assert(res1.accepted === false, "Wrong key 'x' rejected");
    assert(res1.mistakeCount === 1, "Mistake count incremented to 1");

    const res2 = engine.inputKey("s");
    assert(res2.accepted === true, "Correct key 's' accepted");
    assert(res2.typedSoFar === "S", "typedSoFar is 'S'");

    const res3 = engine.inputKey("z");
    assert(res3.accepted === false, "Wrong key 'z' rejected");
    assert(res3.mistakeCount === 2, "Mistake count incremented to 2");

    const res4 = engine.inputKey("i");
    assert(res4.accepted === true, "Correct key 'i' accepted after mistake");
    assert(res4.typedSoFar === "SI", "typedSoFar updated to 'SI'");
  }

  // Test 11: Incremental progress and remainingTarget
  {
    const engine = new TypingEngine("てすり");
    engine.inputKey("t");
    engine.inputKey("e");
    const state = engine.getState();
    assert(state.typedSoFar === "TE", "typedSoFar is 'TE'");
    assert(state.remainingTarget === "SURI", `remainingTarget is 'SURI' (got '${state.remainingTarget}')`);
    assert(state.isComplete === false, "Not completed yet");

    engine.inputKey("s");
    engine.inputKey("u");
    engine.inputKey("r");
    engine.inputKey("i");
    assert(engine.getState().isComplete === true, "Completed after finishing all keys");
  }

  return { passed, failed };
}
