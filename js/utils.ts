function getRandomColor2() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    if (i == 2 || i == 3) {
      color += '0';
      continue;
    }
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const colorHistory = new Set<string>();

function getRandomColor1() {
  const getRand255 = () => ~~(Math.random() * 255);
  const getRand65 = () => ~~(Math.random() * 65);
  let color = '#';
  color += getRand255().toString(16);
  color += getRand65().toString(16);
  color += getRand255().toString(16);
  while (colorHistory.has(color)) {
    color = getRandomColor1();
  }
  colorHistory.add(color);
  return color;
}

const isEqualAngles = (angle1: number, angle2: number): boolean => {
  const precision = 0.001;
  const comp1 = Math.fround(angle1);
  const comp2 = Math.fround(angle2);

  if (Math.abs(comp1 - comp2) <= precision) {
    return true;
  }
  return false;
};
