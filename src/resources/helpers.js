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
export class LogNsAdapter {
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
    warn(msg) {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} WARNING - ${msg}`);
        console.warn(`${timestamp} ${msg}`);
        this.ns.toast(`${msg}`, 'warning', null);
    }
    error(msg) {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} ERROR - ${msg}`);
        console.error(`${timestamp} ${msg}`);
        throw (`${timestamp} ${msg}`);
    }
    formatMoney(num) {
        return this.ns.nFormat(num, '0.00 a$');
    }
}
//# sourceMappingURL=helpers.js.map