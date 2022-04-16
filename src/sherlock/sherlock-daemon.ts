import {LogNsAdapter, nowStr} from '/resources/helpers';
import {SHERLOCK_CONFIG} from '/sherlock/sherlock-config';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    //FIXME - Sanitize Parentheses in Expression - ()((())()))(()
    //FIXME - Sanitize Parentheses in Expression - (a(())(a)))(((()
    //FIXME - Sanitize Parentheses in Expression - ())()a(aa((a
    //FIXME - Array Jumping Game - [5,2,1,1,5,5]
    //FIXME - Array Jumping Game - [4,2,1,1,8]
    //FIXME - Array Jumping Game - [1,3,2,6,3,1,5,2]
    
    const nsA = new SherlockAdapters(ns);
    const logA = new LogNsAdapter(ns);
    const sherlock = new SherlockDaemon(nsA, logA);
    
    //noinspection InfiniteLoopJS
    while (true) {
        const contracts = sherlock.retrieveContracts();
        for (const contract of contracts) {
            const solvedContract = sherlock.solveContract(contract);
    
            if (solvedContract.solution !== 'Not implemented yet') {
                const submittedContract = sherlock.submitSolution(solvedContract);
                await sherlock.shareReward(submittedContract);
        
            } else {
                const msg = `SHERLOCK_DAEMON - Solver for contract type "${contract.type}" not yet implemented.\n
                    Contract ${contract.name} on ${contract.location}) skipped.`;
                logA.warn(msg);
            }
        }
        await nsA.sleep(5 * 60 * 1000);
    }
}

class SherlockDaemon {
    private readonly nsA: SherlockAdapters;
    private readonly logA: LogNsAdapter;
    
    constructor(nsA: SherlockAdapters, logA: LogNsAdapter) {
        this.nsA = nsA;
        this.logA = logA;
    }
    
