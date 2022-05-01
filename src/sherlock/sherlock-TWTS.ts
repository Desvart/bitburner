// noinspection JSMethodCanBeStatic
export class SherlockTWTS {
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
        You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
        
        
        How many different distinct ways can the number 40 be written as a sum of integers contained in the set:
        
        [2,4,7,8,11,13,14,15,16,17,18]?
        
        You may use each integer in the set zero or more times.*/
        return 'Not implemented yet';
    }
}