// noinspection JSMethodCanBeStatic
import {Log} from '/resources/helpers';

export class FLPF {
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
        if (FLPF.recomposePrime(primeList) === number) {
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
        let prime = FLPF.eratosthenesSieve(limit);
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