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

  const xMid = 400;
  const yMid = 400;

  const standardColors = [
    '#FFE4C4',
    '#FFDEAD',
    '#F5DEB3',
    '#DEB887',
    '#D2B48C',
    '#BC8F8F',
    '#F4A460',
    '#DAA520',
    '#B8860B',
    '#CD853F',
    '#D2691E',
    '#8B4513',
    '#A0522D',
    '#A52A2A',
    '#800000',
    '#40E0D0',
    '#48D1CC',
    '#00CED1',
    '#5F9EA0',
    '#4682B4',
    '#B0C4DE',
    '#B0E0E6',
    '#ADD8E6',
    '#87CEEB',
    '#87CEFA',
    '#00BFFF',
    '#1E90FF',
    '#6495ED',
    '#7B68EE',
    '#4169E1',
    '#0000FF',
    '#0000CD',
    '#00008B',
    '#000080',
    '#191970',
    '#DDA0DD',
    '#EE82EE',
    '#DA70D6',
    '#FF00FF',
    '#FF00FF',
    '#BA55D3',
    '#9370DB',
    '#663399',
    '#8A2BE2',
    '#9400D3',
    '#9932CC',
    '#8B008B',
    '#800080',
    '#4B0082',
    '#6A5ACD',
    '#483D8B',
    '#7B68EE',
    '#FFE4B5',
    '#FFDAB9',
    '#EEE8AA',
    '#F0E68C',
    '#BDB76B',
    '#FFA07A',
    '#FF7F50',
    '#FF6347',
    '#FF4500',
    '#FF8C00',
    '#FFA500',
    '#FF69B4',
    '#FF1493',
    '#C71585',
    '#DB7093',
    '#B22222',
    '#8B0000',
    '#CD5C5C',
    '#F08080',
    '#FA8072',
    '#E9967A',
    '#FFA07A',
    '#DC143C',
  ];

  const colorIndexHistory = new Set<number>();

  function getRandomColor() {
    let randomIndex = ~~(Math.random() * standardColors.length);
    while (colorIndexHistory.has(randomIndex)) {
      randomIndex = ~~(Math.random() * standardColors.length);
    }
    if (colorIndexHistory.size == standardColors.length - 2) {
      colorIndexHistory.clear();
    }
    colorIndexHistory.add(randomIndex);
    return standardColors[randomIndex];
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
      return `line[${this.x1}:${this.y1},${this.x2}:${this.y2}]`;
    }
    isEqual(line: Line | undefined) {
      if (line == undefined) return false;
      return (
        this.x1 == line.x1 &&
        this.y1 == line.y1 &&
        this.x2 == line.x2 &&
        this.y2 == line.y2
      );
    }
    static fromKey(lineKey: string): Line {
      const matchedNumbers = lineKey.match(/\d+/g);
      let x1 = parseInt(matchedNumbers?.at(0) || '0');
      let y1 = parseInt(matchedNumbers?.at(1) || '0');
      let x2 = parseInt(matchedNumbers?.at(2) || '0');
      let y2 = parseInt(matchedNumbers?.at(3) || '0');
      return new Line(x1, y1, x2, y2);
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
      return `point[${this.x}:${this.y}]`;
    }
    isEqual(point: Point | undefined) {
      if (point == undefined) return false;
      return this.x == point!.x && this.y == point!.y;
    }
    static FromKey(key: string) {
      const match = key.match(/point\[(\d+):(\d+)\]/);
      return new Point(parseInt(match![1]), parseInt(match![2]));
    }
  }

  class Path {
    points: Array<Point> = [];
    color: string = '#000';
    centroid: Point | undefined;
    angle: number | undefined;

    private markCentroid() {
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(this.centroid!.x, this.centroid!.y, 2, 2);
      ctx.restore();
    }

    buildPath(ctx: CanvasRenderingContext2D) {
      if (this.points.length == 0) return;
      // console.log(`this.points.length = ${this.points.length}`);
      const path = new Path2D();
      path.moveTo(this.points.at(-1)!.x, this.points.at(-1)!.y);
      ctx.save();
      for (let point of this.points) {
        // ctx.fillStyle = 'red';
        // ctx.fillRect(point.x, point.y, 1, 1);
        path.lineTo(point.x, point.y);
      }

      ctx.fillStyle = this.color;
      ctx.fill(path);
      ctx.strokeStyle = '#00FF00';
      ctx.stroke(path);
      ctx.restore();

      if (this.centroid == undefined) {
        const x =
          this.points.reduce((xTotal, p) => p.x + xTotal, 0) /
          this.points.length;
        const y =
          this.points.reduce((yTotal, p) => p.y + yTotal, 0) /
          this.points.length;
        this.centroid = new Point(x, y);
        this.angle = Math.atan2(y - yMid, x - xMid);
      }
      // this.markCentroid();
    }
  }

  let arrayPath: Array<Path> = [];

  let paths = [];
  let lines: Line[] = [];
  let points: Point[] = [];
  let linePoints = new Map<string, Array<Point>>();
  let pointLines = new Map<string, Array<Line>>();

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
      lines.push(l);
      pointLines.set(p.key, lines);
    } else {
      const s = new Array<Line>();
      s.push(l);
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
      const path = new Path2D();

      path.moveTo(x1, y1);
      let { x: x2, y: y2 } = getRandomPointOnPerim();
      while (x2 == x1 || y2 == y1) {
        let { x: anotherX, y: anotherY } = getRandomPointOnPerim();
        // console.log(`need another x2== ${x2} y2== ${y2}`);
        x2 = anotherX;
        y2 = anotherY;
      }
      path.lineTo(x2, y2);
      ctx.strokeStyle = '#00FF00';
      ctx.stroke(path);
      path.closePath();
      paths.push(path);

      const p1 = new Point(x1, y1);
      const p2 = new Point(x2, y2);

      {
        const delta = 25;

        const midPoint = new Point(400, 400);
        const dy = midPoint.y - p1.y;
        const dx = midPoint.x - p1.x;
        const angle = Math.atan2(dy, dx);

        const fillText = (str: string, x: number, y: number) => {
          ctx.fillText(str, x, y);
        };

        let x0;
        let y0;
        let y01;
        if (p1.x == sx1 || p1.x == sx2) {
          x0 = p1.x - Math.sign(dx) * delta;
          y0 = p1.y;
          y01 = y0 + 10;
        }
        if (p1.y == sy1 || p1.y == sy2) {
          y0 = p1.y - Math.sign(dy) * delta;
          y01 = y0 - Math.sign(dy) * 10;
          x0 = p1.x;
        }
        fillText(`x:${p1.x}`, x0!, y0!);
        fillText(`y:${p1.y}`, x0!, y01!);

        // console.log(`p1 ${p1.key} atan2 ${angle} \n atan`);
      }

      const l1 = new Line(x1, y1, x2, y2);
      lines.push(l1);
      points.push(p1);
      points.push(p2);
      addToLinePoints(l1, p1);
      addToLinePoints(l1, p2);
      addToPointLines(p1, l1);
      addToPointLines(p2, l1);
    };

    Array.from({ length: 25 }).forEach(() => {
      drawRandomLine();
    });

    ctx.fillStyle = 'red';

    for (const line of lines) {
      for (const aLine of lines) {
        if (aLine == line) {
          continue;
        }
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
            continue;
          }

          const x0 = line.x1 + a * (line.x2 - line.x1);
          const y0 = line.y1 + a * (line.y2 - line.y1);

          const p: Point = new Point(Math.round(x0), Math.round(y0));
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
          .filter((e: Point, i: number, a: Array<Point>) => {
            if (i == 0) return true;
            return !e.isEqual(a[i - 1]);
          })
      );
    });

    pointLines.forEach((lines, point) => {
      pointLines.set(
        point,
        lines
          .sort((a: Line, b: Line) => {
            return a.key.localeCompare(b.key);
          })
          .filter((e: Line, i: number, a: Array<Line>) => {
            if (i == 0) return true;
            return (
              e.y1 != a[i - 1].y1 ||
              e.x1 != a[i - 1].x1 ||
              e.y2 != a[i - 1].y2 ||
              e.x2 != a[i - 1].x2
            );
          })
      );
    });

    let pointToPoints = new Map<string, Point[]>();

    const addPointToPoints = (point: Point, pointsToAdd: Point[]) => {
      if (pointsToAdd.length == 0) return;
      const pointsToUpdate = pointToPoints.get(point.key);
      if (pointsToUpdate == undefined) {
        pointToPoints.set(point.key, pointsToAdd);
      } else {
        pointsToUpdate.push(...pointsToAdd);
        pointToPoints.set(point.key, pointsToUpdate);
      }
    };

    pointLines.forEach((lines, pointKey) => {
      // console.log(`<><><>POINT\n${pointKey}\n`);
      lines.forEach((line) => {
        const points = linePoints.get(line.key) || [];
        // console.log(`${line.key}\n${points.map((p) => p.key).join(' ')}\n`);
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          if (point.key == pointKey) {
            const arrayOfPoints: Point[] = [];
            if (i > 0) {
              arrayOfPoints.push(points[i - 1]);
            }
            if (i < points.length - 1) {
              arrayOfPoints.push(points[i + 1]);
            }
            // console.log(`length of points ${arrayOfPoints.length}\n`);
            addPointToPoints(point, arrayOfPoints);
          }
        }
      });
      // console.log(`check length save ${pointToPoints.get(pointKey)?.length}`);
    });

    const drawLine = (point: Point, anotherPoint: Point) => {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(anotherPoint.x, anotherPoint.y);
      ctx.stroke();
      ctx.closePath();
    };

    const drawShape = (points: Point[]) => {
      const path = new Path2D();
      const p = points[0];
      path.moveTo(p.x, p.y);
      for (let i = 0; i < points.length; i++) {
        //const p = points[i];
        const p2 = points[(i + 1) % points.length];

        path.lineTo(p2.x, p2.y);
      }
      path.closePath();
      ctx.fillStyle = getRandomColor();
      ctx.fill(path);

      const x = points.reduce((xTotal, p) => p.x + xTotal, 0) / points.length;
      const y = points.reduce((yTotal, p) => p.y + yTotal, 0) / points.length;
      ctx.save();
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x, y, 2, 2);
      ctx.restore();
    };

    const isAnglesOpposite = (angle1: number, angle2: number): boolean => {
      const precision = 0.0001;
      const comp1 = Math.fround(angle1);
      const comp2 = Math.fround(angle2);

      if (Math.abs(Math.abs(comp1 - comp2) - Math.PI) <= precision) {
        return true;
      }
      return false;
    };

    const visitedPoints = new Map<string, number>();

    const pathStrokes: Array<{ points: Point[] }> = [];

    const followPath = (point: Point, points: Point[]) => {
      const color = getRandomColor();

      visitedPoints.set(point.key, points.length);

      const angles = points.map((p) => {
        let angle = Math.atan2(point.y - p.y, point.x - p.x);
        if (angle < 0) {
          angle = Math.PI * 2 + angle;
        }
        return { angle: angle, point: p };
      });

      angles.sort((a, b) => {
        if (a.angle > b.angle) return -1;
        if (a.angle < b.angle) return 1;
        return 0;
      });

      for (let i = 0; i < points.length; ++i) {
        const p = points[i];
        ctx.strokeStyle = color;
        drawLine(point, p);
      }

      // console.log(`\n\n>>>>> POINT ${point.key}\n`);
      angles.forEach((angle, index) => {
        // console.log(`i=${index} a= ${angle.angle}`);
      });
      // console.log('\n');
      for (let i = 0; i < angles.length; i++) {
        const angle1 = angles[i];

        const angle2 = angles[(i + 1) % angles.length];

        if (i == angles.length - 1 && angles.length < 3) {
          continue;
        }

        if (!isAnglesOpposite(angle1.angle, angle2.angle)) {
          // console.log(
          //   `not 1=${angle1.angle} 2=${angle2.angle} E=${
          //     Math.abs(angle1.angle) + Math.abs(angle2.angle) - Math.PI
          //   }`
          // );
          pathStrokes.push({ points: [angle1.point, point, angle2.point] });
          // drawShape([angle1.point, point, angle2.point]);
        } else {
          // console.log(
          //   `opposite 1=${angle1.angle} 2=${angle2.angle} E=${Math.abs(
          //     Math.abs(angle1.angle - angle2.angle) - Math.PI
          //   )}`
          // );
        }
      }
    };

    pointToPoints.forEach((points, point) => {
      followPath(Point.FromKey(point), points);
    });

    const first = 0;
    const second = 1;
    const third = 2;
    const last = -1;
    const beforeLast = -2;
    const oneBeforeLast = -3;

    const removed = new Set<number>();

    // get determinant of
    const getD = (p1: Point, p2: Point, p3: Point) => {
      return (p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x);
    };

    console.log(`\n\n number of path storkes = ${pathStrokes.length}`);

    for (let i = 0; i < pathStrokes.length; i++) {
      if (removed.has(i)) {
        continue;
      }
      const A0 = pathStrokes[i].points[first];
      const A1 = pathStrokes[i].points[second];
      const A2 = pathStrokes[i].points[third];
      const B0 = pathStrokes[i].points.at(last);
      const B1 = pathStrokes[i].points.at(beforeLast);
      const B2 = pathStrokes[i].points.at(oneBeforeLast);
      for (let j = 0; j < pathStrokes.length; j++) {
        if (i == j || removed.has(j)) continue;

        const cA0 = pathStrokes[j].points[first];
        const cA1 = pathStrokes[j].points[second];
        const cA2 = pathStrokes[j].points[third];
        const cB0 = pathStrokes[j].points.at(last);
        const cB1 = pathStrokes[j].points.at(beforeLast);
        const cB2 = pathStrokes[j].points.at(oneBeforeLast);

        if (cA0.isEqual(A1) && cA1.isEqual(A0)) {
          if (
            (getD(A0, A1, A2) > 0 && getD(cA0, cA1, cA2) < 0) ||
            (getD(A0, A1, A2) < 0 && getD(cA0, cA1, cA2) > 0)
          ) {
            const temp = pathStrokes[j].points.slice(2).reverse();
            const newPoints = temp.concat(pathStrokes[i].points);
            pathStrokes[i].points = newPoints;
            removed.add(j);
          }
        } else if (cA0.isEqual(B1) && cA1.isEqual(B0)) {
          if (
            (getD(B0!, B1!, B2!) > 0 && getD(cA0, cA1, cA2) < 0) ||
            (getD(B0!, B1!, B2!) < 0 && getD(cA0, cA1, cA2) > 0)
          ) {
            // if (pathStrokes[j].points.length > 3) {
            //   // console.log(`candidate has more than 3 points`);
            // } else pathStrokes[i].points.push(cA2);
            // // pathStrokes[i].legB = pathStrokes[j].legA;
            pathStrokes[i].points.push(...pathStrokes[j].points.slice(2));
            removed.add(j);
          }
        } else if (cB0.isEqual(A1) && cB1.isEqual(A0)) {
          if (
            (getD(A0, A1, A2) < 0 && getD(cB0, cB1, cB2) > 0) ||
            (getD(A0, A1, A2) > 0 && getD(cB0, cB1, cB2) < 0)
          ) {
            const newPoints = pathStrokes[j].points.slice(0, -2);
            newPoints.push(...pathStrokes[i].points);
            pathStrokes[i].points = newPoints;
            removed.add(j);
          }
        } else if (cB0.isEqual(B1) && cB1.isEqual(B0)) {
          if (
            (getD(B0, B1, B2) > 0 && getD(cB0, cB1, cB2) < 0) ||
            (getD(B0, B1, B2) < 0 && getD(cB0, cB1, cB2) > 0)
          ) {
            pathStrokes[i].points.push(
              ...pathStrokes[j].points.reverse().slice(2)
            );
            removed.add(j);
          }
        }
        const pts = pathStrokes[i].points;
        if (
          pts[first].isEqual(pts.at(beforeLast)) &&
          pts[second].isEqual(pts.at(last))
        ) {
          // console.log(
          //   `trimming already connected path ${pts
          //     .slice(-2)
          //     .map((p) => p.key)
          //     .join(' ')}`
          // );
          pathStrokes[i].points = pts.slice(0, -2);
        }
        if (pts[first].isEqual(pts.at(last))) {
          pathStrokes[i].points = pts.slice(0, -1);
        }
      }
    }

    console.log(`\n\nchecking duplicate points:\n`);

    for (let i = 0; i < pathStrokes.length; i++) {
      if (removed.has(i)) continue;
      const pS = pathStrokes[i];
      let duplicatesFound = 0;
      if (
        (duplicatesFound = pS.points
          .toSorted((a: Point, b: Point) => {
            if (a.y > b.y) return 1;
            if (a.y < b.y) return -1;
            if (a.y == b.y) {
              if (a.x > b.x) return 1;
              if (a.x < b.x) return -1;
            }
            return 0;
          })
          .filter((p, i, a) => {
            if (i == 0) return false;
            return p.isEqual(a[i - 1]);
          }).length) > 0
      ) {
        console.log(
          `found dups=${duplicatesFound} `,
          pS.points.map((p) => p.key).join(' ')
        );
        const redColor = getRedColor();
        pS.points.forEach((p) => {
          ctx.save();
          ctx.fillStyle = redColor;
          ctx.fillRect(p.x, p.y, 3, 3);
          ctx.restore();
        });
      }
      drawShape(pS.points);
    }

    ctx.strokeStyle = '#00FF00';
    lines.forEach((line) => {
      const path = new Path2D();
      path.moveTo(line.x1, line.y1);
      path.lineTo(line.x2, line.y2);
      ctx.stroke(path);
    });
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
