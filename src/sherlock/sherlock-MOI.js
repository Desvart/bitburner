// noinspection JSMethodCanBeStatic
export class SherlockMOI {
    constructor() { }
    solve(input) {
        // Sort the array based on the first element of each array to reduce number of passes
        input = input.sort((a, b) => a[0] - b[0]);
        for (let i = 0; i < input.length; i++) {
            for (let j = i + 1; j < input.length; j++) {
                // If the segment intersects (aka the first element of one of the segment is in between the other segment)
                if ((input[i][0] >= input[j][0] && input[i][0] <= input[j][1]) ||
                    (input[j][0] >= input[i][0] && input[j][0] <= input[i][1])) {
                    input[i][0] = Math.min(input[i][0], input[j][0]);
                    input[i][1] = Math.max(input[i][1], input[j][1]);
                    input.splice(j, 1);
                    j--;
                }
            }
        }
        return input;
    }
}
//# sourceMappingURL=sherlock-MOI.js.map