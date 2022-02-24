// const symbols = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "e33", "e36", "e39"];

export class NsConst {
    static emptyQueue       = 'NULL PORT DATA';
}

export class JarvisConfig {
    static cycleTime        = 60 * 1000; //ms
    static displayTail      = true;
}

export class HacknetConfig {

    static location         = 'foodnstuff';
    static cycleTime        = 1000; //ms
    static harvestRatio     = 50/100;
    static queueId          = 1;
    static modulePath       = '/hacknet/';
    static snapshotFile     = 'hacknet-snapshot.json.txt';
    static displayTail      = false;
}

export class SpiderConfig {

    static blackList        = ''
    static modulePath       = '/network/';
    static snapshotFile     = 'network-snapshot.json.txt';
    
}

export class NetworkConfig {

    static blackList        = ['home', 'darkweb', 'CSEC', 'The-Cave', 'run4theh111z', 'I.I.I.I', 'avmnite-02h', '.', 'w0r1d_d43m0n'];
}

export class WatsonConfig {

    static location         = 'home';
    static modulePath       = '/watson/';
    static rewardDisplay    = true;
    static queueId          = 2;
    static displayTail      = false;

}

export class HydraConfig {

    static displayTail      = true;

}

export class ShivaConfig {

    static malwareFiles         = ['hack.js', 'weaken.js', 'grow.js', 'shiva-leecher-daemon.js', 'shiva-bleeder-daemon.js', 'helper.js', 'config.js', 'network-node.js'];
    static pauseBetweenSteps    = 200; // ms
    static hackRatio            = 50/100;
    static displayTail          = false;

}