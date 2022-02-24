import {Log} from '/helpers/helper.js';


export async function main(ns) {

    ns.tail();
    ns.disableLog("ALL");
    ns.clearLog();

    const data = '((a)()((';

    const sh = new Sherlock(ns);
    const solution = sh.solveSanitizeParenthesesInExpression(data);
    ns.print(solution);

    
}

export class Sherlock {
    
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
    }

    solve(contract) {

        switch(contract.type) {
            case "Algorithmic Stock Trader I":          contract.solution = this.solveAlgorithmicStockTrader([1, contract.data]); break;
            case "Algorithmic Stock Trader II":         contract.solution = this.solveAlgorithmicStockTrader([Math.ceil(contract.data.length / 2), contract.data]); break;
            case "Algorithmic Stock Trader III":        contract.solution = this.solveAlgorithmicStockTrader([2, contract.data]); break;
            case "Algorithmic Stock Trader IV":         contract.solution = this.solveAlgorithmicStockTrader(contract.data); break;
            case "Array Jumping Game":                  contract.solution = this.solveArrayJumingGame(contract.data); break;
            case "Find All Valid Math Expressions":     contract.solution = this.solveFindAllValidMathExpressions(contract.data); break;
            case "Find Largest Prime Factor":           contract.solution = this.solveFindLargestPrimeFactor(contract.data); break;
            case "Generate IP Addresses":               contract.solution = this.solveGenerateIPAddresses(contract.data); break;
            case "Merge Overlapping Intervals":         contract.solution = this.solveMergeOverlappingIntervals(contract.data); break;
            case "Minimum Path Sum in a Triangle":      contract.solution = this.solveMinimumPathSumInATriangle(contract.data); break;
            case "Sanitize Parentheses in Expression":  contract.solution = this.solveSanitizeParenthesesInExpression(contract.data); break;
            case "Spiralize Matrix":                    contract.solution = this.solveSpiralizeMatrix(contract.data); break;
            case "Subarray with Maximum Sum":           contract.solution = this.solveSubarrayWithMaximumSum(contract.data); break;
            case "Total Ways to Sum":                   contract.solution = this.solveTotalWayToSum(contract.data); break;
            case "Unique Paths in a Grid I":            contract.solution = this.solveUniquePathsInAGridI(contract.data); break;
            case "Unique Paths in a Grid II":           contract.solution = this.solveUniquePathsInAGridII(contract.data); break;
            default:
                let message = `SHERLOCK - We have found a new type of contract: ${contract.type}.\nPlease update Sherlock solver accordingly.`;
                Log.warn(this.#ns, message);
                this.#ns.toast(message, "warning", null);
        }  

        return contract;

    }


    solveAlgorithmicStockTrader(data) {
        let i, j, k;

        let maxTrades = data[0];
        let stockPrices = data[1];

        // WHY?
        let tempStr = "[0";
        for (i = 0; i < stockPrices.length; i++) {
            tempStr += ",0";
        }
        tempStr += "]";
        let tempArr = "[" + tempStr;
        for (i = 0; i < maxTrades - 1; i++) {
            tempArr += "," + tempStr;
        }
        tempArr += "]";

        let highestProfit = JSON.parse(tempArr);

        for (i = 0; i < maxTrades; i++) {
            for (j = 0; j < stockPrices.length; j++) { // Buy / Start
                for (k = j; k < stockPrices.length; k++) { // Sell / End
                    if (i > 0 && j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    } else if (i > 0 && j > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    } else if (i > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    } else if (j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    } else {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
                    }
                }
            }
        }
        return highestProfit[maxTrades - 1][stockPrices.length - 1];
    }


    solveArrayJumingGame(inputArray) {

        for (let i = inputArray.length - 1; i >= 0; i--) {

            if (inputArray[i] === 0) {   

                for (let j = 0; j < i; j++)
                    inputArray[j] = Math.max(inputArray[j] - 1, 0);

                inputArray.splice(i, 1);
            }
        }

        if (inputArray[0] !== 0) 
            return 1;
        else
            return 0;
    }


    solveFindAllValidMathExpressions(arrayData) {
        let i, j;
    
        let operatorList = ["", "+", "-", "*"];
        let validExpressions = [];
    
        let tempPermutations = Math.pow(4, (arrayData[0].length - 1));
    
        for (i = 0; i < tempPermutations; i++) {
    
            if (!Boolean(i % 100000)) {
                //await this.#ns.sleep(100);
            }
    
            let arraySummands = [];
            let candidateExpression = arrayData[0].substr(0, 1);
            arraySummands[0] = parseInt(arrayData[0].substr(0, 1));
    
            for (j = 1; j < arrayData[0].length; j++) {
                candidateExpression += operatorList[(i >> ((j - 1) * 2)) % 4] + arrayData[0].substr(j, 1);
    
                let rollingOperator = operatorList[(i >> ((j - 1) * 2)) % 4];
                let rollingOperand = parseInt(arrayData[0].substr(j, 1));
    
                switch (rollingOperator) {
                    case "":
                        rollingOperand = rollingOperand * (arraySummands[arraySummands.length - 1] / Math.abs(arraySummands[arraySummands.length - 1]));
                        arraySummands[arraySummands.length - 1] = arraySummands[arraySummands.length - 1] * 10 + rollingOperand;
                        break;
                    case "+":
                        arraySummands[arraySummands.length] = rollingOperand;
                        break;
                    case "-":
                        arraySummands[arraySummands.length] = 0 - rollingOperand;
                        break;
                    case "*":
                        while (j < arrayData[0].length - 1 && ((i >> (j * 2)) % 4) === 0) {
                            j += 1;
                            candidateExpression += arrayData[0].substr(j, 1);
                            rollingOperand = rollingOperand * 10 + parseInt(arrayData[0].substr(j, 1));
                        }
                        arraySummands[arraySummands.length - 1] = arraySummands[arraySummands.length - 1] * rollingOperand;
                        break;
                }
            }
    
            let rollingTotal = arraySummands.reduce(function(a, b) { return a + b; });
    
            //if(arrayData[1] == eval(candidateExpression)){
            if (arrayData[1] === rollingTotal) {
                validExpressions[validExpressions.length] = candidateExpression;
            }
        }

        return JSON.stringify(validExpressions);
    }


    solveFindLargestPrimeFactor(bigNumber) {
        
        let primeDecomposition = [];
        let blockSize = 1000000;
        let blockFirstIndex = 2;
        let loopIdx = 0;
        let numberToDecompose = bigNumber;
        let loopSecurity = 9999;
        while(numberToDecompose !== 1 && loopSecurity-- > 0) {

            let loopFirstIndex = blockFirstIndex + (loopIdx * blockSize);
            let loopLastIndex = blockFirstIndex - 1 + ((loopIdx + 1 ) * blockSize);
            let primeList = segmentedEratosthenesSieve(loopFirstIndex, loopLastIndex);
            loopIdx++;
            for(let i = 0; i < primeList.length ; i++) {
                if(numberToDecompose % primeList[i] === 0) {
                    primeDecomposition.push(primeList[i]);
                    numberToDecompose /= primeList[i];
                    if(numberToDecompose === 1)
                        if(validation(this.#ns, primeDecomposition, bigNumber))
                            return primeDecomposition.pop();
                        else
                            Log.error(this.#ns, "SHERLOCK - Couac !");
                    i--;
                }
            }
        }

        if (loopSecurity === 0) {
            Log.error(`Loop security activated in Prime number calculation!`)
            this.#ns.exit();
        }


        function validation(ns, primeList, number) {
            if(recomposePrime(primeList) === number) {
                return true;
            }
            else {
                Log.error(ns, "SHERLOCK - Prime decomposition is incorrect");
                ns.toast(`SHERLOCK - Prime decomposition is incorrect ${recomposePrime(primeList)} !== ${number}`, "error", null);
                return false;
            }
        }


        function recomposePrime(decomposedPrime) {
            let recomposedPrime = 1;
            for(let i = 0; i < decomposedPrime.length; i++)
                recomposedPrime *= decomposedPrime[i];

            return recomposedPrime;
        }


        function eratosthenesSieve(n) {
            let prime = [];
            let mark = Array(n + 1).fill(true);
            mark[0] = mark[1] = false;

            for(let i = 2; i <= n; i++)
                if(mark[i] === true) {
                    prime.push(i);
                    for(let j = i * i; j <= n; j += i)
                        mark[j] = false;
                }

            return prime;
        }


        function segmentedEratosthenesSieve(s, e) {
            let primeList = [];
            //if (s < 0 || e < 2)
                //debug(this.#ns, `\n Prime number in range of (${s}, ${e})`);

            // The last possible prime number is below the square root of the number we fixed
            let limit = Math.floor(Math.sqrt(e)) + 1;

            // Starting value
            let low = s;
            let high = limit + s;
            let value = 0;

            // Container which is used to detect (√e) prime element
            let mark = Array(limit + 1).fill(false);

            // Find first (√e) prime number
            let prime = eratosthenesSieve(limit);
            for (let i = 0; i < prime.length; i++)
                if (prime[i] >= s) {
                    primeList.push(prime[i]);
                    //ns.print("  " + prime[i]);
                }

            // This loop displays the remaining prime number between (√e .. e)
            while(low < e) {

                // Set next (√e) prime number is valid
                for(let i = 0; i <= limit; i++)
                    mark[i] = true;

                // When next prime pair are greater than e, set high value to e
                if (high >= e)
                    high = e;

                for (let i = 0; i < prime.length; i++) {

                    value = Math.floor(low / prime[i]) * prime[i];
                    if (value < low)
                        value += prime[i]; // Add current prime value

                    for (let j = value; j < high; j += prime[i])
                        mark[j - low] = false; // Set multiple is non prime
                }

                // Store the prime elements
                for (let i = low; i < high; i++)
                    if (mark[i - low] === true) {
                        primeList.push(i);
                        //ns.print("  " + i);
                    }

                // Update of all multiple of value is non-prime
                high += limit;
                low  += limit;
            }

            return primeList;
        }
    }
    

    solveGenerateIPAddresses(data) {

        let ipList = [];

        for (let i = 1; i <= 3 ; i++) {
            let tmp1 = data.slice(0, i) + '.' + data.slice(i);

            for (let j = i + 2; j <= i + 4 ; j++) {
                let tmp2 = tmp1.slice(0, j) + '.' + tmp1.slice(j);

                for (let k = j + 2; k <= j + 4 ; k++) {
                    let ip = tmp2.slice(0, k) + '.' + tmp2.slice(k);

                    if (isIpValid(ip) === true)
                        ipList.push(ip);
                }
            }
        }

        return ipList;


        function isIpValid(ip) {
            const blocksList = ip.split('.');

            if (blocksList.length !== 4)
                return false;

            for (let block of blocksList)
                if(isBlockValid(block) === false)
                    return false;

            return true;
        }


        function isBlockValid(block) {

            if (block.length > 1 && block[0] === '0')
                return false;

            if (parseInt(block) > 255)
                return false;

            return true;
        }
    }


    solveMergeOverlappingIntervals(input) {

        // Sort the array based on the first element of each array to reduce number of passes
        input = input.sort((a, b) => a[0]-b[0]);

        for(let i = 0; i < input.length; i++) {
            for(let j = i+1; j < input.length; j++) {

                // If the segment intersects (aka the first element of one of the segment is in between the other segment)
                if((input[i][0] >= input[j][0] && input[i][0] <= input[j][1]) || (input[j][0] >= input[i][0] && input[j][0] <= input[i][1])) {
                    input[i][0] = Math.min(input[i][0], input[j][0]);
                    input[i][1] = Math.max(input[i][1], input[j][1]);
                    input.splice(j, 1);
                    j--;
                }
            }
        }
        return input;
    }


    solveMinimumPathSumInATriangle(data) {
        let triangle = data;
        let nextArray;
        let previousArray = triangle[0];
    
        for (let i = 1; i < triangle.length; i++) {
            nextArray = [];
            for (let j = 0; j < triangle[i].length; j++) {
                if (j == 0)
                    nextArray.push(previousArray[j] + triangle[i][j]);
                else if (j == triangle[i].length - 1)
                    nextArray.push(previousArray[j - 1] + triangle[i][j]);
                else
                    nextArray.push(Math.min(previousArray[j], previousArray[j - 1]) + triangle[i][j]);
            }
            previousArray = nextArray;
        }

        return Math.min.apply(null, nextArray);
    }


    solveSanitizeParenthesesInExpression(data) {

        data = trim(data);
        let [n, char] = charToRemove(data);

        if (n === 0 && isValidExpression(data))
            return [data];

        let currSolutions = [data];
        for (let i = 0; i < n; i ++) {

            let newSolutions = [];
            for (let solution of currSolutions) {
                let partialSolution = removeOneParenthesis(solution, char);
                newSolutions = newSolutions.concat(partialSolution);
                newSolutions = [...new Set(newSolutions)]; // remove duplicates
            }
            
            currSolutions = newSolutions;
        }

        let solutions = currSolutions.filter(x => isValidExpression(x));

        return solutions;


        function trim(data) {

            let padStart = '';
            for (let i = 0; i < data.length; i++) {
                if (data[i] !== '(' && data[i] !== ')')
                    padStart += data[i];
                else {
                    data = data.slice(i);
                    break;
                }
            }

            let padStop = '';
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i] !== '(' && data[i] !== ')')
                    padStop = data[i] + padStop;
                else {
                    data = data.slice(0, i + 1);
                    break;
                }
            }

            for (let i = 0; i < data.length; i++)
                if (data[i] !== ')') {
                    data = data.slice(i);
                    console.log('1 ' + data);
                    break;
                }

            for (let i = data.length - 1; i >= 0; i--)
                if (data[i] !== '(') {
                    data = data.slice(0, i + 1);
                    console.log('2 ' + data);
                    break;
                }

            if (data.length <= 1) {
                data = '';
            }

            return padStart + data + padStop;
        }


        function charToRemove(data) {

            let open        = data.match(/\(/g || []).length;
            let close       = data.match(/\)/g || []).length;
            let removeCount = close - open;

            let char = '';
            if (removeCount > 0)
                char = ')';
            if (removeCount < 0)
                char = '(';

            return [Math.abs(removeCount), char];
        }


        function removeOneParenthesis(data, char) {
            let solutions = [];
            let oneSolution = '';
            for (let i = 0; i < data.length; i++) {
                if (data[i] === char) {
                    oneSolution = data.slice(0, i) + data.slice(i+1);
                    if (solutions.includes(oneSolution) === false)
                        solutions.push(oneSolution);
                }
            }
            return solutions;
        }


        function isValidExpression(data) {

            let open = 0;
            
            for (let i = 0; i < data.length; i++) {

                if (data[i] === '(')
                    open++;

                if (data[i] === ')')
                    if (open > 0)
                        open--;
                    else
                        return false;
            }

            if (open === 0)
                return true;
            else
                return false;

        }
    }


    solveSpiralizeMatrix(data, accum = []) {
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(data.shift());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(column(data, data[0].length - 1));
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(data.pop().reverse());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(column(data, 0).reverse());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        return this.solveSpiralizeMatrix(data, accum);


        function column(arr, index) {
            const res = [];
            for (let i = 0; i < arr.length; i++) {
                const elm = arr[i].splice(index, 1)[0];
                if (elm)
                    res.push(elm);
            }
            return res;
        }
    }


    solveSubarrayWithMaximumSum(data) {

        data = regroupValuesOfSameSign(data);
        data = trimDataOfNegativeValues(data);

        let max = Math.min(...data);
        for (let i = 0; i < data.length; i++) {

            if (data[i] <= 0)
                continue;

            for (let j = i; j < data.length; j++) {

                if (data[j] <= 0)
                    continue;

                let cut = data.slice(i, j + 1)
                let sum = cut.reduce((prev, curr) => prev + curr, 0);
                max = Math.max(max, sum);
            }
        }

        return max;


        function regroupValuesOfSameSign(data) {
            
            let reducedData = [];
            let tmp = data[0];

            for (let i = 1; i < data.length; i++) {

                if (data[i - 1] * data[i] >= 0) {
                    tmp += data[i];
                } else {
                    reducedData.push(tmp);
                    tmp = data[i];
                }
            }
            reducedData.push(tmp);

            return reducedData;
        }


        function trimDataOfNegativeValues(data) {
            if (data[0] <= 0)
                data.shift();

            if (data[data.length - 1] <= 0)
                data.pop();

            return data
        }
    }


    solveTotalWayToSum(data) {

        let cache = {};
        return twts(data, data, cache) - 1;


        function twts(limit, n, cache) {

            if (n < 1)
                return 1;

            if (limit === 1)
                return 1;

            if (n < limit)
                return twts(n, n, cache);

            if (n in cache) {
                let c = cache[n];
                if (limit in c)
                    return c[limit];
            }

            let s = 0;
            for (let i = 1; i <= limit; i++)
                s += twts(i, n - i, cache);

            if (!(n in cache))
                cache[n] = {};

            cache[n][limit] = s;
            return s;
        }
    }


    solveUniquePathsInAGridI(data) {
        const rightMoves = data[0] - 1;
        const downMoves = data[1] - 1;

        return Math.round(this.#factorialDivision(rightMoves + downMoves, rightMoves) / (this.#factorial(downMoves)));
    }

    #factorial(n) {
        return this.#factorialDivision(n, 1);
    }

    #factorialDivision(n, d) {
        if (n == 0 || n == 1 || n == d)
            return 1;
        return this.#factorialDivision(n - 1, d) * n;
    }

    solveUniquePathsInAGridII(data, ignoreFirst = false, ignoreLast = false) {
        const rightMoves = data[0].length - 1;
        const downMoves = data.length - 1;

        let totalPossiblePaths = Math.round(this.#factorialDivision(rightMoves + downMoves, rightMoves) / (this.#factorial(downMoves)));

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {

                if (data[i][j] == 1 && (!ignoreFirst || (i != 0 || j != 0)) && (!ignoreLast || (i != data.length - 1 || j != data[i].length - 1))) {
                    const newArray = [];
                    for (let k = i; k < data.length; k++)
                        newArray.push(data[k].slice(j, data[i].length));

                    let removedPaths = this.solveUniquePathsInAGridII(newArray, true, ignoreLast);
                    removedPaths *= this.solveUniquePathsInAGridI([i + 1, j + 1]);

                    totalPossiblePaths -= removedPaths;
                }
            }
        }
        return totalPossiblePaths;
    }

}