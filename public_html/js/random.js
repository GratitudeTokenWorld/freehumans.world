export { randomBinary, random, smallRandom, bigRandom }

var randomBinary = function () {
    let nr = 0;
    nr = Math.random();
    nr < 0.5 ? nr = 0 : nr = 1;
    return nr
};

var random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

var smallRandom = function (min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

var bigRandom = function (min, max) {
    return (Math.random() * (max - min) + min).toFixed(0);
}