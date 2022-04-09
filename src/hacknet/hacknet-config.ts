export const HACKNET_CONFIG: {
    LOCATION: string,
    HARVEST_RATIO: number,
    CYCLE_TIME: number,
    PACKAGE: string[],
    DISPLAY_TAIL: boolean,
} = {
    
    // Functional
    LOCATION: 'foodnstuff',
    HARVEST_RATIO: 50 / 100,
    CYCLE_TIME: 2000, //ms
    
    // Technical
    PACKAGE: [
        '/hacknet/hacknet-daemon.js',
        '/hacknet/hacknet-config.js',
        '/hacknet/hacknet-adapters.js',
        '/hacknet/farm.js',
        '/hacknet/component.js',
        '/hacknet/node.js',
        '/resources/global-config.js',
        '/resources/helpers.js'],
    DISPLAY_TAIL: false,
};