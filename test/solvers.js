export function solveArrayJumpingGame (inputArray) {

  for (let i = inputArray.length - 1; i >= 0; i--) {

    if (inputArray[i] === 0) {

      for (let j = 0; j < i; j++)
        inputArray[j] = Math.max(inputArray[j] - 1, 0)

      inputArray.splice(i, 1)
    }
  }

  if (inputArray[0] !== 0)
    return 1
  else
    return 0
}