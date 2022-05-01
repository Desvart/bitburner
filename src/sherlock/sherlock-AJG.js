// noinspection JSMethodCanBeStatic
export class SherlockAJG {
    constructor() { }
    solveI(inputArray) {
        for (let i = inputArray.length - 1; i >= 0; i--) {
            if (inputArray[i] === 0) {
                for (let j = 0; j < i; j++) {
                    inputArray[j] = Math.max(inputArray[j] - 1, 0);
                }
                inputArray.splice(i, 1);
            }
        }
        if (inputArray[0] !== 0)
            return 1;
        else
            return 0;
    }
    solveII(inputArray) {
        /*Array Jumping Game II
        You are attempting to solve a Coding Contract. You have 3 tries remaining, after which the contract will self-destruct.
        
        
            You are given the following array of integers:
        
            3,4,1,2,1,2,3,1,5,3,3
    
        Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
        
            Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
        
            If it's impossible to reach the end, then the answer should be 0.*/
        return 'Not implemented yet';
    }
}
//# sourceMappingURL=sherlock-AJG.js.map