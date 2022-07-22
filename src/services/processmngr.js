import { ServiceProvider } from '/services/service';
export class ProcessMngr {
    constructor(ns) {
        this.ns = ns;
        this.network = ServiceProvider.getNetwork(ns);
    }
    getServerProcesses(serverId) {
        let processes = this.ns.ps(serverId);
        processes.forEach(proc => proc.runnerId = this.ns.getHostname());
        return processes;
    }
    getProcessByLandingTime(landingTime) {
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
//# sourceMappingURL=processmngr.js.map