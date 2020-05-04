/** @format */

function random (desiredLen) {
  let gen = '';
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz9876543210';
  const maxIndex = charset.length;

  // randomize
  for (let a = 0; a < maxIndex; a++) {
    const randomIndex = Math.floor(Math.random() * (a + 1));
    const temp = charset[randomIndex];
    charset[a] = charset[randomIndex];
    charset[randomIndex] = temp;
  }

  // generate
  for (let a = 0; a < desiredLen; a++) gen += charset[Math.floor(Math.random() * maxIndex)];
  return gen;
}

module.exports.randomConfirmCode = () => random(8);
