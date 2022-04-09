export class JarvisAdapter {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    scan(hostname: string): string[] {
        return this.ns.scan(hostname);
    }
    
    getNode(nodeName: string): object {
        return this.ns.getServer(nodeName);
    }
    
    hasRootAccess(nodeName: string): boolean {
        return this.ns.hasRootAccess(nodeName);
    }
    
    getPlayerHackingLevel(): number {
        return this.ns.getHackingLevel();
    }
    
    brutessh(hostname: string): void {
        this.ns.brutessh(hostname);
    }
    
    ftpcrack(hostname: string): void {
        this.ns.ftpcrack(hostname);
    }
    
    relaysmtp(hostname: string): void {
        this.ns.relaysmtp(hostname);
    }
    
    httpworm(hostname: string): void {
        this.ns.httpworm(hostname);
    }
    
    sqlinject(hostname: string): void {
        this.ns.sqlinject(hostname);
    }
    
    fileExists(fileName: string, hostname: string): boolean {
        return this.ns.fileExists(fileName, hostname);
    }
    
    nuke(hostname: string): void {
        this.ns.nuke(hostname);
    }
    
    async scp(files: string | string[], source: string, target: string): Promise<void> {
        await this.ns.scp(files, source, target);
    }
    
    exec(script: string, target: string, threadCount: number, ...args: any[]): void {
        this.ns.exec(script, target, threadCount, ...args);
    }
    
    ps(hostname: string): any[] {
        return this.ns.ps(hostname);
    }
    
    async sleep(duration: number): Promise<void> {
        await this.ns.sleep(duration);
        
    }
}