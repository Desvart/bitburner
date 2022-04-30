export function timeConverter(timestamp) {
    const date = new Date(timestamp);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
}
export function nowStr() {
    return timeConverter(Date.now());
}
export class Log {
    constructor(ns) {
        this.ns = ns;
    }
    info(msg) {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} INFO - ${msg}`);
        const style = 'color: #42B5FF; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
    }
    success(msg, duration = 5000) {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} SUCCESS - ${msg}`);
        const style = 'color: #00FF08; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
        this.ns.toast(`${msg}`, 'success', duration);
    }
    debug(msg, toggle = true) {
        if (toggle === true) {
            const timestamp = nowStr();
            const style = 'color: #FFFFFF; font-size: 12px; padding: 5px;';
            console.debug(`${timestamp} %c${msg}`, style);
        }
    }
    warn(msg, toastSwitch = false) {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} WARNING - ${msg}`);
        console.warn(`${timestamp} ${msg}`);
        if (toastSwitch)
            this.ns.toast(`${msg}`, 'warning', null);
    }
    error(msg) {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} ERROR - ${msg}`);
        console.error(`${timestamp} ${msg}`);
        throw (`${timestamp} ${msg}`);
    }
    formatNumber(num) {
        return this.ns.nFormat(num, '0.00 a');
    }
    formatMoney(num) {
        return this.ns.nFormat(num, '0.00 a$');
    }
    formatDuration(num) {
        let sec = Math.trunc(num / 1000) % 60;
        let min = Math.trunc((num - sec) / 60) % 60;
        let hour = Math.trunc((num - (min * 60) - sec) / (60 * 2));
        return hour.toString() + ':' + min.toString() + ':' + sec.toString();
    }
    printHostState(malware, hostname, hostState) {
        const secMsg = `Security: ${this.formatNumber(hostState.actualSec)}/${hostState.minSec}`;
        const monMsg = `Money: ${this.formatMoney(hostState.availMoney)}/${this.formatMoney(hostState.maxMoney)}`;
        this.info(`${malware} ${hostname} - ${secMsg} - ${monMsg}\n`);
    }
}
export function loadInitFile(ns, hostname) {
    const file = ns.ls(hostname, '-init.txt')[0];
    return JSON.parse(ns.read(file));
}
//# sourceMappingURL=helpers.js.map