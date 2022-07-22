import {ServiceProvider} from '/services/service';
import {IBaseProcess, INs} from '/utils/interfaces';
import {Network} from '/services/network';

export class ProcessMngr {
    private network: Network;
    
    constructor(private readonly ns: INs) {
        this.network = ServiceProvider.getNetwork(ns);
    }
 
    getServerProcesses(serverId: string): IBaseProcess[] {
        let processes = this.ns.ps(serverId);
        processes.forEach(proc => proc.runnerId = this.ns.getHostname());
        return processes;
    }
    
    getProcessByLandingTime(landingTime: number): IBaseProcess {
        for (let server of this.network) {
            let processes = this.ns.ps(server.id);
            for (let process of processes) {
                const procLandingTime = +process.args[2];
                if (procLandingTime === landingTime) {
                    process.runnerId = this.ns.getHostname();
                    return process;
                }
            }
        }
        return null;
    }
}

