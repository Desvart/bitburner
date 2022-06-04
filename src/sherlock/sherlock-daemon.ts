import {INs, Log, nowStr} from '/resources/helpers';
import {GIPA} from '/sherlock/sherlock-GIPA';
import {FLPF} from '/sherlock/sherlock-FLPF';
import {UPIAGI} from '/sherlock/sherlock-UPIAG';
import {SM} from '/sherlock/sherlock-SM';
import {SherlockAST} from '/sherlock/sherlock-AST';
import {SherlockAJG} from '/sherlock/sherlock-AJG';
import {SherlockFAVME} from '/sherlock/sherlock-FAVME';
import {SherlockMOI} from '/sherlock/sherlock-MOI';
import {SherlockMPSIAT} from '/sherlock/sherlock-MPSIAT';
import {SherlockSPIE} from '/sherlock/sherlock-SPIE';
import {SherlockTWTS} from '/sherlock/sherlock-TWTS';
import {SherlockSWMS} from '/sherlock/sherlock-SWMS';
import {SherlockHCITEB} from '/sherlock/sherlock-HCITEB';
import {SherlockSPIAG} from '/sherlock/sherlock-SPIAG';
import {getService, ServiceName} from '/resources/service';
import {Network} from '/resources/network';

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
    
    //FIXME - Sanitize Parentheses in Expression - ()((())()))(()
    //FIXME - Sanitize Parentheses in Expression - (a(())(a)))(((()
    //FIXME - Sanitize Parentheses in Expression - ())()a(aa((a
    //FIXME - Array Jumping Game - [5,2,1,1,5,5]
    //FIXME - Array Jumping Game - [4,2,1,1,8]
    //FIXME - Array Jumping Game - [1,3,2,6,3,1,5,2]
    
    const log = new Log(ns);
    const sherlock = new SherlockDaemon(ns, log);
    const network = getService<Network>(ns, ServiceName.Network);
    
    //noinspection InfiniteLoopJS
    while (true) {
        const contracts = sherlock.retrieveContracts(network.servers.map(n => n.hostname));
        for (const contract of contracts) {
            
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
        await ns.sleep(5 * 60 * 1000);
    }
}

class SherlockDaemon {
    private readonly ns: INs;
    private readonly log: Log;
    
    constructor(ns: INs, log: Log) {
        this.ns = ns;
        this.log = log;
    }
    
    retrieveContracts(network: string[]): Contract[] {
        let contractsList: Contract[] = [];
        
        for (const hostname of network) {
            const foundContractFileList = this.ns.ls(hostname, CONFIG.CONTRACT_EXTENSION);
            for (const contractFile of foundContractFileList) {
                contractsList.push(new Contract(this.ns, contractFile, hostname));
            }
        }
        return contractsList;
    }
    
    submitSolution(contract: Contract): Contract {
        contract.reward = this.ns.codingcontract.attempt(contract.solution, contract.name, contract.location, {returnReward: true});
        return contract;
    }
    
    async shareReward(contract) {
        if (contract.reward !== '' || contract.reward === true) {
            const msg = `SHERLOCK_DAEMON - Contract ${contract.name} (${contract.type}) on ${contract.location} solved.
                Reward: ${contract.reward}`;
            this.log.success(msg);
            
        } else {
            const errorLog = `${nowStr()}\nContract: ${contract.name}\nLocation: ${contract.location}\n
                Type: ${contract.type}\nData: ${JSON.stringify(contract.data)}\n\n`;
            await this.ns.write(CONFIG.LOGFILE, errorLog);
            
            const msg = `SHERLOCK_DAEMON - Contract resolution failed! - ${contract.name} (${contract.type})
                @${contract.location}`;
            this.log.warn(msg);
        }
    }
    
    solveContract(contract) {
        switch (contract.type) {
            case 'Algorithmic Stock Trader I':
                contract.solution = new SherlockAST().solveI(contract.data);
                break;
            case 'Algorithmic Stock Trader II':
                contract.solution = new SherlockAST().solveII(contract.data);
                break;
            case 'Algorithmic Stock Trader III':
                contract.solution = new SherlockAST().solveIII(contract.data);
                break;
            case 'Algorithmic Stock Trader IV':
                contract.solution = new SherlockAST().solveIV(contract.data);
                break;
            case 'Array Jumping Game':
                contract.solution = new SherlockAJG().solveI(contract.data);
                break;
            case 'Array Jumping Game II':
                contract.solution = new SherlockAJG().solveII(contract.data);
                break;
            case 'Find All Valid Math Expressions':
                contract.solution = new SherlockFAVME().solve(contract.data);
                break;
            case 'Find Largest Prime Factor':
                contract.solution = new FLPF(this.log).solve(contract.data);
                break;
            case 'Generate IP Addresses':
                contract.solution = new GIPA().solve(contract.data);
                break;
            case 'Merge Overlapping Intervals':
                contract.solution = new SherlockMOI().solve(contract.data);
                break;
            case 'Minimum Path Sum in a Triangle':
                contract.solution = new SherlockMPSIAT().solve(contract.data);
                break;
            case 'Sanitize Parentheses in Expression':
                contract.solution = new SherlockSPIE().solve(contract.data);
                break;
            case 'Spiralize Matrix':
                contract.solution = new SM().solve(contract.data);
                break;
            case 'Subarray with Maximum Sum':
                contract.solution = new SherlockSWMS().solve(contract.data);
                break;
            case 'Total Ways to Sum':
                contract.solution = new SherlockTWTS().solveI(contract.data);
                break;
            case 'Total Ways to Sum II':
                contract.solution = new SherlockTWTS().solveII(contract.data);
                break;
            case 'Unique Paths in a Grid I':
                contract.solution = new UPIAGI().solveI(contract.data);
                break;
            case 'Unique Paths in a Grid II':
                contract.solution = new UPIAGI().solveII(contract.data);
                break;
            case 'HammingCodes: Integer to encoded Binary':
                contract.solution = new SherlockHCITEB().solve(contract.data);
                break;
            case 'Shortest Path in a Grid':
                contract.solution = new SherlockSPIAG().solve(contract.data);
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