import {solveArrayJumpingGame} from './solvers.js';

test('Happy path', () => {
  const data = [5, 3, 5, 2, 1];
  const solution = solveArrayJumpingGame(data);
  expect(solution).toBe(1);
})

test('Failed case', () => {
  const data = [4,2,1,1,8];
  const solution = solveArrayJumpingGame(data);
  expect(solution).toBe(1);
})