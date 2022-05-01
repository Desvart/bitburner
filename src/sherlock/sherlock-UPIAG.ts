// noinspection JSMethodCanBeStatic
export class UPIAGI {
    constructor() {}
    
    solveI(data) {
        const rightMoves = data[0] - 1;
        const downMoves = data[1] - 1;
        const rightPlusDown = rightMoves + downMoves;
        return Math.round(this.factorialDivision(rightPlusDown, rightMoves) / (this.factorial(downMoves)));
    }
    
    solveII(data, ignoreFirst = false, ignoreLast = false) {
        const rightMoves = data[0].length - 1;
        const downMoves = data.length - 1;
        
        let totalPossiblePaths = Math.round(
            this.factorialDivision(rightMoves + downMoves, rightMoves) / (this.factorial(downMoves)));
        
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                
                if (data[i][j] === 1 && (!ignoreFirst || (i !== 0 || j !== 0)) &&
                    (!ignoreLast || (i !== data.length - 1 || j !== data[i].length - 1))) {
                    const newArray = [];
                    for (let k = i; k < data.length; k++)
                        newArray.push(data[k].slice(j, data[i].length));
                    
                    let removedPaths = this.solveII(newArray, true, ignoreLast);
                    removedPaths *= this.solveI([i + 1, j + 1]);
                    
                    totalPossiblePaths -= removedPaths;
                }
            }
        }
        return totalPossiblePaths;
    }
    
    private factorial(n) {
        return this.factorialDivision(n, 1);
    }
    
    private factorialDivision(n, d) {
        if (n === 0 || n === 1 || n === d)
            return 1;
        return this.factorialDivision(n - 1, d) * n;
    }
}