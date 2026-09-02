import { parseReadingToTokens, generateCanonicalSequence } from "../engine/typingEngine.js";

/**
 * Robust CSV line parser that handles quoted cells, commas inside quotes, and escaped quotes.
 * @param {string} line
 * @returns {Array<string>}
 */
export function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i += 1;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      i += 1;
    } else {
      current += char;
      i += 1;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses raw CSV content string into validated Question model objects.
 * @param {string} csvContent
 * @returns {Array<object>}
 */
export function parseCsvContent(csvContent) {
  if (typeof csvContent !== "string" || csvContent.trim().length === 0) {
    throw new Error("CSV content is empty or invalid string");
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header row and one data row");
  }

  // 1. Header validation
  const headers = parseCsvLine(lines[0]);
  const expectedHeaders = [
    "ID",
    "Difficulty",
    "Category",
    "DisplayText",
    "Reading",
    "RecommendedRomaji",
    "SourceBasis",
    "Note"
  ];

  for (const expected of expectedHeaders) {
    if (!headers.includes(expected)) {
      throw new Error(`CSV Header missing required column: "${expected}". Found: [${headers.join(", ")}]`);
    }
  }

  const headerIndex = {};
  headers.forEach((h, idx) => {
    headerIndex[h] = idx;
  });

  const questions = [];
  const idSet = new Set();
  const validDifficulties = new Set(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

  // 2. Data rows validation and parsing
  for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const columns = parseCsvLine(line);

    if (columns.length < expectedHeaders.length) {
      throw new Error(`Malformed CSV row at line ${lineIdx + 1}: expected at least ${expectedHeaders.length} columns, got ${columns.length}. Line: "${line}"`);
    }

    const id = columns[headerIndex["ID"]];
    const difficulty = columns[headerIndex["Difficulty"]]?.toUpperCase();
    const category = columns[headerIndex["Category"]];
    const displayText = columns[headerIndex["DisplayText"]];
    const reading = columns[headerIndex["Reading"]];
    const recommendedRomaji = columns[headerIndex["RecommendedRomaji"]];
    const sourceBasis = columns[headerIndex["SourceBasis"]] || "";
    const note = columns[headerIndex["Note"]] || "";

    // Required fields check
    if (!id || !difficulty || !category || !displayText || !reading || !recommendedRomaji) {
      throw new Error(`Line ${lineIdx + 1} is missing required fields (ID, Difficulty, Category, DisplayText, Reading, RecommendedRomaji)`);
    }

    // Uniqueness check
    if (idSet.has(id)) {
      throw new Error(`Duplicate Question ID detected: "${id}" at line ${lineIdx + 1}`);
    }
    idSet.add(id);

    // Difficulty check
    if (!validDifficulties.has(difficulty)) {
      throw new Error(`Invalid Difficulty "${difficulty}" at line ${lineIdx + 1} (must be BEGINNER, INTERMEDIATE, or ADVANCED)`);
    }

    // Generate canonical sequence and calculate effective keystrokes
    const tokens = parseReadingToTokens(reading);
    const canonicalTarget = generateCanonicalSequence(tokens);
    const effectiveKeystrokes = canonicalTarget.length;

    questions.push({
      id,
      difficulty,
      category,
      displayText,
      reading,
      recommendedRomaji,
      sourceBasis,
      note,
      canonicalTarget,
      effectiveKeystrokes
    });
  }

  return questions;
}

/**
 * Filters questions by difficulty (case-insensitive).
 * @param {Array<object>} questions
 * @param {string} difficultyKey - "beginner" | "intermediate" | "advanced"
 * @returns {Array<object>}
 */
export function filterQuestionsByDifficulty(questions, difficultyKey) {
  if (!Array.isArray(questions)) return [];
  const target = String(difficultyKey).trim().toUpperCase();
  return questions.filter((q) => q.difficulty === target);
}

/**
 * Validates a dataset of questions and returns summary metrics
 * @param {Array<object>} questions
 * @returns {object} validation summary
 */
export function validateQuestionDataset(questions) {
  if (!Array.isArray(questions)) {
    throw new Error("Expected questions to be an array");
  }

  const counts = {
    total: questions.length,
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0
  };

  const idSet = new Set();

  for (const q of questions) {
    if (!q.id || !q.difficulty || !q.displayText || !q.reading) {
      throw new Error(`Question missing required fields: ${JSON.stringify(q)}`);
    }
    if (idSet.has(q.id)) {
      throw new Error(`Duplicate ID found: ${q.id}`);
    }
    idSet.add(q.id);

    if (counts[q.difficulty] !== undefined) {
      counts[q.difficulty] += 1;
    } else {
      throw new Error(`Unknown difficulty: ${q.difficulty} in question ${q.id}`);
    }

    if (typeof q.effectiveKeystrokes !== "number" || q.effectiveKeystrokes <= 0) {
      throw new Error(`Invalid effectiveKeystrokes for question ${q.id}: ${q.effectiveKeystrokes}`);
    }
  }

  return {
    valid: true,
    counts,
    uniqueIds: idSet.size
  };
}
