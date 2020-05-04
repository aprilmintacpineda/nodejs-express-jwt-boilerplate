/** @format */

const htmlEntityChars = [
  {
    regex: /&NewLine;/g,
    char: String.fromCharCode(10)
  },
  {
    regex: /&nbsp;/g,
    char: String.fromCharCode(32)
  },
  {
    regex: /&quot;/g,
    char: String.fromCharCode(34)
  },
  {
    regex: /&amp;/g,
    char: String.fromCharCode(38)
  },
  {
    regex: /&apos;/g,
    char: String.fromCharCode(39)
  },
  {
    regex: /&lt;/g,
    char: String.fromCharCode(60)
  },
  {
    regex: /&gt;/g,
    char: String.fromCharCode(62)
  },
  {
    regex: /&cent;/g,
    char: String.fromCharCode(162)
  },
  {
    regex: /&pound;/g,
    char: String.fromCharCode(163)
  },
  {
    regex: /&yen;/g,
    char: String.fromCharCode(165)
  },
  {
    regex: /&copy;/g,
    char: String.fromCharCode(169)
  },
  {
    regex: /&reg;/g,
    char: String.fromCharCode(174)
  },
  {
    regex: /&euro;/g,
    char: String.fromCharCode(8364)
  }
];

function decodeHTMLEntities (str) {
  let decodedStr = str;

  htmlEntityChars.forEach(htmlEntityChar => {
    decodedStr = decodedStr.replace(htmlEntityChar.regex, htmlEntityChar.char);
  });

  return decodedStr;
}

const htmlEntities = {
  10: '&NewLine;',
  32: '&nbsp;',
  34: '&quot;',
  38: '&amp;',
  39: '&apos;',
  60: '&lt;',
  62: '&gt;',
  162: '&cent;',
  163: '&pound;',
  165: '&yen;',
  169: '&copy;',
  174: '&reg;',
  8364: '&euro;'
};

function encodeHTMLEntities (str) {
  let encodedStr = '';

  for (let a = 0, maxA = str.length; a < maxA; a++) {
    const htmlEntity = htmlEntities[str.charCodeAt(a)];
    if (htmlEntity) encodedStr += htmlEntity;
    else encodedStr += str[a];
  }

  return encodedStr;
}

module.exports.encodeHTMLEntities = encodeHTMLEntities;
module.exports.decodeHTMLEntities = decodeHTMLEntities;
