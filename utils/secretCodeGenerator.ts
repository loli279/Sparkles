
const COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Silver', 'Gold', 'Teal'
];

const ANIMALS = [
  'Fox', 'Bear', 'Lion', 'Tiger', 'Wolf', 'Eagle', 'Panda', 'Shark', 'Dino', 'Robot'
];

const SHAPES = [
  'Star', 'Circle', 'Square', 'Moon', 'Heart', 'Diamond', 'Bolt', 'Gem', 'Sun', 'Cloud'
];

export const generateSecretCode = (): string => {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const number = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${color}${animal}${shape}${number}`;
};