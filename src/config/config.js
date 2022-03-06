// const symbols = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "e33", "e36", "e39"];

export class GLOBAL_CONFIG {
    static EMPTY_QUEUE = 'NULL PORT DATA';
    static HELPER_FILE = '/helpers/helper.js';
    static CONFIG_FILE = '/config/config.js';
}

export class JARVIS_CONFIG {
    static CYCLE_TIME = 60 * 1000; //ms
    static DISPLAY_TAIL = true;
}

export class HACKNET_CONFIG {
    static LOCATION = 'foodnstuff';
    static CYCLE_TIME = 1000; //ms
    static HARVEST_RATIO = 50 / 100;
    static QUEUE_ID = 1;
    static DAEMON_FILE = '/hacknet/hacknet-daemon.js';
    static FARM_FILE = '/hacknet/hacknet-farm.js';
    static NODE_FILE = '/hacknet/hacknet-node.js';
    static DISPLAY_TAIL = false;
}

export class NETWORK_CONFIG {
    static LOOP_SECURITY = 9999;
    static BLACK_LIST = [
        'home', 'darkweb', 'CSEC', 'The-Cave', 'run4theh111z', 'I.I.I.I', 'avmnite-02h', '.', 'w0r1d_d43m0n'];
}

export class WATSON_CONFIG {
    
    static LOCATION = 'home';
    static DAEMON_FILE = '/sherlock/watson-daemon.js';
    static LOGFILE = '/sherlock/fails.log.txt';
    static REWARD_DISPLAY = true;
    static QUEUE_ID = 2;
    static DISPLAY_TAIL = false;
    
}

export class HydraConfig {
    
    static modulePath = '/hydra/';
    static displayTail = true;
    
}

export class ShivaConfig {
    
    static malwareFiles = [
        '/hydra/hack.js',
        '/hydra/weaken.js',
        '/hydra/grow.js',
        '/hydra/shiva-leecher-daemon.js',
        '/hydra/shiva-bleeder-daemon.js',
        '/helpers/helper.js',
        '/config/config.js',
        '/network/server.js'];
    static pauseBetweenSteps = 200; // ms
    static hackRatio = 50 / 100;
    static displayTail = false;
    
}

export class MALWARE_CONFIG {
    
    MODULE_PATH = '/hydra/';
    WEAKEN_FILE = '/hydra/weaken.js';
    GROW_FILE = '/hydra/grow.js';
    HACK_FILE = '/hydra/hack.js';
    
}

export class Agent47Config {
    
    static    WEAKEN_RAM_MAX_FACTOR = 0.25;
    static    GROW_FACTOR = 0.05;
    static    LOOP_SECURITY = 1000;
    static    RUNNER_NAME = 'home';
    static    QUEUE_ID = 2;
    
}