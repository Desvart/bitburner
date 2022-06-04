var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getService, ServiceName } from '/resources/service';
export class Deployer {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
        this.network = getService(this.ns, ServiceName.Network);
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
            yield this.deployDependencies(job.runner.hostname, [job.script, ...job.dependencies], scriptName);
            return this.execJob(job);
        });
    }
    deployDependencies(runnerName, dependencies, scriptName) {
        return __awaiter(this, void 0, void 0, function* () {
            const coreDependencies = [
                '/resources/helpers.js',
                '/resources/service.js',
                '/resources/deployer.js',
                '/resources/network.js'
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
    execJob(job) {
        job.pid = this.ns.exec(job.script, job.runner.hostname, job.threads, ...job.args || []);
        return job;
    }
    checkIfScriptRunning(serviceFile) {
        return this.network.servers
            .filter(node => this.ns.ps(node.hostname)
            .filter(process => process.filename === serviceFile)
            .length > 0)
            .length > 0;
    }
}
//# sourceMappingURL=deployer.js.map