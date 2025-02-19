(function () {
  'use strict';

  let canvas;
  let button;
  let ctx;

  const sx1 = 200;
  const sy1 = 200;
  const w = 400;
  const h = 400;
  const sx2 = sx1 + w;
  const sy2 = sy1 + h;

  const getRandomPointOnPerim = () => {
    const r1 = ~~(Math.random() * 4);
    const r2 = Math.random();

    if (r1 == 0) {
      return { x: r2 * w + sx1 + 1, y: sy1 };
    }
    if (r1 == 2) {
      return { x: r2 * w + sx1 + 1, y: sy2 };
    }
    if (r1 == 1) {
      return { x: sx1, y: r2 * h + sy1 + 1 };
    }
    if (r1 == 3) {
      return { x: sx2, y: r2 * h + sy1 + 1 };
    }
  };

  let paths = [];

  function drawAnime() {
    ctx.strokeRect(sx1, sy1, w, h);

    const drawRandomLine = () => {
      const { x: x1, y: y1 } = getRandomPointOnPerim();
      // console.log(`x1 == ${x1}`);
      // console.log(`y1 == ${y1}`);
      const path = new Path2D();

      path.moveTo(x1, y1);
      let { x: x2, y: y2 } = getRandomPointOnPerim();
      while (x2 == x1 || y2 == y1) {
        let { x: anotherX, y: anotherY } = getRandomPointOnPerim();
        x2 = anotherX;
        y2 = anotherY;
      }
      // console.log(`x2 == ${x2}`);
      // console.log(`y2 == ${y2}`);
      path.lineTo(x2, y2);
      ctx.stroke(path);
      path.closePath();
      paths.push(path);
    };
    ctx.strokeStyle = '#00FF00';
    Array.from({ length: 20 }).forEach(() => {
      drawRandomLine();
    });

    console.log(`paths == ${paths.length}`);
    ctx.fillStyle = 'blue';
    for (let ix = sx1; ix <= sx2; ++ix) {
      for (let jy = sy1; jy <= sy2; ++jy) {
        if (
          paths.filter((path) => {
            return ctx.isPointInStroke(path, ix, jy);
          }).length > 1
        ) {
          // console.log(`isPointInStroke`);
          ctx.fillRect(ix, jy, 1, 1);
        }
      }
    }

    //window.requestAnimationFrame(drawAnime);
  }

  async function init() {
    canvas = document.getElementById('canvas');
    button = document.getElementById('button');
    ctx = canvas.getContext('2d');
    canvas.focus();

    button.addEventListener('click', drawAnime);
    drawAnime();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
