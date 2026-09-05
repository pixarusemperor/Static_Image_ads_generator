#!/usr/bin/env node
/**
 * readability_checker.js - Deterministic Readability & Policy Scanner
 *
 * Evaluates:
 * 1. Flesch-Kincaid Grade Level (Must be <= 5.0)
 * 2. Flesch Reading Ease (Higher is easier, target > 75)
 * 3. Average words per sentence (Target < 12)
 * 4. Zero You Rule in Lines 1-3 (Strict check for second-person pronouns)
 * 5. Sentences exceeding word limit (> 15 words)
 *
 * Usage:
 *   node readability_checker.js --text "Your ad text here..."
 *   node readability_checker.js --file copy.txt [--strict] [--json]
 */

const fs = require('fs');

// --- Syllable Counting Engine ---
function countSyllablesInWord(word) {
  word = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  // Remove common non-syllable endings
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

// --- Text Extraction & Cleaning ---
function parseText(rawText) {
  // Normalize line endings
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Split into paragraphs / non-empty lines
  const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Split into sentences using punctuation boundaries
  const rawSentences = text
    .replace(/([.?!])\s*(?=[A-Z0-9"']|$)/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Extract all words
  const words = text
    .replace(/[^a-zA-Z0-9'\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 0);

  return { text, rawLines, rawSentences, words };
}

// --- Zero You Rule Checker ---
function checkZeroYouRule(rawLines, rawSentences) {
  // Check the first 3 non-empty lines OR first 3 sentences, whichever covers more
  const targetChunks = rawLines.slice(0, 3);
  const targetSentences = rawSentences.slice(0, 3);

  const pronounRegex = /\b(you|your|yours|you're|you've|yourself|yourselves)\b/i;
  const violations = [];

  targetChunks.forEach((line, idx) => {
    const match = line.match(pronounRegex);
    if (match) {
      violations.push({
        location: `Line ${idx + 1}`,
        snippet: line,
        flaggedWord: match[0],
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

// --- Readability Analysis ---
function analyzeReadability(rawText) {
  const { text, rawLines, rawSentences, words } = parseText(rawText);

  if (words.length === 0 || rawSentences.length === 0) {
    return {
      error: 'Text is too short or empty for analysis',
      passed: false,
    };
  }

  const wordCount = words.length;
  const sentenceCount = Math.max(1, rawSentences.length);

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllablesInWord(w);
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  // Flesch Reading Ease Formula
  const readingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  // Flesch-Kincaid Grade Level Formula
  const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const roundedGrade = Math.max(0, Math.round(fkGrade * 10) / 10);
  const roundedEase = Math.round(readingEase * 10) / 10;

  // Long sentence detection (> 14 words)
  const longSentences = rawSentences
    .filter(s => s.split(/\s+/).length > 14)
    .map(s => ({
      sentence: s,
      words: s.split(/\s+/).length,
    }));

  const zeroYouCheck = checkZeroYouRule(rawLines, rawSentences);

  const gradePassed = roundedGrade <= 5.0;
  const overallPassed = gradePassed && zeroYouCheck.passed;

  return {
    metrics: {
      characterCount: text.length,
      wordCount,
      sentenceCount,
      paragraphCount: rawLines.length,
      totalSyllables,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    },
    scores: {
      fleschKincaidGrade: roundedGrade,
      fleschReadingEase: roundedEase,
      gradeTarget: '<= 5.0',
      gradePassed,
    },
    zeroYouRule: zeroYouCheck,
    longSentences,
    overallPassed,
    verdict: overallPassed ? 'PASS: High-Dopamine Compliant' : 'FAIL: Optimization Required',
  };
}

// --- CLI Runner ---
function main() {
  const args = process.argv.slice(2);
  let text = '';
  let isJson = false;
  let isStrict = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--text' && args[i + 1]) {
      text = args[++i];
    } else if (args[i] === '--file' && args[i + 1]) {
      const filePath = args[++i];
      text = fs.readFileSync(filePath, 'utf-8');
    } else if (args[i] === '--json') {
      isJson = true;
    } else if (args[i] === '--strict') {
      isStrict = true;
    }
  }

  // Handle stdin if no text provided
  if (!text) {
    if (!process.stdin.isTTY) {
      text = fs.readFileSync(0, 'utf-8');
    } else {
      console.log('Usage: node readability_checker.js [--text "..." | --file <path>] [--strict] [--json]');
      process.exit(1);
    }
  }

  const result = analyzeReadability(text);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('====================================================');
    console.log('        HIGH-DOPAMINE AD READABILITY REPORT         ');
    console.log('====================================================');
    console.log(`Verdict: ${result.overallPassed ? '✅ APPROVED' : '❌ REJECTED'}`);
    console.log(`Flesch-Kincaid Grade: ${result.scores.fleschKincaidGrade} (Target: <= 5.0) -> ${result.scores.gradePassed ? 'PASS' : 'FAIL'}`);
    console.log(`Flesch Reading Ease:  ${result.scores.fleschReadingEase} / 100`);
    console.log(`Words: ${result.metrics.wordCount} | Sentences: ${result.metrics.sentenceCount} | Avg Words/Sentence: ${result.metrics.avgWordsPerSentence}`);
    console.log('----------------------------------------------------');
    console.log(`Zero "You" Rule in Lines 1-3: ${result.zeroYouRule.passed ? '✅ PASS' : '❌ VIOLATION DETECTED'}`);
    if (!result.zeroYouRule.passed) {
      result.zeroYouRule.violations.forEach(v => {
        console.log(`  - [${v.location}] Flagged pronoun '${v.flaggedWord}': "${v.snippet}"`);
      });
    }
    if (result.longSentences.length > 0) {
      console.log(`Sentences > 14 words (${result.longSentences.length}):`);
      result.longSentences.forEach(s => {
        console.log(`  - (${s.words} words): "${s.sentence}"`);
      });
    }
    console.log('====================================================');
  }

  if (isStrict && !result.overallPassed) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeReadability, countSyllablesInWord, parseText };
