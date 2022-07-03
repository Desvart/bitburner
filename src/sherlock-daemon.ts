import {INs, Log, nowStr} from '/helpers';
import {getService, ServiceName} from '/services/service';
import {Network} from '/services/network';

export const CONFIG: {
    CONTRACT_EXTENSION: string,
    LOGFILE: string,
} = {
    CONTRACT_EXTENSION: 'cct',
    LOGFILE: '/sherlock-fails.txt',
};

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const log = new Log(ns);
    const sherlock = new SherlockDaemon(ns, log);
    
    for (const contract of sherlock.retrieveContracts()) {
        const solvedContract = sherlock.solveContract(contract);
        
        if (solvedContract.solution !== 'Not implemented yet') {
            const submittedContract = sherlock.submitSolution(solvedContract);
            await sherlock.shareReward(submittedContract);
            
        } else {
            const msg = `SHERLOCK_DAEMON - Solver for contract type "${contract.type}" not yet implemented.\n
                    Contract ${contract.name} on ${contract.location}) skipped.`;
            log.warn(msg);
        }
    }
}

class SherlockDaemon {
    private readonly ns: INs;
    private readonly log: Log;
    
    constructor(ns: INs, log: Log) {
        this.ns = ns;
        this.log = log;
    }
    
    retrieveContracts(): Contract[] {
        const network = getService<Network>(this.ns, ServiceName.Network);
        let contractsList: Contract[] = [];
        
        for (const server of network) {
            const foundContractFileList = this.ns.ls(server.id, CONFIG.CONTRACT_EXTENSION);
            for (const contractFile of foundContractFileList) {
                contractsList.push(new Contract(this.ns, contractFile, server.id));
            }
        }
        return contractsList;
    }
    
    submitSolution(contract: Contract): Contract {
        contract.reward = this.ns.codingcontract.attempt(contract.solution, contract.name, contract.location,
            {returnReward: true});
        return contract;
    }
    
