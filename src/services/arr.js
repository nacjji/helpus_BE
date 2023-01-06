const arr = [
  { userId: 3, score: 8.2 },
  { userId: 3, score: 8.2 },
  { userId: 4, score: 8.2 },
  { userId: 4, score: 8.2 },
  { userId: 4, score: 8.2 },
  { userId: 4, score: 8.2 },
  { userId: 3, score: 8.2 },
  { userId: 3, score: 8.2 },
  { userId: 3, score: 8.2 },
  { userId: 3, score: 8.2 },
  { userId: 3, score: 8.2 },
];

// eslint-disable-next-line no-unused-expressions

const result =
  arr.reduce((sum, currValue) => {
    return sum + currValue.score;
  }, 0) / arr.length;

console.log(result);
