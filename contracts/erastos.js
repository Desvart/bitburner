/* https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html

/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.clearLog();
	ns.disableLog("ALL");
/*
	let nsqrt = Math.floor(Math.sqrt(10));
	let isPrime = Array.from({ length: nsqrt + 2 }).fill(true);
	ns.print(isPrime);
*/
	await main2(ns);
}

async function main2(ns) {
	//const search4PrimeNumber = 663402738;
	const search4PrimeNumber = 24*3*11;
	var primeArray = await primeFactors_eratos_v3(ns, search4PrimeNumber);
	ns.print('Prime factors of ', search4PrimeNumber + ': ', primeArray);
}


async function primeFactors_naive_v1(ns, n) {
	const factors = [];
	let divisor = 2;

	while (n >= 2) { 
		ns.print("n is " + n);
		ns.print("divisor is " + divisor);
		ns.print("factors is " + factors.join(' '));
		if (n % divisor == 0) {
			factors.push(divisor);
			n = n / divisor;
		} else {
			divisor++;
		}
		await ns.sleep(200);
	}
	return factors;
}

// only go until the sqrt(n) and only go through odd numbers
async function primeFactors_naive_v2(ns, n) {
	const factors = [];
	let divisor = 2;

	while (n >= 2 && divisor == 2) { 
		if (n % divisor == 0) {
			factors.push(divisor);
			n = n / divisor;
		} else {
			divisor++;;
		}
	}

	while (n >= 2) { 
		ns.print("n is " + n);
		ns.print("divisor is " + divisor);
		ns.print("factors is " + factors.join(' '));
		if (n % divisor == 0) {
			factors.push(divisor);
			n = n / divisor;
		} else {
			divisor = divisor + 2;
		}
		await ns.sleep(200);
	}
	return factors;
}

async function primeFactors_eratos_v1(ns, n) {

	let arr = Array.from({ length: n - 1 }).map((x, i) => i + 2);
	let isPrime = Array.from({length:n}).fill(true);
	isPrime[0] = false;
	isPrime[1] = false;
	ns.print(isPrime);

	for(let i = 2; i <= n; i++) {
		ns.print("i: "+i);
		if(isPrime[i] && i*i <= n) {
			for(let j = i*i; j <= n; j+=i) {
				ns.print("i/j: "+i+"/"+j);
				isPrime[j] = false;
				arr[j-2] = "x";
			}
		}
		ns.print("arr: "+arr);
	}
	let primeDecomposition = arr.filter(x => x != "x");
	ns.print("arr: "+ primeDecomposition);
	return primeDecomposition;
}


async function primeFactors_eratos_v2(ns, n) {

	let arr = Array.from({ length: n - 1 }).map((x, i) => i + 2);
	let isPrime = Array.from({length:n}).fill(true);
	isPrime[0] = false;
	isPrime[1] = false;
	ns.print(isPrime);

	for(let i = 2; i*i <= n; i=i*2-1) {
		ns.print("i: "+i);
		if(isPrime[i]) {
			for(let j = i*i; j <= n; j+=i) {
				ns.print("i/j: "+i+"/"+j);
				isPrime[j] = false;
				arr[j-2] = "x";
			}
		}
		ns.print("arr: "+arr);
	}
	let primeDecomposition = arr.filter(x => x != "x");
	ns.print("arr: "+ primeDecomposition);
	return primeDecomposition;
}


async function primeFactors_eratos_v3(ns, n) {

	const blockSize = 5;

	let primes = [];
	let nsqrt = Math.floor(Math.sqrt(n));
	let isPrime = Array.from({ length: nsqrt + 2 }).fill(true);
	let arr = Array.from({ length: n - 1 }).map((x, i) => i + 2);

	ns.print(isPrime);
	for(let i = 2; i <= nsqrt; i++) {
		if(isPrime[i]) {
			primes.push(i)
			for(let j = i * i; j <= nsqrt; j += i) {
				isPrime[j] = false;
			}
		}
		ns.print("arr: "+arr);
	}

	for(let k = 0; k * blockSize <= n; k++) {
		let block = Array.from({ length: blockSize }).fill(true);
		let start = k * blockSize;
		for(let prime of primes) {
			let startIdx = (start + prime - 1) / prime;
			let j = Math.max(startIdx, prime) * prime - start;
			for(; j < blockSize; j += prime) {
				block[j] = false;
			}
		}
		
		if(k == 0)
			block[0] = block[1] = false;

		ns.print(block);

		for(let i = 0; i < blockSize && start + i <= n; i++) {
			if(block[i])
				ns.print(k*blockSize + i);
		}
	}

/*

	let primeDecomposition = arr.filter(x => x != "x");
	ns.print("arr: "+ primeDecomposition);
	return primeDecomposition;
*/
}