    retrieveContracts(): Contract[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let infiniteLoopProtection= 999;
        let contractsList: Contract[] = [];
        
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
            
            const foundContractFileList = this.nsA.ls(nodeName, SHERLOCK_CONFIG.CONTRACT_EXTENSION);
            for (const contractFile of foundContractFileList) {
                contractsList.push(new Contract(this.nsA, contractFile, nodeName));
            }
        }
        return contractsList;
    }
    
    submitSolution(contract: Contract): Contract {
        contract.reward = this.nsA.submitSolution(contract);
        return contract;
    }
    
    async shareReward(contract) {
        if (contract.reward !== '' || contract.reward === true) {
            const msg = `SHERLOCK_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved.
                Reward: ${contract.reward}`;
            this.logA.success(msg);
            
        } else {
            const errorLog = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\n
                Type: ${contract.type}\nData: ${JSON.stringify(contract.data)}\n\n`;
            await this.nsA.write(SHERLOCK_CONFIG.LOGFILE, errorLog);
            
            const msg = `SHERLOCK_DAEMON - Contract resolution failed! - ${contract.name} (${contract.type})
                @${contract.location}`;
            this.logA.warn(msg);
        }
    }
    
    solveContract(contract) {
        switch (contract.type) {
            case 'Algorithmic Stock Trader I':
                contract.solution = this.solveAlgorithmicStockTrader([1, contract.data]);
                break;
            case 'Algorithmic Stock Trader II':
                const param1 = Math.ceil(contract.data.length / 2);
                contract.solution = this.solveAlgorithmicStockTrader([param1, contract.data]);
                break;
            case 'Algorithmic Stock Trader III':
                contract.solution = this.solveAlgorithmicStockTrader([2, contract.data]);
                break;
            case 'Algorithmic Stock Trader IV':
                contract.solution = this.solveAlgorithmicStockTrader(contract.data);
                break;
            case 'Array Jumping Game':
                contract.solution = this.solveArrayJumpingGame(contract.data);
                break;
            case 'Find All Valid Math Expressions':
                contract.solution = this.solveFindAllValidMathExpressions(contract.data);
                break;
            case 'Find Largest Prime Factor':
                contract.solution = this.solveFindLargestPrimeFactor(contract.data);
                break;
            case 'Generate IP Addresses':
                contract.solution = this.solveGenerateIPAddresses(contract.data);
                break;
            case 'Merge Overlapping Intervals':
                contract.solution = this.solveMergeOverlappingIntervals(contract.data);
                break;
            case 'Minimum Path Sum in a Triangle':
                contract.solution = this.solveMinimumPathSumInATriangle(contract.data);
                break;
            case 'Sanitize Parentheses in Expression':
                contract.solution = this.solveSanitizeParenthesesInExpression(contract.data);
                break;
            case 'Spiralize Matrix':
                contract.solution = this.solveSpiralizeMatrix(contract.data);
                break;
            case 'Subarray with Maximum Sum':
                contract.solution = this.solveSubarrayWithMaximumSum(contract.data);
                break;
            case 'Total Ways to Sum':
                contract.solution = this.solveTotalWayToSum(contract.data);
                break;
            case 'Unique Paths in a Grid I':
                contract.solution = this.solveUniquePathsInAGridI(contract.data);
                break;
            case 'Unique Paths in a Grid II':
                contract.solution = this.solveUniquePathsInAGridII(contract.data);
                break;
            case 'HammingCodes: Integer to encoded Binary':
                contract.solution = this.solveHammingCodesIntegerToEncodedBinary(contract.data);
                break;
            case 'Shortest Path in a Grid':
                contract.solution = this.solveShortestPathinAGrid(contract.data);
                break;
            default:
                const msg = `SHERLOCK - We have found a new type of contract: ${contract.type}.\n
                    Please update Sherlock solver accordingly.`;
                contract.solution = 'Not implemented yet';
                this.logA.warn(msg);
        }
        return contract;
    }
    
    solveAlgorithmicStockTrader(data) {
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
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k],
                            highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    } else if (i > 0 && j > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k],
                            highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    } else if (i > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k],
                            highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    } else if (j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1],
                            stockPrices[k] - stockPrices[j]);
                    } else {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
                    }
                }
            }
        }
        return highestProfit[maxTrades - 1][stockPrices.length - 1];
    }
    
    solveArrayJumpingGame(inputArray) {
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
    
    solveFindAllValidMathExpressions(arrayData) {
        let i, j;
        
        let operatorList = ['', '+', '-', '*'];
        let validExpressions = [];
        
        let tempPermutations = Math.pow(4, (arrayData[0].length - 1));
        
        for (i = 0; i < tempPermutations; i++) {
            
            if (!Boolean(i % 100000)) {
                //await this.#ns.sleep(100);
            }
            
            let arraySummands = [];
            let candidateExpression = arrayData[0].substring(0, 1);
            arraySummands[0] = parseInt(arrayData[0].substring(0, 1));
            
            for (j = 1; j < arrayData[0].length; j++) {
                candidateExpression += operatorList[(i >> ((j - 1) * 2)) % 4] + arrayData[0].substring(j, j+1);
                
                let rollingOperator = operatorList[(i >> ((j - 1) * 2)) % 4];
                let rollingOperand = parseInt(arrayData[0].substring(j, j+1));
                
                switch (rollingOperator) {
                    case '':
                        rollingOperand = rollingOperand * (arraySummands[arraySummands.length - 1] /
                            Math.abs(arraySummands[arraySummands.length - 1]));
                        arraySummands[arraySummands.length - 1] = arraySummands[arraySummands.length - 1] * 10 +
                            rollingOperand;
                        break;
                    case '+':
                        arraySummands[arraySummands.length] = rollingOperand;
                        break;
                    case '-':
                        arraySummands[arraySummands.length] = 0 - rollingOperand;
                        break;
                    case '*':
                        while (j < arrayData[0].length - 1 && ((i >> (j * 2)) % 4) === 0) {
                            j += 1;
                            candidateExpression += arrayData[0].substring(j, j+1);
                            rollingOperand = rollingOperand * 10 + parseInt(arrayData[0].substring(j, j+1));
                        }
                        arraySummands[arraySummands.length - 1] = arraySummands[arraySummands.length - 1] *
                            rollingOperand;
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
        while (numberToDecompose !== 1 && loopSecurity-- > 0) {
            
            let loopFirstIndex = blockFirstIndex + (loopIdx * blockSize);
            let loopLastIndex = blockFirstIndex - 1 + ((loopIdx + 1) * blockSize);
            let primeList = segmentedEratosthenesSieve(loopFirstIndex, loopLastIndex);
            loopIdx++;
            for (let i = 0; i < primeList.length; i++) {
                if (numberToDecompose % primeList[i] === 0) {
                    primeDecomposition.push(primeList[i]);
                    numberToDecompose /= primeList[i];
                    if (numberToDecompose === 1)
                        if (validation(this.nsA, primeDecomposition, bigNumber))
                            return primeDecomposition.pop();
                        else
                            this.logA.error('SHERLOCK_DAEMON - Couac !');
                    i--;
                }
            }
        }
        
        if (loopSecurity === 0) {
            this.logA.error(`Loop security activated in Prime number calculation!`);
            this.nsA.exit();
        }
        
        function validation(logA, primeList, number) {
            if (recomposePrime(primeList) === number) {
                return true;
            } else {
                logA.error('SHERLOCK - Prime decomposition is incorrect');
            }
        }
        
        function recomposePrime(decomposedPrime) {
            let recomposedPrime = 1;
            for (let i = 0; i < decomposedPrime.length; i++)
                recomposedPrime *= decomposedPrime[i];
            return recomposedPrime;
        }
        
        function eratosthenesSieve(n) {
            let prime = [];
            let mark = Array(n + 1).fill(true);
            mark[0] = mark[1] = false;
            for (let i = 2; i <= n; i++)
                if (mark[i] === true) {
                    prime.push(i);
                    for (let j = i * i; j <= n; j += i)
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
            while (low < e) {
                
                // Set next (√e) prime number is valid
                for (let i = 0; i <= limit; i++)
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
                low += limit;
            }
            
            return primeList;
        }
    }
    
    solveGenerateIPAddresses(data) {
        
        let ipList = [];
        
        for (let i = 1; i <= 3; i++) {
            let tmp1 = data.slice(0, i) + '.' + data.slice(i);
            
            for (let j = i + 2; j <= i + 4; j++) {
                let tmp2 = tmp1.slice(0, j) + '.' + tmp1.slice(j);
                
                for (let k = j + 2; k <= j + 4; k++) {
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
                if (isBlockValid(block) === false)
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
    
    solveMinimumPathSumInATriangle(data) {
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
    
    solveSanitizeParenthesesInExpression(data) {
        
        data = trim(data);
        let [n, char] = charToRemove(data);
        
        if (n === 0 && isValidExpression(data))
            return [data];
        
        let currSolutions = [data];
        for (let i = 0; i < n; i++) {
            
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
            
            let open = data.match(/\(/g || []).length;
            let close = data.match(/\)/g || []).length;
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
                    oneSolution = data.slice(0, i) + data.slice(i + 1);
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
            return data;
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
        const rightPlusDown = rightMoves + downMoves;
        return Math.round(this.#factorialDivision(rightPlusDown, rightMoves) / (this.#factorial(downMoves)));
    }
    
    #factorial(n) {
        return this.#factorialDivision(n, 1);
    }
    
    #factorialDivision(n, d) {
        if (n === 0 || n === 1 || n === d)
            return 1;
        return this.#factorialDivision(n - 1, d) * n;
    }
    
    solveUniquePathsInAGridII(data, ignoreFirst = false, ignoreLast = false) {
        const rightMoves = data[0].length - 1;
        const downMoves = data.length - 1;
        
        let totalPossiblePaths = Math.round(
            this.#factorialDivision(rightMoves + downMoves, rightMoves) / (this.#factorial(downMoves)));
        
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                
                if (data[i][j] === 1 && (!ignoreFirst || (i !== 0 || j !== 0)) &&
                    (!ignoreLast || (i !== data.length - 1 || j !== data[i].length - 1))) {
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
    
    solveHammingCodesIntegerToEncodedBinary(data) {
        /*HammingCodes: Integer to encoded Binary
        You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
        
        
            You are given the following decimal Value:
            64
        Convert it into a binary string and encode it as a 'Hamming-Code'. eg:
        Value 8 will result into binary '1000', which will be encoded with the pattern 'pppdpddd', where p is a paritybit and d a databit,
            or '10101' (Value 21) will result into (pppdpdddpd) '1111101011'.
        
            NOTE: You need an parity Bit on Index 0 as an 'overall'-paritybit.
            NOTE 2: You should watch the HammingCode-video from 3Blue1Brown, which explains the 'rule' of encoding, including the first Index parity-bit mentioned on the first note.
        
            Now the only one rule for this encoding:
            It's not allowed to add additional leading '0's to the binary value
        That means, the binary value has to be encoded as it is*/
        return 'Not implemented yet';
    }
    
    solveShortestPathinAGrid(data) {
        /*Shortest Path in a Grid
        You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
        
        
        You are located in the top-left corner of the following grid:
        
          [[0,0,0,1,0,0,0,0,0,0,1],
           [1,0,0,0,1,1,0,0,1,1,0],
           [0,0,0,1,0,0,0,0,0,1,0],
           [0,1,0,0,0,0,0,1,0,0,0],
           [0,0,1,0,0,0,0,0,0,0,0],
           [0,1,1,0,0,0,0,1,0,1,0]]
        
        You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.
        
        Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path
        
        NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.
        NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
        
        Examples:
        
            [[0,1,0,0,0],
             [0,0,0,1,0]]
        
        Answer: 'DRRURRD'
        
            [[0,1],
             [1,0]]
        
        Answer: ''*/
    }
    
}

export class Contract {
    name;
    location;
    type;
    data;
    solution;
    reward;
    
    constructor(nsA, name, location) {
        this.name = name;
        this.location = location;
        this.type = nsA.getContractType(name, location);
        this.data = nsA.getContractData(name, location);
    }
}

class SherlockAdapters {
    private readonly ns;
    
    constructor(ns) {
        this.ns = ns;
    }
    
    getContractType(name: string, hostname: string): string {
        return this.ns.codingcontract.getContractType(name, hostname);
    }
    
    getContractData(name: string, hostname: string): any {
        return this.ns.codingcontract.getData(name, hostname);
    }
    
    ls(hostname: string, extension: string): string[] {
        return this.ns.ls(hostname, extension);
    }
    
    scan(hostname: string): string[] {
        return this.ns.scan(hostname);
    }
    
    submitSolution(contract: Contract): string {
    return this.ns.codingcontract.attempt(contract.solution, contract.name, contract.location, {returnReward: true});
    }
    
    async write(file: string, message: string) {
        await this.ns.write(file, message, 'a');
    }
    
    exit(): void {
        this.ns.exit();
    }
    
    async sleep(duration: number): Promise<void> {
        await this.ns.sleep(duration);
    }
}