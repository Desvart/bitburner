export class KittyHackAdapter {
    private readonly ns;
    
    constructor(ns) {
        this.ns = ns;
    }
    
    getServerSecurityLevel(hostname: string): number {
        return this.ns.getServerSecurityLevel(hostname);
    }
    
    getServerMoneyAvailable(hostname: string): number {
        return this.ns.getServerMoneyAvailable(hostname);
    }
    
    async weaken(hostname: string): Promise<void> {
        await this.ns.weaken(hostname);
    }
    
    async grow(hostname: string): Promise<void> {
        await this.ns.grow(hostname);
    }
    
    async hack(hostname: string): Promise<void> {
        await this.ns.hack(hostname);
    }
    
    getServerMinSecurityLevel(hostname: string): number {
        return this.ns.getServerMinSecurityLevel(hostname);
    }
    
    getServerMaxMoney(hostname: string): number {
        return this.ns.getServerMaxMoney(hostname);
    }
}