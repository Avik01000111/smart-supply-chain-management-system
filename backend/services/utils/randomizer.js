function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSpeed() {
  return getRandomInt(35, 80);
}

function getRandomFuelDrop() {
  return getRandomNumber(0.5, 2.5);
}

function getRandomCongestionLevel() {
  return getRandomInt(10, 95);
}

module.exports = {
  getRandomNumber,
  getRandomInt,
  getRandomSpeed,
  getRandomFuelDrop,
  getRandomCongestionLevel
};