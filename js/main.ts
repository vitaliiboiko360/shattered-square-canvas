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

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
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
  }

  class Line2 {
    p1: Point;
    p2: Point;

    private sortedPoints: Point[] | undefined = undefined;
    private initSortedPoints() {
      this.sortedPoints = [this.p1, this.p2].sort((a, b) => {
        if (a.x > b.x) return 1;
        if (a.x < b.x) return -1;
        if (a.x == b.x) {
          if (a.y > b.y) return 1;
          if (a.y < b.y) return -1;
        }
        return 0;
      });
    }

    constructor(x1: number, y1: number, x2: number, y2: number) {
      this.p1 = new Point(x1, y1);
      this.p2 = new Point(x2, y2);
      this.initSortedPoints();
    }
    get key() {
      return `line[${this.sortedPoints![0].x}:${this.sortedPoints![0].y},${
        this.sortedPoints![1].x
      }:${this.sortedPoints![1].y}]`;
    }
    isEqual(otherLine: Line2 | undefined) {
      if (otherLine == undefined) return false;
      return (
        (this.p1.isEqual(otherLine.p1) && this.p2.isEqual(otherLine.p2)) ||
        (this.p2.isEqual(otherLine.p1) && this.p1.isEqual(otherLine.p2))
      );
    }
    static FromPoints(p1: Point, p2: Point) {
      return new Line2(p1.x, p1.y, p2.x, p2.y);
    }
    static FromLine(line: Line) {
      return new Line2(line.x1, line.y1, line.x2, line.y2);
    }
    // static fromKey(lineKey: string): Line {
    //   const matchedNumbers = lineKey.match(/\d+/g);
    //   let x1 = parseInt(matchedNumbers?.at(0) || '0');
    //   let y1 = parseInt(matchedNumbers?.at(1) || '0');
    //   let x2 = parseInt(matchedNumbers?.at(2) || '0');
    //   let y2 = parseInt(matchedNumbers?.at(3) || '0');
    //   return new Line(x1, y1, x2, y2);
    // }
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
        console.log(`need another x2== ${x2} y2== ${y2}`);
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

        console.log(`p1 ${p1.key} atan2 ${angle} \n atan`);
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

    Array.from({ length: 15 }).forEach(() => {
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

          // console.log(`denom ==${denom}`);
          // console.log(`alpha == ${a}  beta == ${a}`);
          // console.log(`\n\n`);

          if (a < 0 || a > 1 || b < 0 || b > 1) {
            // console.log(`\n\na=${a}\tb=${b}\n\n`);
            continue;
          }

          // const dx = a * (line.x2 - line.x1);
          // const dy = a * (line.y2 - line.y1);
          // console.log(`dx == ${dx} dy == ${dy}`);
          const x0 = line.x1 + a * (line.x2 - line.x1);
          const y0 = line.y1 + a * (line.y2 - line.y1);
          // console.log(`x == ${x0} y == ${y0}`);

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

    let pointToPoints = new Map<Point, Point[]>();

    const addPointToPoints = (point: Point, pointsToAdd: Point[]) => {
      const pointsToUpdate = pointToPoints.get(point);
      if (pointsToUpdate == undefined) {
        pointToPoints.set(point, pointsToAdd);
      } else {
        pointsToUpdate.push(...pointsToAdd);
        pointToPoints.set(point, pointsToUpdate);
      }
    };

    pointLines.forEach((lines, pointKey) => {
      lines.forEach((line) => {
        const points = linePoints.get(line.key) || [];
        points.forEach((point, index, array) => {
          if (point.key == pointKey) {
            const arrayOfPoints: Point[] = [];
            if (index > 0) {
              arrayOfPoints.push(array[index - 1]);
            }
            if (index < array.length - 1) {
              arrayOfPoints.push(array[index + 1]);
            }
            addPointToPoints(point, arrayOfPoints);
          }
        });
      });
    });

    const drawLine = (point: Point, anotherPoint: Point) => {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(anotherPoint.x, anotherPoint.y);
      ctx.stroke();
      ctx.closePath();
    };

    const isEqualAngles = (angle1: number, angle2: number): boolean => {
      const precision = 0.001;
      const comp1 = Math.fround(angle1);
      const comp2 = Math.fround(angle2);

      if (Math.abs(comp1 - comp2) <= precision) {
        return true;
      }
      return false;
    };

    const followPath = (
      point: Point,
      points: Point[] | undefined,
      color: string
    ) => {
      if (points == undefined) {
        points = pointToPoints.get(point);
      }
      if (point == undefined) return;

      let angleToPoint: { p: Point; angle: number }[] = [];

      angleToPoint = points!
        .filter((p) => !p.isEqual(point))
        .map((p) => {
          usedPoints.add(p);
          let angle = Math.atan2(point.y - p.y, point.x - p.x);
          if (angle < 0) {
            angle = Math.PI * 2 + angle;
          }
          return { p: p, angle: angle };
        });

      angleToPoint.forEach((pointAngle) => {
        if (isEqualAngles(Math.PI, pointAngle.angle)) {
          ctx.strokeStyle = 'green';
        } else if (isEqualAngles(0, pointAngle.angle)) {
          ctx.strokeStyle = 'blue';
        } else if (isEqualAngles((Math.PI * 3) / 2, pointAngle.angle)) {
          ctx.strokeStyle = 'red';
        } else if (isEqualAngles(Math.PI / 2, pointAngle.angle)) {
          ctx.strokeStyle = 'yellow';
        } else {
          ctx.strokeStyle = color;
        }
        drawLine(point, pointAngle.p);
      });
    };

    const usedPoints = new Set<Point>();

    pointToPoints.forEach((points, point) => {
      if (usedPoints.has(point)) return;
      usedPoints.add(point);
      const color = getRandomColor();
      followPath(point, points, color);
    });

    // {
    //   const notPerimLine = (l: Line) =>
    //     !l.isEqual(l1) && !l.isEqual(l2) && !l.isEqual(l3) && !l.isEqual(l4);

    //   console.log(`linePoints.size ${linePoints.size}`);

    //   // linePoints.forEach((points, lineKey) => {
    //   //   const line = Line.fromKey(lineKey);
    //   //   if (!notPerimLine(line)) {
    //   //     return;
    //   //   }
    //   //   console.log(`\n\n${lineKey}\n`);
    //   //   let i = 0;
    //   //   for (const point of points) {
    //   //     if (i >= points.length - 1) continue;
    //   //     const pointA = point;
    //   //     const pointB = points[++i];

    //   //     const pointsForA =
    //   //       pointLines
    //   //         .get(pointA.key)
    //   //         ?.filter((l) => {
    //   //           if (!line.isEqual(l) && l) console.log(`A ${l?.key}`);
    //   //           return !line.isEqual(l) && l;
    //   //         })
    //   //         ?.flatMap((l) => {
    //   //           console.log(
    //   //             linePoints
    //   //               .get(l.key)
    //   //               ?.map((p) => p.key)
    //   //               ?.join(' ')
    //   //           );
    //   //           let points = (
    //   //             linePoints.get(l.key) as Array<Point | undefined>
    //   //           ).slice();
    //   //           points?.unshift(undefined);
    //   //           points?.push(undefined);
    //   //           return points;
    //   //         })
    //   //         ?.reduce((result, p, i, a) => {
    //   //           if (p?.isEqual(pointA)) {
    //   //             let pair = [a[i - 1], a[i + 1]];
    //   //             console.log(
    //   //               'pair:\t' + pair.map((p) => p?.key || 'undef').join(' ')
    //   //             );
    //   //             result.push(pair);
    //   //           }
    //   //           return result;
    //   //         }, [] as Array<Array<Point | undefined>>) || [];
    //   //     const pointsForB =
    //   //       pointLines
    //   //         .get(pointB.key)
    //   //         ?.filter((l) => {
    //   //           if (!line.isEqual(l) && l) console.log(`B ${l.key}`);
    //   //           return !line.isEqual(l) && l;
    //   //         })
    //   //         ?.flatMap((l) => {
    //   //           console.log(
    //   //             linePoints
    //   //               .get(l.key)
    //   //               ?.map((p) => p.key)
    //   //               ?.join(' ')
    //   //           );
    //   //           let points = (
    //   //             linePoints.get(l.key) as Array<Point | undefined>
    //   //           ).slice();
    //   //           points?.unshift(undefined);
    //   //           points?.push(undefined);
    //   //           return points;
    //   //         })
    //   //         ?.reduce((result, p, i, a) => {
    //   //           if (p?.isEqual(pointB)) {
    //   //             let pair = [a[i - 1], a[i + 1]];
    //   //             console.log(
    //   //               'pair:\t' + pair.map((p) => p?.key || 'undef').join(' ')
    //   //             );
    //   //             result.push(pair);
    //   //           }
    //   //           return result;
    //   //         }, [] as Array<Array<Point | undefined>>) || [];

    //   //     const outputAtan2 = (
    //   //       str: string,
    //   //       point: Point,
    //   //       points: Array<Array<Point | undefined>>
    //   //     ) => {
    //   //       points.forEach((pair, index) => {
    //   //         if (pair[0]) {
    //   //           console.log(
    //   //             `${str} ${index + 1} : 0 :\t${Math.atan2(
    //   //               point.y - pair[0].y,
    //   //               point.x - pair[0].x
    //   //             )}`
    //   //           );
    //   //         }
    //   //         if (pair[1]) {
    //   //           console.log(
    //   //             `${str} ${index + 1} : 1 :\t${Math.atan2(
    //   //               point.y - pair[1].y,
    //   //               point.x - pair[1].x
    //   //             )}`
    //   //           );
    //   //         }
    //   //       });
    //   //     };

    //   //     console.log(
    //   //       ` atan p1-p2 : ${Math.atan2(
    //   //         pointA.x - pointB.x,
    //   //         pointA.y - pointB.y
    //   //       )}`
    //   //     );
    //   //     console.log(
    //   //       ` atan p2-p1 : ${Math.atan2(
    //   //         pointB.x - pointA.x,
    //   //         pointB.y - pointA.y
    //   //       )}`
    //   //     );
    //   //     outputAtan2('a->b', pointA, pointsForB);
    //   //     outputAtan2('b->a', pointB, pointsForA);
    //   //   }
    //   // });

    //   const buildPath = (p1: Point, p2: Point, p3: Point | undefined) => {
    //     const points: Point[] = [];
    //     points.push(p1);
    //     if (p3) points.push(p3);
    //     points.push(p2);

    //     const line1 = pointLines.get(p1.key)?.find(notPerimLine);
    //     const line2 = pointLines.get(p2.key)?.find(notPerimLine);
    //   };

    //   for (const point of points) {
    //     const linesCrossed = pointLines.get(point.key);
    //   }
    // }

    // {
    //   console.log(
    //     `first line l1 points == ${JSON.stringify(linePoints.get(l1.key))}`
    //   );

    //   const getLeftPoint = (point: Point, line: Line) => {
    //     const points = linePoints.get(line.key);
    //     //console.log(`points == ${JSON.stringify(linePoints.get(line.key))}`);

    //     const index = (points || []).findIndex((p) => p.isEqual(point));
    //     if (index == -1) {
    //       // console.log(`undefined: index of point == ${index}`);
    //       return undefined;
    //     }

    //     if (index > 0) {
    //       return points![index - 1];
    //     }

    //     return undefined;
    //   };

    //   const getRightPoint = (point: Point, line: Line) => {
    //     const points = linePoints.get(line.key);
    //     //console.log(`points == ${JSON.stringify(linePoints.get(line.key))}`);

    //     const index = (points || []).findIndex((p) => p.isEqual(point));
    //     if (index == -1) {
    //       // console.log(`undefined: index of point == ${index}`);
    //       return undefined;
    //     }

    //     if (index < points!.length - 1) {
    //       return points![index + 1];
    //     }

    //     return undefined;
    //   };

    //   let traversePath: Function;
    //   traversePath = (
    //     currentPoint: Point,
    //     currentLine: Line,
    //     visitedPoints: Point[]
    //   ) => {
    //     if (visitedPoints.slice(1).find((p) => p.isEqual(currentPoint))) {
    //       console.log(
    //         `we encountered visited point of the In-progress path building`,
    //         `\npoint = ${currentPoint.key}`
    //       );
    //       return;
    //     }
    //     const linesCrossed = pointLines.get(currentPoint.key) || [];
    //     const nextRightPoint = getRightPoint(currentPoint, currentLine);
    //     const nextLeftPoint = getLeftPoint(currentPoint, currentLine);

    //     if (currentPoint.isEqual(visitedPoints.at(0))) {
    //       const path = new Path2D();
    //       visitedPoints.forEach((p, i, a) => {
    //         path.moveTo(p.x, p.y);
    //         if (i < a.length - 1) {
    //           path.lineTo(a[i + 1].x, a[i + 1].y);
    //         }
    //       });
    //       path.closePath();
    //       ctx.fillStyle = getRandomColor();
    //       ctx.fill(path);
    //       ctx.stroke(path);
    //       console.log(`we build the path - check it`);
    //       return;
    //     } else {
    //       visitedPoints.push(currentPoint);
    //       if (nextLeftPoint) {
    //         const linesCrossed = pointLines.get(nextLeftPoint.key) || [];
    //         const nextLine = linesCrossed.find((l) => !l.isEqual(currentLine));
    //         console.log(`next Line == ${nextLine?.key}`);
    //         traversePath(nextLeftPoint, nextLine, visitedPoints);
    //       }
    //     }
    //   };
    // }
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
