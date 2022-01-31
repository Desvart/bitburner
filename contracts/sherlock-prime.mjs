import {NS} from "/github/nsMockup.mjs"; main(new NS);
/* Ref.
https://kalkicode.com/find-prime-numbers-given-range-using-segmented-sieve
https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html
*/

/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.clearLog();

	let contractName = ns.args[0];
	let contractLocation = ns.args[1];

	// Extract contract data
	let numberToDecompose = ns.CodingContract.getData(contractName, contractLocation);

	// Solve contract
	let biggestPrime = findBiggestPrime(ns, numberToDecompose);

	// Submit solution
	let reward = ns.CodingContract.attempt(biggestPrime, contractName, contractLocation, true);

	// Report result
	ns.success(reward);
}

/**
 * Find all prime factors of a number, but compute it block by block to avoid memory bottlenecks.
 * @param numberToDecompose
 * @returns {*[]}
 */
function findBiggestPrime(ns, numberToDecompose) {
	let primeDecomposition = [];
	let blockSize = 1000;
	let blockFirstIndex = 2;
	let loopIdx = 0;
	while(numberToDecompose !== 1) {

		let loopFirstIndex = blockFirstIndex + (loopIdx * blockSize);
		let loopLastIndex = blockFirstIndex - 1 + ((loopIdx + 1 ) * blockSize);
		let primeList = segmentedEratosthenesSieve(ns, loopFirstIndex, loopLastIndex);
		debug(ns, "Prime list: %d", primeList);
		loopIdx++;

		for(let i = 0; i < primeList.length ; i++) {
			debug(ns, "%d %% %d = %d", numberToDecompose, primeList[i], numberToDecompose%primeList[i]);

			if(numberToDecompose % primeList[i] === 0) {
				primeDecomposition.push(primeList[i]);
				numberToDecompose /= primeList[i];
				if(numberToDecompose === 1)
					if(validation(primeDecomposition, numberToDecompose))
						return primeDecomposition;
					else
						error(ns, "Couac !");
				i--;
			}
		}
	}
}

function validation(ns, primeList, number) {
	if(recomposePrime(primeList) === number) {
		ns.print("Prime decomposition is correct"); // transform this in a INFO log
		return true;
	}
	else {
		ns.print("Prime decomposition is incorrect"); // transform this into an ERROR log
		ns.pop("Prime decomposition is incorrect");
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

function segmentedEratosthenesSieve(ns, s, e) {
	let primeList = [];
	if (s < 0 || e < 2)
		ns.print("\n Prime number in range of (" + s + "," + e + ")");

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