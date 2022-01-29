/** @param {NS} ns **/
export async function main(ns) {
ns.tail();
ns.clearLog();

var a = Array.from({length:5});
ns.print(a);

var b = Array.from({length:15}).map((x, i) => i + 50);
ns.print(b);

var s = Math.floor(Math.sqrt(16));
ns.print(s);

var n = Array.from({ length: 15 }).map((x, i) => i + 2);
ns.print(n);




/*
ns.print(primes(5));
ns.print(primes(10));*/
ns.print(primes(50));
ns.print(primes2(10,50));
ns.print("...");
//ns.print(eratosthenes(50000000));

}


// Split big number in smaller chuncks [n -> n+1e6]
// Compute all prime numbers in that chunck
// Check is any of those are primes of the initial number




function primes(num) {
	
	let arr = Array.from({ length: num - 1 }).map((x, i) => i + 2);
	
	let sqroot = Math.floor(Math.sqrt(num));
	
	let numsTillSqroot = Array.from({ length: sqroot - 1 }).map((x, i) => i + 2);
	
	numsTillSqroot.forEach(x => (arr = arr.filter(y => y % x !== 0 || y === x)));

	return arr;
}

function primes2(min, max) {
	
	let arr = Array.from({ length: max-min - 1 }).map((x, i) => i + min);
	
	let sqroot = Math.floor(Math.sqrt(max));
	
	let numsTillSqroot = Array.from({ length: sqroot - 1 }).map((x, i) => i + min);
	
	numsTillSqroot.forEach(x => (arr = arr.filter(y => y % x !== 0 || y === x)));

	return arr;
}


var eratosthenes = function(n) {
    // Eratosthenes algorithm to find all primes under n
    var array = [], upperLimit = Math.sqrt(n), output = [];

    // Make an array from 2 to (n - 1)
    for (var i = 0; i < n; i++) {
        array.push(true);
    }

    // Remove multiples of primes starting from 2, 3, 5,...
    for (var i = 2; i <= upperLimit; i++) {
        if (array[i]) {
            for (var j = i * i; j < n; j += i) {
                array[j] = false;
            }
        }
    }

    // All array[i] set to true are primes
    for (var i = 2; i < n; i++) {
        if(array[i]) {
            output.push(i);
        }
    }

    return output;
};