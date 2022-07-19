import {Log} from '/pkg.helpers';
import {ServiceProvider} from '/services/service';
import {Network, Server} from '/services/network';
import {IBatch, IBatchReq, IBatchThreads, IJob, INs, IServer, timestamp} from '/utils/interfaces';
import {CONSTANTS} from '/constants';

export class Deployer {
    private readonly network: Network;
    private readonly log: Log;
    
    constructor(private readonly ns: INs) {
        this.network = ServiceProvider.getNetwork(ns);
        this.log = new Log(ns);
    }
    
    threads2Batch(threads: IBatchThreads, target: string, landingTime: timestamp): Array<IJob> {
        // debugger
        const a = this.threads2Req(threads, target, landingTime)
        
        return this.req2batch(a);
    }
    
    threads2Req(threads: IBatchThreads, target: string, landingTime: timestamp): IBatchReq {
        return {
            landing: landingTime,
            target: target,
            hk: threads.hk,
            wk1: threads.wk1,
            gw: threads.gw,
            wk2: threads.wk2
        }
    }
    
    req2batch(req: IBatchReq): Array<IJob> {
        
        let batch: Array<IJob> = []
        debugger
        batch.push(this.hackReq2Job(req.hk, req.landing - 120, req.target));
        batch.push(...this.weakReq2Jobs(req.wk1, req.landing - 80, req.target));
        batch.push(this.growReq2Job(req.gw, req.landing - 40, req.target));
        debugger
        batch.push(...this.weakReq2Jobs(req.wk2, req.landing, req.target));
        
        if (!batch.includes(null))
            return batch;
        else
            return null;
    }
    
    hackReq2Job(hkThreads: number, landingTime: timestamp, target: string): IJob {
        const ramNeeded = hkThreads * CONSTANTS.hackRam;
        for (const server of this.network) {
        // for (const server of this.network.getThreadPool()) {
            if (server.ram.available >= ramNeeded) {
                server.ram.reserved = ramNeeded;
                return new Job(this.ns, '/pkg.hk2.js', hkThreads, server.id, landingTime, target);
            }
        }
        return null;
    }
    
    growReq2Job(gwThreads: number, landingTime: timestamp, target: string): IJob {
        const home = this.network.getHome();
        const ramNeeded = gwThreads * CONSTANTS.growRam;
        if (home.ram.available >= ramNeeded) {
            home.ram.reserved = ramNeeded;
            return new Job(this.ns, '/pkg.gw2.js', gwThreads, 'home', landingTime, target);
        }
        return null;
    }
    
    weakReq2Jobs(wkThreads: number, landingTime: timestamp, target: string): IJob[] {
        debugger
        let wkJobs: Array<IJob> = [];
        let ramNeeded = wkThreads * CONSTANTS.growRam;
        for (const server of this.network) {
        // for (const server of this.network.getThreadPool()) {
            const availableThreads = server.getThreadsCount(CONSTANTS.weakRam);
            if (availableThreads > 0) {
                const ramUsed = Math.min(availableThreads * CONSTANTS.weakRam, ramNeeded);
                const threadsUsed = ramUsed / CONSTANTS.weakRam;
                server.ram.reserved = ramUsed;
                ramNeeded -= ramUsed;
                wkJobs.push(new Job(this.ns, '/pkg.wk2.js', threadsUsed, server.id, landingTime, target));
                if (ramNeeded <= 0)
                    return wkJobs;
            }
        }
        return null;
    }
    
    async deploy(job: Job): Promise<Job> {
        const scriptRam = job.scriptRam || this.ns.getScriptRam(job.script, 'home');
        
        if (job.runnerName) {
            job.runner = this.network.getNode(job.runnerName);
        } else {
            job.runner = this.network.getSmallestServers(job.threads ||= 1, scriptRam);
        }
        
        const scriptName = job.script.split('/').pop();
        await this.deployDependencies(job.runner.id, [job.script, ...job.dependencies], scriptName);
        return this.execJob(job);
    }
    
    private async deployDependencies(runnerName: string, dependencies: string[], scriptName: string): Promise<void> {
        const coreDependencies = [
            '/pkg.helpers.js',
            '/services/service.js',
            '/services/deployer.js',
            '/services/network.js',
        ];
        const copyStatus = await this.ns.scp([...dependencies, ...coreDependencies], 'home', runnerName);
        
        if (copyStatus === true) {
            const msg = `Upload ${scriptName} and dependencies to ${runnerName} - Succes`;
            this.log.success(msg);
        } else {
            const msg = `Upload ${scriptName} and dependencies to ${runnerName} - Failure`;
            this.log.warn(msg);
        }
    }
    
    public execMalwareJob(job: Job): number {
    
        const script = job.script;
        const param = {
            targetId: job.args,
            landingTime: job.landingTime,
            runnerId: job.runnerHostname,
            threads: job.threads
        };
        
        return this.ns.exec(script, param.runnerId, param.threads, JSON.stringify(param));
    }
    
    public execBatch(batch: IBatch): Array<Job> {
        let output: Array<Job> = [];
        for (let job of batch) {
            job.pid = this.execMalwareJob(job);
            output.push(job);
        }
        return output;
    }
    
    
    
    private execJob(job: Job): Job {
        job.pid = this.ns.exec(job.script, job.runner.id, job.threads, ...job.args || []);
        return job;
    }
    
    checkIfScriptRunning(serviceFile: string): boolean {
        return this.network.filter(
            node => this.ns.ps(node.id).filter(process => process.filename === serviceFile).length > 0).length > 0;
        
    }
}

export class Job implements IJob {
    pid: number;
    readonly ram: number;
    
    constructor(
        public readonly ns: INs,
        public readonly script: string,
        public readonly threads: number,
        public readonly runnerHostname: string,
        public readonly landingTime: timestamp = 0,
        // public readonly args?: (string | number)[]) {
        public readonly args?: string) {
        
        this.ram = this.ns.getScriptRam(this.script, 'home');
    }
}

