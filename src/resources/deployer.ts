import {INs, Log} from '/resources/helpers';
import {getService, ServiceName} from '/resources/service';
import {Network, Server} from '/resources/network';

export class Deployer {
    private network: Network;
    
    constructor(private readonly ns: INs, private readonly log: Log) {
        this.network = getService<Network>(this.ns, ServiceName.Network);
    }
    
    async deploy(job: Job): Promise<Job> {
        const scriptRam = job.scriptRam || this.ns.getScriptRam(job.script, 'home');
        
        if (job.runnerName) {
            job.runner = this.network.getServer(job.runnerName);
        } else {
            job.runner = this.network.getSmallestServers(job.threads ||= 1, scriptRam);
        }
        
        const scriptName = job.script.split('/').pop();
        await this.deployDependencies(job.runner.id, [job.script, ...job.dependencies], scriptName);
        return this.execJob(job);
    }
    
    private async deployDependencies(runnerName: string, dependencies: string[], scriptName: string): Promise<void> {
        const coreDependencies = [
            '/resources/helpers.js',
            '/resources/service.js',
            '/resources/deployer.js',
            '/resources/network.js'
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
    
    private execJob(job: Job): Job {
        job.pid = this.ns.exec(job.script, job.runner.id, job.threads, ...job.args || []);
        return job;
    }
    
    checkIfScriptRunning(serviceFile: string): boolean {
        return this.network
            .filter(node =>this.ns.ps(node.id)
                .filter(process => process.filename === serviceFile)
                .length > 0)
            .length > 0;
    }
}

export interface Job {
    script: string;
    runnerName?: string;
    scriptRam?: number;
    runner?: Server;
    threads?: number;
    args?: (string | number)[];
    dependencies?: string[];
    splitToggle?: boolean;
    pid?: number;
}