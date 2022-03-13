//https://dev.to/fatematzuhora/different-use-cases-of-console-log-you-should-use-when-debugging-javascript-30pf'
// format numbers

export class Format {
    
    static money(ns, num) {
        return ns.nFormat(num, '0.00 a$');
    }
    
    static numbers(ns, num) {
        return ns.nFormat(num, '0.00 a');
    }
    
    static time(ns, num) {
        return ns.tFormat(num, '00:00:00');
    }
}

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
    
    static info(ns, msg) {
        const timestamp = nowStr();
        ns.print(`${timestamp} INFO - ${msg}`);
        const style = 'color: #42B5FF; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
    }
    
    static success(ns, msg, duration = 5000) {
        const timestamp = nowStr();
        ns.print(`${timestamp} SUCCESS - ${msg}`);
        const style = 'color: #00FF08; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
        ns.toast(`${msg}`, 'success', duration);
    }
    
    static debug(ns, msg, toggle = true) {
        if (toggle === true) {
            const timestamp = nowStr();
            const style = 'color: #FFFFFF; font-size: 12px; padding: 5px;';
            console.debug(`${timestamp} %c${msg}`, style);
        }
    }
    
    static warn(ns, msg) {
        const timestamp = nowStr();
        ns.print(`${timestamp} WARNING - ${msg}`);
        console.warn(`${timestamp} ${msg}`);
        ns.toast(`${msg}`, 'warning', null);
    }
    
    static error(ns, msg) {
        const timestamp = nowStr();
        ns.print(`${timestamp} ERROR - ${msg}`);
        console.error(`${timestamp} ${msg}`);
        throw(`${timestamp} ${msg}`);
    }
}

export function initDaemon(ns, toggle) {
    if (toggle === true) {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
    }
}