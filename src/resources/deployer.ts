import {INs, Log} from '/resources/helpers';

export class Deployer {
    constructor(private ns: INs, private log: Log) {
    
    }
    
    checkIfScriptRunning(serviceFile: string): boolean {
        return false;
    }
}