#!/usr/bin/env node
/**
 * fit_text.js - Deterministic Text Fitting & Formatting Utility
 *
 * Enforces:
 * 1. Forced casing (UPPERCASE, lowercase, none)
 * 2. Character bounds (with word-boundary truncation or ellipsis)
 * 3. Word count limits
 * 4. Safe whitespace trimming
 *
 * Usage:
 *   node fit_text.js --text "Hello world" --maxChars 45 [--maxWords 8] [--forcedCase UPPERCASE] [--mode ellipsize|truncate|wrap]
 *   node fit_text.js --file input.json [--batch]
 */

const fs = require('fs');

function fitText(options) {
  let {
    text = '',
    maxChars = Infinity,
    maxWords = Infinity,
    forcedCase = 'none',
    mode = 'ellipsize', // ellipsize | truncate | strict
  } = options;

  if (typeof text !== 'string') {
    text = String(text || '');
  }

  const originalText = text.trim();
  let fitted = originalText;

  // 1. Apply Forced Casing
  if (forcedCase === 'UPPERCASE') {
    fitted = fitted.toUpperCase();
  } else if (forcedCase === 'lowercase') {
    fitted = fitted.toLowerCase();
  }

  // 2. Enforce Word Count Limit
  const words = fitted.split(/\s+/).filter(w => w.length > 0);
  let wasTruncated = false;

  if (words.length > maxWords) {
    fitted = words.slice(0, maxWords).join(' ');
    wasTruncated = true;
    if (mode === 'ellipsize') {
      fitted += '...';
    }
  }

  // 3. Enforce Character Boundary
  if (fitted.length > maxChars) {
    wasTruncated = true;
    if (mode === 'truncate') {
      fitted = fitted.substring(0, maxChars).trim();
    } else if (mode === 'ellipsize') {
      const targetLen = Math.max(0, maxChars - 3);
      // Cut at last space before targetLen if possible
      const sub = fitted.substring(0, targetLen);
      const lastSpace = sub.lastIndexOf(' ');
      if (lastSpace > targetLen * 0.6) {
        fitted = sub.substring(0, lastSpace).trim() + '...';
      } else {
        fitted = sub.trim() + '...';
      }
    } else if (mode === 'strict') {
      throw new Error(`Text exceeds maxChars (${fitted.length} > ${maxChars}) in strict mode: "${fitted}"`);
    }
  }

  const finalWords = fitted.split(/\s+/).filter(w => w.length > 0);

  return {
    text: originalText,
    fitted,
    originalLength: originalText.length,
    fittedLength: fitted.length,
    originalWordCount: words.length,
    fittedWordCount: finalWords.length,
    maxChars,
    maxWords,
    forcedCase,
    wasTruncated,
    isValid: fitted.length <= maxChars && finalWords.length <= maxWords,
  };
}

// --- CLI Runner ---
function main() {
  const args = process.argv.slice(2);
  const options = {
    text: '',
    maxChars: Infinity,
    maxWords: Infinity,
    forcedCase: 'none',
    mode: 'ellipsize',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--text' && args[i + 1]) {
      options.text = args[++i];
    } else if (args[i] === '--maxChars' && args[i + 1]) {
      options.maxChars = parseInt(args[++i], 10);
    } else if (args[i] === '--maxWords' && args[i + 1]) {
      options.maxWords = parseInt(args[++i], 10);
    } else if (args[i] === '--forcedCase' && args[i + 1]) {
      options.forcedCase = args[++i];
    } else if (args[i] === '--mode' && args[i + 1]) {
      options.mode = args[++i];
    }
  }

  // Support stdin if no text provided
  if (!options.text && !process.stdin.isTTY) {
    options.text = fs.readFileSync(0, 'utf-8').trim();
  }

  if (!options.text) {
    console.log('Usage: node fit_text.js --text "..." [--maxChars <N>] [--maxWords <N>] [--forcedCase UPPERCASE|lowercase|none] [--mode ellipsize|truncate]');
    process.exit(1);
  }

  const result = fitText(options);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { fitText };
