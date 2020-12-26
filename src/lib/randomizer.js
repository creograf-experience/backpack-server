const generateRandomNum = (a, b = 0) => Math.floor(Math.random() * a) + b;
const getCharFromRange = (a, b) => String.fromCharCode(generateRandomNum(a, b));

const getRandomLower = () => getCharFromRange(26, 97);
const getRandomUpper = () => getCharFromRange(26, 65);
const getRandomNumber = () => getCharFromRange(10, 48);
const getRandomSymbol = () => {
  const symbols = '!@#$%^&*(){}[]=<>/_'
  return symbols[generateRandomNum(symbols.length)];
}


const randomCharsFactory = {
  lower: { getRandom: getRandomLower },
  number: { getRandom: getRandomNumber },
  symbol: { getRandom: getRandomSymbol },
  upper: { getRandom: getRandomUpper }
};

const getRandomString = ({
  symbols = ['lower', 'number', 'upper'],
  length = 10
} = {}) => {
  let generateString = '';

  for (let i = 0; i < length; i++) {
    const char = symbols[generateRandomNum(symbols.length)];
    generateString += randomCharsFactory[char].getRandom();
  }

  return generateString;
}

module.exports = {
  generateRandomNum,
  getCharFromRange,
  getRandomLower,
  getRandomUpper,
  getRandomNumber,
  getRandomSymbol,
  getRandomString
};
