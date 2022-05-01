// noinspection JSMethodCanBeStatic
export class SherlockMPSIAT {
    constructor() { }
    solve(data) {
        let triangle = data;
        let nextArray;
        let previousArray = triangle[0];
        for (let i = 1; i < triangle.length; i++) {
            nextArray = [];
            for (let j = 0; j < triangle[i].length; j++) {
                if (j === 0)
                    nextArray.push(previousArray[j] + triangle[i][j]);
                else if (j === triangle[i].length - 1)
                    nextArray.push(previousArray[j - 1] + triangle[i][j]);
                else
                    nextArray.push(Math.min(previousArray[j], previousArray[j - 1]) + triangle[i][j]);
            }
            previousArray = nextArray;
        }
        return Math.min.apply(null, nextArray);
    }
}
//# sourceMappingURL=sherlock-MPSIAT.js.map