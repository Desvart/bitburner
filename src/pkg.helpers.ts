import {INs, IServer} from '/utils/interfaces';

export function timeConverter(timestamp: number): string {
    const date = new Date(timestamp);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
}

export function nowStr(): string {
    return timeConverter(Date.now());
}

export class Log {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    info(msg: string): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} INFO - ${msg}`);
        const style = 'color: #42B5FF; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
    }
    
    success(msg: string, duration: number | boolean = 5000): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} SUCCESS - ${msg}`);
        const style = 'color: #00FF08; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
        if (typeof duration !== 'boolean')
            this.ns.toast(`${msg}`, 'success', duration);
    }
    
    debug(msg: string, toggle: boolean = true): void {
        if (toggle === true) {
            const timestamp = nowStr();
            const style = 'color: #FFFFFF; font-size: 12px; padding: 5px;';
            console.debug(`${timestamp} %c${msg}`, style);
        }
    }
    
    warn(msg: string, toastSwitch: boolean = false): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} WARNING - ${msg}`);
        console.warn(`${timestamp} ${msg}`);
        if (toastSwitch)
            this.ns.toast(`${msg}`, 'warning', null);
    }
    
    error(msg: string): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} ERROR - ${msg}`);
        console.error(`${timestamp} ${msg}`);
        throw(`${timestamp} ${msg}`);
    }
    
    formatNumber(num: number): string {
        return this.ns.nFormat(num, '0.00 a');
    }
    
    formatMoney(num: number): string {
        return this.ns.nFormat(num, '0.00 a$');
    }
    
    formatDuration(num: number) {
        num = num / 1000;
        const sec = Math.trunc(num) % 60;
        const min = Math.trunc((num - sec) / 60) % 60;
        const hour = Math.trunc((num - (min * 60) - sec) / (60 * 2));
        return hour.toString() + ':' + min.toString() + ':' + sec.toString();
    }
    
    printHostState(malware, hostname, hostState): void {
        const secMsg = `Security: ${this.formatNumber(hostState.actualSec)}/${hostState.minSec}`;
        const monMsg = `Money: ${this.formatMoney(hostState.availMoney)}/${this.formatMoney(hostState.maxMoney)}`;
        this.info(`${malware} ${hostname} - ${secMsg} - ${monMsg}\n`);
    }
}

export function formatDuration(num: number): string {
    num = num / 1000;
    const sec = Math.trunc(num) % 60;
    const min = Math.trunc((num - sec) / 60) % 60;
    const hour = Math.trunc((num - (min * 60) - sec) / (60 * 2));
    return hour.toString().padStart(2, '0') + ':' + min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
}

export function loadNetwork(ns: INs, hostname: string): IServer[] {
    const file: string = ns.ls(hostname, 'network')[0];
    return JSON.parse(ns.read(file));
}

export function loadInitFile(ns: INs, hostname: string, target: string = ''): any {
    if (target !== '')
        target = '-' + target;
    
    const file: string = ns.ls(hostname, `-init${target}.txt`)[0];
    return JSON.parse(ns.read(file));
}