    async shareReward(contract) {
        if (contract.reward !== '' || contract.reward === true) {
            const msg = `SHERLOCK_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved.
                Reward: ${contract.reward}`;
            this.log.success(msg);
            
        } else {
            const errorLog = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\nType: ${contract.type}\nData: ${JSON.stringify(
                contract.data)}\nSolution:${JSON.stringify(contract.solution)}\n\n`;
            await this.ns.write(CONFIG.LOGFILE, errorLog);
            
            const msg = `SHERLOCK_DAEMON - Contract resolution failed! - ${contract.name} (${contract.type})
                @${contract.location}, solution refuse: ${contract.solution}`;
            this.log.warn(msg);
        }
    }
    
    solveContract(contract) {
        switch (contract.type) {
            case 'Algorithmic Stock Trader I': //OK
                contract.solution = new Solver_AlgorithmicStockTrader().solveI(contract.data);
                break;
            case 'Algorithmic Stock Trader II': //OK
                contract.solution = new Solver_AlgorithmicStockTrader().solveII(contract.data);
                break;
            case 'Algorithmic Stock Trader III': //OK
                contract.solution = new Solver_AlgorithmicStockTrader().solveIII(contract.data);
                break;
            case 'Algorithmic Stock Trader IV': //OK
                contract.solution = new Solver_AlgorithmicStockTrader().solveIV(contract.data);
                break;
            case 'Array Jumping Game': // fixme
                contract.solution = new Solver_ArrayJumpingGame().solveI(contract.data);
                break;
            case 'Array Jumping Game II': //OK
                contract.solution = new Solver_ArrayJumpingGame().solveII(contract.data);
                break;
            case 'Find All Valid Math Expressions': //OK
                contract.solution = new Solver_FindAllValidMathExpressions().solve(contract.data);
                break;
            case 'Find Largest Prime Factor': //OK
                contract.solution = new Solver_FindLargestPrimeFactor(this.log).solve(contract.data);
                break;
            case 'Generate IP Addresses': //OK
                contract.solution = new Solver_GenerateIPAddresses().solve(contract.data);
                break;
            case 'Merge Overlapping Intervals': //OK
                contract.solution = new Solver_MergeOverlappingIntervals().solve(contract.data);
                break;
            case 'Minimum Path Sum in a Triangle': //OK
                contract.solution = new Solver_MinimumPathSuminaTriangle().solve(contract.data);
                break;
            case 'Sanitize Parentheses in Expression': //OK
                contract.solution = new Solver_SanitizeParenthesesinExpression().solve(contract.data);
                break;
            case 'Spiralize Matrix': //OK
                contract.solution = new Solver_SpiralizeMatrix().solve(contract.data);
                break;
            case 'Subarray with Maximum Sum': //OK
                contract.solution = new Solver_SubarraywithMaximumSum().solve(contract.data);
                break;
            case 'Total Ways to Sum': //OK
                contract.solution = new Solver_TotalWaystoSum().solveI(contract.data);
                break;
            case 'Total Ways to Sum II': //OK
                contract.solution = new Solver_TotalWaystoSum().solveII(contract.data);
                break;
            case 'Unique Paths in a Grid I': //OK
                contract.solution = new Solver_UniquePathsinaGrid().solveI(contract.data);
                break;
            case 'Unique Paths in a Grid II': //OK
                contract.solution = new Solver_UniquePathsinaGrid().solveII(contract.data);
                break;
            case 'HammingCodes: Integer to Encoded Binary': //OK
                contract.solution = new Solver_HammingCodesIntegertoEncodedBinary().solve(contract.data);
                break;
            case 'HammingCodes: Encoded Binary to Integer':
                contract.solution = new Solver_HammingCodesEncodedBinarytoInteger().solve(contract.data);
                break;
            case 'Proper 2-Coloring of a Graph': //ok
                contract.solution = new Solver_Proper2ColoringofaGraph().solveII(contract.data);
                break;
            case 'Shortest Path in a Grid': //ok
                contract.solution = new Solver_ShortestPathinaGrid().solve(contract.data);
                break;
            case 'Compression I: RLE Compression': //ok
                contract.solution = new Solver_Compression().solveI(contract.data);
                break;
            case 'Compression II: LZ Decompression': //ok
                contract.solution = new Solver_Compression().solveII(contract.data);
                break;
            case 'Compression III: LZ Compression': //ok
                contract.solution = new Solver_Compression().solveIII(contract.data);
                break;
            default:
                const msg = `SHERLOCK - We have found a new type of contract: ${contract.type}.\n
                    Please update Sherlock solver accordingly.`;
                contract.solution = 'Not implemented yet';
                this.log.warn(msg);
        }
        return contract;
    }
}

export class Contract {
    name;
    location;
    type;
    data;
    solution;
    reward;
    
    constructor(ns, name, location) {
        this.name = name;
        this.location = location;
        this.type = ns.codingcontract.getContractType(name, location);
        this.data = ns.codingcontract.getData(name, location);
    }
}

class Solver_ArrayJumpingGame {
    constructor() {}
    
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
        /*  You are given an array of integers: [3,4,1,2,1,2,3,1,5,3,3]
            Each element in the array represents your MAXIMUM jump length at that position.
            This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.
            Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.
            If it's impossible to reach the end, then the answer should be 0.
        */
        const n = inputArray.length;
        let reach = 0;
        let jumps = 0;
        let lastJump = -1;
        while (reach < n - 1) {
            let jumpedFrom = -1;
            for (let i = reach; i > lastJump; i--) {
                if (i + inputArray[i] > reach) {
                    reach = i + inputArray[i];
                    jumpedFrom = i;
                }
            }
            if (jumpedFrom === -1) {
                jumps = 0;
                break;
            }
            lastJump = jumpedFrom;
            jumps++;
        }
        return jumps;
    }
}

class Solver_AlgorithmicStockTrader {
    constructor() {}
    
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
    
    private solve(data) {
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
    
}

class Solver_FindAllValidMathExpressions {
    constructor() {}
    
    solve(arrayData) {
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
                candidateExpression += operatorList[(i >> ((j - 1) * 2)) % 4] + arrayData[0].substring(j, j + 1);
                
                let rollingOperator = operatorList[(i >> ((j - 1) * 2)) % 4];
                let rollingOperand = parseInt(arrayData[0].substring(j, j + 1));
                
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
                            candidateExpression += arrayData[0].substring(j, j + 1);
                            rollingOperand = rollingOperand * 10 + parseInt(arrayData[0].substring(j, j + 1));
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
}

class Solver_FindLargestPrimeFactor {
    private readonly log: Log;
    
    constructor(log: Log) {
        this.log = log;
    }
    
    solve(bigNumber: number) {
        let primeDecomposition = [];
        let blockSize = 1000000;
        let blockFirstIndex = 2;
        let loopIdx = 0;
        let numberToDecompose = bigNumber;
        let loopSecurity = 9999;
        while (numberToDecompose !== 1 && loopSecurity-- > 0) {
            
            let loopFirstIndex = blockFirstIndex + (loopIdx * blockSize);
            let loopLastIndex = blockFirstIndex - 1 + ((loopIdx + 1) * blockSize);
            let primeList = this.segmentedEratosthenesSieve(loopFirstIndex, loopLastIndex);
            loopIdx++;
            for (let i = 0; i < primeList.length; i++) {
                if (numberToDecompose % primeList[i] === 0) {
                    primeDecomposition.push(primeList[i]);
                    numberToDecompose /= primeList[i];
                    if (numberToDecompose === 1)
                        if (this.validation(primeDecomposition, bigNumber))
                            return primeDecomposition.pop();
                        else
                            this.log.error('SHERLOCK_DAEMON - Couac !');
                    i--;
                }
            }
        }
        
        if (loopSecurity === 0) {
            this.log.error(`Loop security activated in Prime number calculation!`);
            return undefined;
        }
    }
    
    private validation(primeList, number) {
        if (Solver_FindLargestPrimeFactor.recomposePrime(primeList) === number) {
            return true;
        } else {
            this.log.error('SHERLOCK - Prime decomposition is incorrect');
        }
    }
    
    private static recomposePrime(decomposedPrime) {
        let recomposedPrime = 1;
        for (let i = 0; i < decomposedPrime.length; i++)
            recomposedPrime *= decomposedPrime[i];
        return recomposedPrime;
    }
    
    private static eratosthenesSieve(n) {
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
    
    private segmentedEratosthenesSieve(s, e) {
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
        let prime = Solver_FindLargestPrimeFactor.eratosthenesSieve(limit);
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

class Solver_GenerateIPAddresses {
    constructor() {}
    
    solve(data) {
        let ipList = [];
        
        for (let i = 1; i <= 3; i++) {
            let tmp1 = data.slice(0, i) + '.' + data.slice(i);
            
            for (let j = i + 2; j <= i + 4; j++) {
                let tmp2 = tmp1.slice(0, j) + '.' + tmp1.slice(j);
                
                for (let k = j + 2; k <= j + 4; k++) {
                    let ip = tmp2.slice(0, k) + '.' + tmp2.slice(k);
                    
                    if (this.isIpValid(ip) === true)
                        ipList.push(ip);
                }
            }
        }
        return ipList;
    }
    
    private isIpValid(ip) {
        const blocksList = ip.split('.');
        if (blocksList.length !== 4)
            return false;
        for (let block of blocksList)
            if (this.isBlockValid(block) === false)
                return false;
        return true;
    }
    
    private isBlockValid(block) {
        if (block.length > 1 && block[0] === '0')
            return false;
        return parseInt(block) <= 255;
    }
    
}

class Solver_HammingCodesIntegertoEncodedBinary {
    constructor() {}
    
    solve(data) {
        /*HammingCodes: Integer to encoded Binary
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
        function HammingSumOfParity(_lengthOfDBits) {
            // will calculate the needed amount of parityBits 'without' the "overall"-Parity (that math took me 4 Days to get it working)
            return _lengthOfDBits < 3 || _lengthOfDBits == 0 // oh and of course using ternary operators, it's a pretty neat function
                ? _lengthOfDBits == 0
                    ? 0
                    : _lengthOfDBits + 1
                : // the following math will only work, if the length is greater equal 3, otherwise it's "kind of" broken :D
                Math.ceil(Math.log2(_lengthOfDBits * 2)) <=
                Math.ceil(Math.log2(1 + _lengthOfDBits + Math.ceil(Math.log2(_lengthOfDBits))))
                    ? Math.ceil(Math.log2(_lengthOfDBits) + 1)
                    : Math.ceil(Math.log2(_lengthOfDBits));
        }
        
        const _data = data.toString(2).split(''); // first, change into binary string, then create array with 1 bit per index
        const _sumParity = HammingSumOfParity(_data.length); // get the sum of needed parity bits (for later use in encoding)
        const count = (arr, val) =>
            arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
        // function count for specific entries in the array, for later use
        
        const _build = ['x', 'x', ..._data.splice(0, 1)]; // init the "pre-build"
        for (let i = 2; i < _sumParity; i++) {
            // add new paritybits and the corresponding data bits (pre-building array)
            _build.push('x', ..._data.splice(0, Math.pow(2, i) - 1));
        }
        // now the "calculation"... get the paritybits ('x') working
        for (const index of _build.reduce(function(a, e, i) {
            if (e == 'x') a.push(i);
            return a;
        }, [])) {
            // that reduce will result in an array of index numbers where the "x" is placed
            const _tempcount = index + 1; // set the "stepsize" for the parityBit
            const _temparray = []; // temporary array to store the extracted bits
            const _tempdata = [..._build]; // only work with a copy of the _build
            while (_tempdata[index] !== undefined) {
                // as long as there are bits on the starting index, do "cut"
                const _temp = _tempdata.splice(index, _tempcount * 2); // cut stepsize*2 bits, then...
                _temparray.push(..._temp.splice(0, _tempcount)); // ... cut the result again and keep the first half
            }
            _temparray.splice(0, 1); // remove first bit, which is the parity one
            _build[index] = (count(_temparray, '1') % 2).toString(); // count with remainder of 2 and"toString" to store the parityBit
        } // parity done, now the "overall"-parity is set
        _build.unshift((count(_build, '1') % 2).toString()); // has to be done as last element
        return _build.join(''); // return the _build as string
    }
}

class Solver_HammingCodesEncodedBinarytoInteger {
    constructor() {}
    
    solve(_data) {
        //check for altered bit and decode
        const _build = _data.split(''); // ye, an array for working, again
        const _testArray = []; //for the "truthtable". if any is false, the data has an altered bit, will check for and fix it
        const _sumParity = Math.ceil(Math.log2(_data.length)); // sum of parity for later use
        const count = (arr, val) =>
            arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
        // the count.... again ;)
        
        let _overallParity = _build.splice(0, 1).join(''); // store first index, for checking in next step and fix the _build properly later on
        _testArray.push(_overallParity == (count(_build, '1') % 2).toString() ? true : false); // first check with the overall parity bit
        for (let i = 0; i < _sumParity; i++) {
            // for the rest of the remaining parity bits we also "check"
            const _tempIndex = Math.pow(2, i) - 1; // get the parityBits Index
            const _tempStep = _tempIndex + 1; // set the stepsize
            const _tempData = [..._build]; // get a "copy" of the build-data for working
            const _tempArray = []; // init empty array for "testing"
            while (_tempData[_tempIndex] != undefined) {
                // extract from the copied data until the "starting" index is undefined
                const _temp = [..._tempData.splice(_tempIndex, _tempStep * 2)]; // extract 2*stepsize
                _tempArray.push(..._temp.splice(0, _tempStep)); // and cut again for keeping first half
            }
            const _tempParity = _tempArray.shift(); // and again save the first index separated for checking with the rest of the data
            _testArray.push(_tempParity == (count(_tempArray, '1') % 2).toString() ? true : false);
            // is the _tempParity the calculated data? push answer into the 'truthtable'
        }
        let _fixIndex = 0; // init the "fixing" index and start with 0
        for (let i = 1; i < _sumParity + 1; i++) {
            // simple binary adding for every boolean in the _testArray, starting from 2nd index of it
            _fixIndex += _testArray[i] ? 0 : Math.pow(2, i) / 2;
        }
        _build.unshift(_overallParity); // now we need the "overall" parity back in it's place
        // try fix the actual encoded binary string if there is an error
        if (_fixIndex > 0 && _testArray[0] == false) {
            // if the overall is false and the sum of calculated values is greater equal 0, fix the corresponding hamming-bit
            _build[_fixIndex] = _build[_fixIndex] == '0' ? '1' : '0';
        } else if (_testArray[0] == false) {
            // otherwise, if the the overall_parity is the only wrong, fix that one
            _overallParity = _overallParity == '0' ? '1' : '0';
        } else if (_testArray[0] == true && _testArray.some((truth) => truth == false)) {
            return 0; // uhm, there's some strange going on... 2 bits are altered? How? This should not happen 👀
        }
        // oof.. halfway through... we fixed an possible altered bit, now "extract" the parity-bits from the _build
        for (let i = _sumParity; i >= 0; i--) {
            // start from the last parity down the 2nd index one
            _build.splice(Math.pow(2, i), 1);
        }
        _build.splice(0, 1); // remove the overall parity bit and we have our binary value
        return parseInt(_build.join(''), 2); // parse the integer with redux 2 and we're done!
    }
}

class Solver_MergeOverlappingIntervals {
    constructor() {}
    
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

class Solver_MinimumPathSuminaTriangle {
    constructor() {}
    
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

class Solver_SpiralizeMatrix {
    constructor() {}
    
    solve(data, accum = []) {
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(data.shift());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(this.column(data, data[0].length - 1));
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(data.pop().reverse());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        accum = accum.concat(this.column(data, 0).reverse());
        if (data.length === 0 || data[0].length === 0)
            return accum;
        
        return this.solve(data, accum);
    }
    
    private column(arr, index) {
        const res = [];
        for (let i = 0; i < arr.length; i++) {
            const elm = arr[i].splice(index, 1)[0];
            if (elm)
                res.push(elm);
        }
        return res;
    }
}

class Solver_ShortestPathinaGrid {
    constructor() {}
    
    solve(array) {
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
        const dist = array.map(arr => new Array(arr.length).fill(Infinity));
        const prev = array.map(arr => new Array(arr.length).fill(undefined));
        const path = array.map(arr => new Array(arr.length).fill(undefined));
        const queue = [];
        array.forEach((arr, i) => arr.forEach((a, j) => {
            if (a === 0) queue.push([i, j]);
        }));
        
        dist[0][0] = 0;
        const height = array.length;
        const length = array[height - 1].length;
        const target = [height - 1, length - 1];
        while (queue.length > 0) {
            let u;
            let d = Infinity;
            let idx;
            queue.forEach(([i, j], k) => {
                if (dist[i][j] < d) {
                    u = [i, j];
                    d = dist[i][j];
                    idx = k;
                }
            });
            if (JSON.stringify(u) === JSON.stringify(target)) {
                let str = '';
                let [a, b] = target;
                if (prev[a][b] || (a === 0 && b === 0)) {
                    while (prev[a][b]) {
                        str = path[a][b] + str;
                        [a, b] = prev[a][b];
                    }
                }
                return str;
            }
            queue.splice(idx, 1);
            if (u === undefined) continue;
            const [a, b] = u;
            for (const [s, i, j] of [['D', a + 1, b], ['U', a - 1, b], ['R', a, b + 1], ['L', a, b - 1]]) {
                if (i < 0 || i >= height || j < 0 || j >= length) continue; // Index over edge
                if (array[i][j] === 1) continue; // We've hit a wall;
                if (!queue.some(([k, l]) => k === i && l === j)) continue; // Vertex not in queue
                const alt = dist[a][b] + 1;
                if (alt < dist[i][j]) {
                    dist[i][j] = alt;
                    prev[i][j] = u;
                    path[i][j] = s;
                }
            }
        }
        return '';
    }
}

class Solver_SanitizeParenthesesinExpression {
    /* Remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal
    ways to validate the string, provide all of the possible results. The answer should be provided as an array of
    strings. If it is impossible to validate the string the result should be an array with only an empty string.
    The string may contain letters, not just parentheses. */
    constructor() {}
    
    solve(data: string): string[] {
        let [left, right] = this.analysisData(data);
        let result: Array<string> = [];
        this.recursiveSolutionBuilder(data, left, right, result);
        
        return result;
    }
    
    recursiveSolutionBuilder(data: string, left: number, right: number, result: Array<string>,
        pair: number = 0, index: number = 0, solution: string = ''): void {
        
        if (index === data.length) {
            if (!result.includes(solution) && left === 0 && right === 0 && pair === 0)
                result.push(solution);
            return;
        }
        
        const char = data[index];
        switch (char) {
            
            case '(':
                if (left > 0)
                    this.recursiveSolutionBuilder(data, left - 1, right, result, pair, index + 1, solution);
                
                this.recursiveSolutionBuilder(data, left, right, result, pair + 1, index + 1, solution + char);
                break;
            
            case ')':
                if (right > 0)
                    this.recursiveSolutionBuilder(data, left, right - 1, result, pair, index + 1, solution);
                if (pair > 0)
                    this.recursiveSolutionBuilder(data, left, right, result, pair - 1, index + 1, solution + char);
                break;
            
            default:
                this.recursiveSolutionBuilder(data, left, right, result, pair, index + 1, solution + char);
        }
        
    }
    
    analysisData(data: string): [number, number] {
        let left = 0;
        let right = 0;
        
        for (let i = 0; i < data.length; i++) {
            
            if (data[i] === '(')
                left++;
            
            if (data[i] === ')')
                (left > 0) ? left-- : right++;
        }
        
        return [left, right];
    }
    
}

class Solver_SubarraywithMaximumSum {
    /* Given the following integer array, find the contiguous subarray (containing at least one number) which has the
    largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.*/
    constructor() {}
    
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
    
    private regroupValuesOfSameSign(data) {
        data = data.filter(v => v !== 0);
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
    
    private trimDataOfNegativeValues(data) {
        if (data[0] <= 0)
            data.shift();
        if (data[data.length - 1] <= 0)
            data.pop();
        return data;
    }
}

class Solver_TotalWaystoSum {
    constructor() {}
    
    solveI(data) {
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
    
    solveII(data) {
        /*Total Ways to Sum II
        How many different distinct ways can the number 40 be written as a sum of integers contained in the set:
        [2,4,7,8,11,13,14,15,16,17,18]?
        You may use each integer in the set zero or more times.*/
        
        // https://www.geeksforgeeks.org/coin-change-dp-7/?ref=lbp
        const n = data[0];
        const s = data[1];
        const ways = [1];
        ways.length = n + 1;
        ways.fill(0, 1);
        for (let i = 0; i < s.length; i++) {
            for (let j = s[i]; j <= n; j++) {
                ways[j] += ways[j - s[i]];
            }
        }
        return ways[n];
    }
}

class Solver_UniquePathsinaGrid {
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

class Solver_Proper2ColoringofaGraph {
    constructor() {}
    
    solve([N, edges]) {
        //Helper function to get neighbourhood of a vertex
        function neighbourhood(vertex) {
            const adjLeft = edges.filter(([a, _]) => a == vertex).map(([_, b]) => b);
            const adjRight = edges.filter(([_, b]) => b == vertex).map(([a, _]) => a);
            return adjLeft.concat(adjRight);
        }
        
        const coloring = Array(N).fill(undefined);
        while (coloring.some((val) => val === undefined)) {
            //Color a vertex in the graph
            const initialVertex = coloring.findIndex((val) => val === undefined);
            coloring[initialVertex] = 0;
            const frontier = [initialVertex];
            
            //Propogate the coloring throughout the component containing v greedily
            while (frontier.length > 0) {
                const v = frontier.pop() || 0;
                const neighbors = neighbourhood(v);
                
                //For each vertex u adjacent to v
                for (const id in neighbors) {
                    const u = neighbors[id];
                    
                    //Set the color of u to the opposite of v's color if it is new,
                    //then add u to the frontier to continue the algorithm.
                    if (coloring[u] === undefined) {
                        if (coloring[v] === 0) coloring[u] = 1;
                        else coloring[u] = 0;
                        
                        frontier.push(u);
                    }
                    
                    //Assert u,v do not have the same color
                    else if (coloring[u] === coloring[v]) {
                        //If u,v do have the same color, no proper 2-coloring exists
                        return [];
                    }
                }
            }
        }
        
        //If this code is reached, there exists a proper 2-coloring of the input graph.
        return coloring;
    }
    
    solveII(data) {
        // Set up array to hold colors
        const coloring = Array(data[0]).fill(undefined);
        // Keep looping on undefined vertices if graph is disconnected
        while (coloring.some(e => e === undefined)) {
            // Color a vertex in the graph
            const initialVertex = coloring.findIndex(e => e === undefined);
            coloring[initialVertex] = 0;
            const frontier = [initialVertex];
            // Propagate the coloring throughout the component containing v greedily
            while (frontier.length > 0) {
                const v = frontier.pop();
                for (const u of this.neighbourhood(data, v)) {
                    if (coloring[u] === undefined) {
                        coloring[u] = coloring[v] ^ 1; // Set the color of u to the opposite of the color of v
                        frontier.push(u); // Check u next
                    }
                    // Assert that u and v do not have the same color if they are already colored
                    else if (coloring[u] === coloring[v]) return '[]';
                }
            }
        }
        return coloring;
    }
    
    neighbourhood(data, vertex) {
        const adjLeft = data[1].filter(([a, _]) => a === vertex).map(([_, b]) => b);
        const adjRight = data[1].filter(([_, b]) => b === vertex).map(([a, _]) => a);
        return adjLeft.concat(adjRight);
    }
}

class Solver_Compression {
    constructor() {}
    
    solveI(str) {
        const encoding = [];
        let count, previous, i;
        for (count = 1, previous = str[0], i = 1; i < str.length; i++) {
            if (str[i] !== previous || count === 9) {
                encoding.push(count, previous);
                count = 1;
                previous = str[i];
            } else count++;
        }
        encoding.push(count, previous);
        return encoding.join('');
    }
    
    solveII(str) {
        let decoded = '', type = 0, len, ref, pos, i = 0, j;
        while (i < str.length) {
            if (i > 0) type ^= 1;
            len = parseInt(str[i]);
            ref = parseInt(str[++i]);
            if (len === 0) continue;
            if (!isNaN(ref) && type === 1) {
                i++;
                for (j = 0; j < len; j++) decoded += decoded[decoded.length - ref];
            } else {
                pos = i;
                for (; i < len + pos; i++) decoded += str[i];
            }
        }
        return decoded;
    }
    
    solveIII(str) {
        // state [i][j] contains a backreference of offset i and length j
        let cur_state = Array.from(Array(10), _ => Array(10)), new_state, tmp_state, result;
        cur_state[0][1] = ''; // initial state is a literal of length 1
        for (let i = 1; i < str.length; i++) {
            new_state = Array.from(Array(10), _ => Array(10));
            const c = str[i];
            // handle literals
            for (let len = 1; len <= 9; len++) {
                const input = cur_state[0][len];
                if (input === undefined) continue;
                if (len < 9) this.set(new_state, 0, len + 1, input); // extend current literal
                else this.set(new_state, 0, 1, input + '9' + str.substring(i - 9, i) + '0'); // start new literal
                for (let offset = 1; offset <= Math.min(9, i); offset++) { // start new backreference
                    if (str[i - offset] === c) this.set(new_state, offset, 1, input + len + str.substring(i - len, i));
                }
            }
            // handle backreferences
            for (let offset = 1; offset <= 9; offset++) {
                for (let len = 1; len <= 9; len++) {
                    const input = cur_state[offset][len];
                    if (input === undefined) continue;
                    if (str[i - offset] === c) {
                        if (len < 9) this.set(new_state, offset, len + 1, input); // extend current backreference
                        else this.set(new_state, offset, 1, input + '9' + offset + '0'); // start new backreference
                    }
                    this.set(new_state, 0, 1, input + len + offset); // start new literal
                    // end current backreference and start new backreference
                    for (let new_offset = 1; new_offset <= Math.min(9, i); new_offset++) {
                        if (str[i - new_offset] === c) this.set(new_state, new_offset, 1, input + len + offset + '0');
                    }
                }
            }
            tmp_state = new_state;
            new_state = cur_state;
            cur_state = tmp_state;
        }
        for (let len = 1; len <= 9; len++) {
            let input = cur_state[0][len];
            if (input === undefined) continue;
            input += len + str.substring(str.length - len, str.length);
            // noinspection JSUnusedAssignment
            if (result === undefined || input.length < result.length) result = input;
        }
        for (let offset = 1; offset <= 9; offset++) {
            for (let len = 1; len <= 9; len++) {
                let input = cur_state[offset][len];
                if (input === undefined) continue;
                input += len + '' + offset;
                if (result === undefined || input.length < result.length) result = input;
            }
        }
        return result ?? '';
    }
    
    set(state, i, j, str) {
        if (state[i][j] === undefined || str.length < state[i][j].length) state[i][j] = str;
    }
}