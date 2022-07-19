var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/pkg.helpers';
import { ServiceProvider } from '/services/service';
import { CONSTANTS } from '/constants';
export class Deployer {
    constructor(ns) {
        this.ns = ns;
        this.network = ServiceProvider.getNetwork(ns);
        this.log = new Log(ns);
    }
    threads2Batch(threads, target, landingTime) {
        // debugger
        const a = this.threads2Req(threads, target, landingTime);
        return this.req2batch(a);
    }
    threads2Req(threads, target, landingTime) {
        return {
            landing: landingTime,
            target: target,
            hk: threads.hk,
            wk1: threads.wk1,
            gw: threads.gw,
            wk2: threads.wk2
        };
    }
    req2batch(req) {
        let batch = [];
        debugger;
        batch.push(this.hackReq2Job(req.hk, req.landing - 120, req.target));
        batch.push(...this.weakReq2Jobs(req.wk1, req.landing - 80, req.target));
        batch.push(this.growReq2Job(req.gw, req.landing - 40, req.target));
        debugger;
        batch.push(...this.weakReq2Jobs(req.wk2, req.landing, req.target));
        if (!batch.includes(null))
            return batch;
        else
            return null;
    }
    hackReq2Job(hkThreads, landingTime, target) {
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
    growReq2Job(gwThreads, landingTime, target) {
        const home = this.network.getHome();
        const ramNeeded = gwThreads * CONSTANTS.growRam;
        if (home.ram.available >= ramNeeded) {
            home.ram.reserved = ramNeeded;
            return new Job(this.ns, '/pkg.gw2.js', gwThreads, 'home', landingTime, target);
        }
        return null;
    }
    weakReq2Jobs(wkThreads, landingTime, target) {
        debugger;
        let wkJobs = [];
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
    deploy(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptRam = job.scriptRam || this.ns.getScriptRam(job.script, 'home');
            if (job.runnerName) {
                job.runner = this.network.getNode(job.runnerName);
            }
            else {
                job.runner = this.network.getSmallestServers(job.threads || (job.threads = 1), scriptRam);
            }
            const scriptName = job.script.split('/').pop();
            yield this.deployDependencies(job.runner.id, [job.script, ...job.dependencies], scriptName);
            return this.execJob(job);
        });
    }
    deployDependencies(runnerName, dependencies, scriptName) {
        return __awaiter(this, void 0, void 0, function* () {
            const coreDependencies = [
                '/pkg.helpers.js',
                '/services/service.js',
                '/services/deployer.js',
                '/services/network.js',
            ];
            const copyStatus = yield this.ns.scp([...dependencies, ...coreDependencies], 'home', runnerName);
            if (copyStatus === true) {
                const msg = `Upload ${scriptName} and dependencies to ${runnerName} - Succes`;
                this.log.success(msg);
            }
            else {
                const msg = `Upload ${scriptName} and dependencies to ${runnerName} - Failure`;
                this.log.warn(msg);
            }
        });
    }
    execMalwareJob(job) {
        const script = job.script;
        const param = {
            targetId: job.args,
            landingTime: job.landingTime,
            runnerId: job.runnerHostname,
            threads: job.threads
        };
        return this.ns.exec(script, param.runnerId, param.threads, JSON.stringify(param));
    }
    execBatch(batch) {
        let output = [];
        for (let job of batch) {
            job.pid = this.execMalwareJob(job);
            output.push(job);
        }
        return output;
    }
    execJob(job) {
        job.pid = this.ns.exec(job.script, job.runner.id, job.threads, ...job.args || []);
        return job;
    }
    checkIfScriptRunning(serviceFile) {
        return this.network.filter(node => this.ns.ps(node.id).filter(process => process.filename === serviceFile).length > 0).length > 0;
    }
}
export class Job {
    constructor(ns, script, threads, runnerHostname, landingTime = 0, 
    // public readonly args?: (string | number)[]) {
    args) {
        this.ns = ns;
        this.script = script;
        this.threads = threads;
        this.runnerHostname = runnerHostname;
        this.landingTime = landingTime;
        this.args = args;
        this.ram = this.ns.getScriptRam(this.script, 'home');
    }
}
//# sourceMappingURL=deployer.js.map