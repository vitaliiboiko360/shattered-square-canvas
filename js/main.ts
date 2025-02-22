(function () {
  'use strict';

  let canvas: HTMLCanvasElement;
  let button;
  let ctx: CanvasRenderingContext2D;

  const sx1 = 200;
  const sy1 = 200;
  const w = 400;
  const h = 400;
  const sx2 = sx1 + w;
  const sy2 = sy1 + h;
  const sx3 = sx1 + w;
  const sy3 = sy1;
  const sx4 = sx1;
  const sy4 = sy1 + h;

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const getRandomPointOnPerim = (): { x: number; y: number } => {
    const r1 = ~~(Math.random() * 4);
    const r2 = Math.random();

    if (r1 == 0) {
      return { x: Math.floor(r2 * (w - 1)) + sx1 + 1, y: sy1 };
    }
    if (r1 == 2) {
      return { x: Math.floor(r2 * (w - 1)) + sx1 + 1, y: sy2 };
    }
    if (r1 == 1) {
      return { x: sx1, y: Math.floor(r2 * (h - 1)) + sy1 + 1 };
    }
    if (r1 == 3) {
      return { x: sx2, y: Math.floor(r2 * (h - 1)) + sy1 + 1 };
    }
    return { x: 0, y: 0 };
  };

  class Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    }
    get key() {
      return `lineKey[${this.x1}:${this.y1},${this.x2}:${this.y2}]`;
    }
  }

  class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
    get key() {
      return `pointKey[${this.x}:${this.y}]`;
    }
  }

  let paths = [];
  let lines: Line[] = [];
  let points: Point[] = [];
  let linePoints = new Map<String, Array<Point>>();
  let pointLines = new Map<String, Set<Line>>();

  const p1: Point = new Point(sx1, sy1);
  const p2: Point = new Point(sx2, sy2);
  const p3: Point = new Point(sx3, sy3);
  const p4: Point = new Point(sx4, sy4);

  const l1: Line = new Line(p1.x, p1.y, p3.x, p3.y);
  linePoints.set(l1.key, [p1, p3]);

  const l2: Line = new Line(p3.x, p3.y, p2.x, p2.y);
  linePoints.set(l2.key, [p3, p2]);

  const l3: Line = new Line(p2.x, p2.y, p4.x, p4.y);
  linePoints.set(l3.key, [p2, p4]);

  const l4: Line = new Line(p1.x, p1.y, p4.x, p4.y);
  linePoints.set(l4.key, [p1, p4]);

  const addToLinePoints = (l: Line, p: Point) => {
    const points = linePoints.get(l.key);
    if (points) {
      points.push(p);
      linePoints.set(l.key, points);
    } else {
      linePoints.set(l.key, [p]);
    }
  };

  const addToPointLines = (p: Point, l: Line) => {
    const lines = pointLines.get(p.key);
    if (lines) {
      lines.add(l);
      pointLines.set(p.key, lines);
    } else {
      const s = new Set<Line>();
      s.add(l);
      pointLines.set(p.key, s);
    }
  };

  lines.push(l1);
  lines.push(l2);
  lines.push(l3);
  lines.push(l4);

  addToPointLines(p1, l1);
  addToPointLines(p1, l4);
  addToPointLines(p3, l1);
  addToPointLines(p3, l2);

  points.push(p1);
  points.push(p2);
  points.push(p3);
  points.push(p4);

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
        console.log(`need another x2== ${x2} y2== ${y2}`);
        x2 = anotherX;
        y2 = anotherY;
      }
      // console.log(`x2 == ${x2}`);
      // console.log(`y2 == ${y2}`);
      path.lineTo(x2, y2);
      ctx.strokeStyle = '#00FF00';
      ctx.stroke(path);
      path.closePath();
      paths.push(path);
      // console.log(`push ${JSON.stringify({ x1: x1, y1: y1, x2: x2, y2: y2 })}`);

      // ctx.strokeStyle = 'black';
      // ctx.strokeText(`${paths.length}`, x1 + 5, y1 + 5);

      const p1 = new Point(x1, y1);
      const p2 = new Point(x2, y2);
      const l1 = new Line(x1, y1, x2, y2);
      lines.push(l1);
      points.push(p1);
      points.push(p2);
      addToLinePoints(l1, p1);
      addToLinePoints(l1, p2);
      addToPointLines(p1, l1);
      addToPointLines(p2, l1);
    };

    Array.from({ length: 10 }).forEach(() => {
      drawRandomLine();
    });

    ctx.fillStyle = 'red';

    for (const line of lines) {
      for (const aLine of lines) {
        if (aLine == line) {
          // console.log(`we hit the same line`);
          continue;
        }
        // console.log(JSON.stringify(aLine));
        // console.log(JSON.stringify(line));
        // console.log(`aLine == ${aLine.x1} ${aLine.y1} ${aLine.x2} ${aLine.y}`);
        // console.log(`line == ${line.x1} ${line.y1} ${line.x2} ${line.y}`);
        const denom =
          (aLine.x2 - aLine.x1) * (line.y2 - line.y1) -
          (aLine.y2 - aLine.y1) * (line.x2 - line.x1);

        if (!isNaN(denom) && denom != 0) {
          const alpha =
            (aLine.x2 - aLine.x1) * (aLine.y1 - line.y1) -
            (aLine.y2 - aLine.y1) * (aLine.x1 - line.x1);

          const beta =
            (line.x2 - line.x1) * (aLine.y1 - line.y1) -
            (line.y2 - line.y1) * (aLine.x1 - line.x1);

          const a = alpha / denom;
          const b = beta / denom;

          if (a < 0 || a > 1 || b < 0 || b > 1) {
            // console.log(`\n\na=${a}\tb=${b}\n\n`);
            continue;
          }

          // console.log(`denom ==${denom}`);
          // console.log(`alpha == ${a}  beta == ${a}`);
          // console.log(`\n\n`);

          if (a > 1 || a < 0 || b < 0 || b > 1) {
            continue;
          }
          // const dx = a * (line.x2 - line.x1);
          // const dy = a * (line.y2 - line.y1);
          // console.log(`dx == ${dx} dy == ${dy}`);
          const x0 = line.x1 + a * (line.x2 - line.x1);
          const y0 = line.y1 + a * (line.y2 - line.y1);
          // console.log(`x == ${x0} y == ${y0}`);

          const p: Point = new Point(x0, y0);
          points.push(p);
          addToLinePoints(line, p);
          addToLinePoints(aLine, p);
          addToPointLines(p, line);
          addToPointLines(p, aLine);
        }
      }
    }

    for (const point of points) {
      const { x, y } = point;
      ctx.fillRect(x, y, 1, 1);
    }

    linePoints.forEach((points, line) => {
      linePoints.set(
        line,
        points
          .sort((a: Point, b: Point) => {
            if (a.y > b.y) return 1;
            if (a.y < b.y) return -1;
            if (a.y == b.y) {
              if (a.x > b.x) return 1;
              if (a.x < b.x) return -1;
            }
            return 0;
          })
          .filter((e, i, a) => {
            if (i == 0) return true;
            return e.y != a[i - 1].y || e.x != a[i - 1].x;
          })
      );
    });

    for (const point of linePoints.get(l1.key) || []) {
      const linesCrossed = pointLines.get(point.key);
      console.log(`for point ${JSON.stringify(point)}`);
      console.log(`there are lines ${linesCrossed?.size}`);
    }

    //window.requestAnimationFrame(drawAnime);
  }

  async function init() {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    button = document.getElementById('button');
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.focus();

    button!.addEventListener('click', drawAnime);
    drawAnime();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
