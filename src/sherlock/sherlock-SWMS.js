// noinspection JSMethodCanBeStatic
export class SherlockSWMS {
    constructor() { }
    solve(data) {
        data = this.regroupValuesOfSameSign(data);
        data = this.trimDataOfNegativeValues(data);
        let max = Math.min(...data);
        for (let i = 0; i < data.length; i++) {
            if (data[i] <= 0) {
                continue;
            }
            for (let j = i; j < data.length; j++) {
                if (data[j] <= 0) {
                    continue;
                }
                let cut = data.slice(i, j + 1);
                let sum = cut.reduce((prev, curr) => prev + curr, 0);
                max = Math.max(max, sum);
            }
        }
        return max;
    }
    regroupValuesOfSameSign(data) {
        let reducedData = [];
        let tmp = data[0];
        for (let i = 1; i < data.length; i++) {
            if (data[i - 1] * data[i] >= 0) {
                tmp += data[i];
            }
            else {
                reducedData.push(tmp);
                tmp = data[i];
            }
        }
        reducedData.push(tmp);
        return reducedData;
    }
    trimDataOfNegativeValues(data) {
        if (data[0] <= 0)
            data.shift();
        if (data[data.length - 1] <= 0)
            data.pop();
        return data;
    }
}
//# sourceMappingURL=sherlock-SWMS.js.map