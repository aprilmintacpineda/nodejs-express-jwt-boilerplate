/**
 * Removes all black listed charCodes from the beginning and ending of the string
 *
 * @format
 * @param {String} str               The string to trim
 * @param {Array} charCodeBlackList  The list of black listed charCodes
 * @return {String}                   Resulting string
 */

function trim (str, charCodeBlackList) {
  let result = str;
  let charCode = result.charCodeAt(0);

  // trim beginning
  while (charCodeBlackList.includes(charCode)) {
    result = result.substring(1);
    charCode = result.charCodeAt(0);
  }

  let lastIndex = result.length - 1;
  charCode = result.charCodeAt(lastIndex);

  // trim ending
  while (charCodeBlackList.includes(charCode)) {
    result = result.substring(0, lastIndex);
    lastIndex = result.length - 1;
    charCode = result.charCodeAt(lastIndex);
  }

  return result;
}

function trimSlashes (str) {
  if (!str) return str;
  return trim(str, [47, 92]);
}

function fixSpacing (str) {
  if (!str) return str;
  let result = '';
  let lastCharCode = null;
  let lastCharCodeOccurenceCount = 0;

  for (let a = 0, maxA = str.length; a < maxA; a++) {
    const charCode = str.charCodeAt(a);

    switch (charCode) {
      case 32:
        if (lastCharCode !== charCode) result += str[a];
        break;
      case 10:
        if (lastCharCode !== charCode) {
          result += str[a];
          lastCharCodeOccurenceCount = 1;
        } else if (lastCharCode === charCode && lastCharCodeOccurenceCount !== 2) {
          result += str[a];
          lastCharCodeOccurenceCount++;
        }
        break;
      default:
        result += str[a];
    }

    lastCharCode = charCode;
  }

  return result.trim();
}

module.exports.trimSlashes = trimSlashes;
module.exports.fixSpacing = fixSpacing;
