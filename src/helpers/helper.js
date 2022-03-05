//https://dev.to/fatematzuhora/different-use-cases-of-console-log-you-should-use-when-debugging-javascript-30pf'
// format numbers

export function formatMoney(ns, num) {
    return ns.nFormat(num, '0.00 a$');
}

export function formatNumbers(ns, num) {
    return ns.nFormat(num, '0.00 a');
}

export function formatTime(ns, num) {
    return ns.tFormat(num, '00:00:00');
}

export function timeConverter(timestamp) {
    let date = new Date(timestamp);
    let h = date.getHours().toString().padStart(2, '0');
    let m = date.getMinutes().toString().padStart(2, '0');
    let s = date.getSeconds().toString().padStart(2, '0');
    let ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
}

export function nowStr() {
    return timeConverter(Date.now());
}


export class Log {
    
    static info(ns, msg) {
        let timestamp = nowStr();
        ns.print(`${timestamp} INFO - ${msg}`);
        let style = 'color: #42B5FF; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
    }
    
    
    static success(ns, msg, duration = 5000) {
        let timestamp = nowStr();
        ns.print(`${timestamp} SUCCESS - ${msg}`);
        let style = 'color: #00FF08; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
        ns.toast(`${msg}`, 'success', duration);
    }
    
    
    static debug(ns, msg) {
        let timestamp = nowStr();
        let style = 'color: #FFFFFF; font-size: 12px; padding: 5px;';
        console.debug(`${timestamp} %c${msg}`, style);
    }
    
    
    static warn(ns, msg) {
        let timestamp = nowStr();
        ns.print(`${timestamp} WARNING - ${msg}`);
        console.warn(`${timestamp} ${msg}`);
    }
    
    
    static error(ns, msg) {
        let timestamp = nowStr();
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