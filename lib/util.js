const capFirstLetter = (string) => {
  const str = string.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports.capFirstLetter = capFirstLetter;
