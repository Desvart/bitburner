// noinspection JSMethodCanBeStatic
export class SherlockAST {
    constructor() { }
    solveI(data) {
        return this.solve([1, data]);
    }
    solveII(data) {
        const param1 = Math.ceil(data.length / 2);
        return this.solve([param1, data]);
    }
    solveIII(data) {
        return this.solve([2, data]);
    }
    solveIV(data) {
        return this.solve(data);
    }
    solve(data) {
        let i, j, k;
        let maxTrades = data[0];
        let stockPrices = data[1];
        // WHY?
        let tempStr = '[0';
        for (i = 0; i < stockPrices.length; i++) {
            tempStr += ',0';
        }
        tempStr += ']';
        let tempArr = '[' + tempStr;
        for (i = 0; i < maxTrades - 1; i++) {
            tempArr += ',' + tempStr;
        }
        tempArr += ']';
        let highestProfit = JSON.parse(tempArr);
        for (i = 0; i < maxTrades; i++) {
            for (j = 0; j < stockPrices.length; j++) { // Buy / Start
                for (k = j; k < stockPrices.length; k++) { // Sell / End
                    if (i > 0 && j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    }
                    else if (i > 0 && j > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    }
                    else if (i > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    }
                    else if (j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    }
                    else {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
                    }
                }
            }
        }
        return highestProfit[maxTrades - 1][stockPrices.length - 1];
    }
}
//# sourceMappingURL=sherlock-AST.js.map