type Coord = { x: number; y: number };
type FullPath = Coord[];
type PathfinderReturn = { fullPath: FullPath; pathLength: number };
type Pathfinder = (props: {
  fullPath: FullPath;
  labyrinthe: Labyrinthe;
  closeSet: Coord[];
  distance: number;
  position: Coord;
}) => PathfinderReturn[];
type Labyrinthe = {
  getCase: (position: Coord) => Case;
};
type Case = {
  top: () => boolean;
  right: () => boolean;
  left: () => boolean;
  bottom: () => boolean;
  isTarget: () => boolean;
};

let shortestPath: number | undefined = undefined;

type CalcDirectionProps = {
  closeSet: Coord[];
  caseDirection: Boolean;
  nextPosition: Coord;
  labyrinthe: Labyrinthe;
  distance: number;
  fullPath: FullPath;
};
const calcDirection =
  ({
    closeSet,
    caseDirection,
    nextPosition,
    labyrinthe,
    distance,
    fullPath,
  }: CalcDirectionProps) =>
  () => {
    const isNotInCloseSet = (x: number, y: number) =>
      closeSet.find((coord) => coord.x === x && coord.y === y) === undefined;

    if (
      caseDirection === true &&
      isNotInCloseSet(nextPosition.x, nextPosition.y)
    ) {
      return [
        ...pathfinder({
          labyrinthe,
          closeSet: [...closeSet, nextPosition],
          distance: distance + 1,
          position: nextPosition,
          fullPath: [...fullPath, nextPosition],
        }),
      ];
    }
    return [] as PathfinderReturn[];
  };

const pathfinder: Pathfinder = ({
  labyrinthe,
  closeSet,
  fullPath,
  distance = 0,
  position,
}) => {
  const case_ = labyrinthe.getCase(position);

  if (case_.isTarget() === true) {
    if (shortestPath === undefined || distance < shortestPath)
      shortestPath = distance;

    return [{ pathLength: distance, fullPath }] as PathfinderReturn[];
  }

  if (shortestPath !== undefined && distance >= shortestPath)
    return [] as PathfinderReturn[];

  const calcTop = calcDirection({
    closeSet,
    caseDirection: case_.top(),
    nextPosition: {
      x: position.x - 1,
      y: position.y,
    },
    labyrinthe,
    distance,
    fullPath: [...fullPath],
  });

  const calcRight = calcDirection({
    closeSet,
    caseDirection: case_.right(),
    nextPosition: {
      x: position.x,
      y: position.y + 1,
    },
    labyrinthe,
    distance,
    fullPath: [...fullPath],
  });

  const calcBottom = calcDirection({
    closeSet,
    caseDirection: case_.bottom(),
    nextPosition: {
      x: position.x + 1,
      y: position.y,
    },
    labyrinthe,
    distance,
    fullPath: [...fullPath],
  });

  const calcLeft = calcDirection({
    closeSet,
    caseDirection: case_.left(),
    nextPosition: {
      x: position.x,
      y: position.y - 1,
    },
    labyrinthe,
    distance,
    fullPath: [...fullPath],
  });

  return [...calcTop(), ...calcRight(), ...calcBottom(), ...calcLeft()];
};

const context = (labyrinthe: Labyrinthe) => {
  const start: Coord = { x: 0, y: 0 };

  const paths = pathfinder({
    labyrinthe,
    closeSet: [start],
    distance: 0,
    position: start,
    fullPath: [],
  });
};

const mazeMap = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const initLabyrinthe = (mazeMap: number[][], target: Coord): Labyrinthe => {
  const getCase = (position: Coord) => {
    const top = () => {
      if (position.x === 0) return false;

      return mazeMap[position.x - 1][position.y] === 0;
    };
    const right = () => {
      if (position.y === mazeMap[0].length - 1) return false;

      return mazeMap[position.x][position.y + 1] === 0;
    };
    const left = () => {
      if (position.y === 0) return false;

      return mazeMap[position.x][position.y - 1] === 0;
    };
    const bottom = () => {
      if (position.x === mazeMap.length - 1) return false;

      return mazeMap[position.x + 1][position.y] === 0;
    };
    const isTarget = () => position.x === target.x && position.y === target.y;
    return { top, right, left, bottom, isTarget };
  };

  return { getCase };
};

const labyrinthe = initLabyrinthe(mazeMap, { x: 0, y: 7 });

const start: Coord = { x: 7, y: 0 };

const paths = pathfinder({
  labyrinthe,
  closeSet: [start],
  distance: 0,
  position: start,
  fullPath: [],
});

const nextCells = paths
  .filter((path) => path.pathLength === shortestPath)
  .map((path) => path.fullPath[0]);

console.log(JSON.stringify(nextCells));

const nextCellsStrings = nextCells.map((path) => JSON.stringify(path));

const uniqueNextCells = [...new Set(nextCellsStrings)];

console.log(
  Object.fromEntries(
    new Map(
      uniqueNextCells.map((uniqueNextCell) => [
        uniqueNextCell,
        nextCellsStrings.filter(
          (nextCellsString) => nextCellsString === uniqueNextCell
        ).length / nextCellsStrings.length,
      ])
    )
  )
);
