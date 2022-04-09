export const hacknetConfig: {
    QUEUE_ID: number,
    DAEMON_FILE: string,
    MANAGER_FILE: string,
    FARM_FILE: string,
    NODE_FILE: string,
    COMPONENT_FILE: string,
    CONFIG_FILE: string,
    DISPLAY_TAIL: boolean,
} = {
    QUEUE_ID: 1,
    DAEMON_FILE: '/hacknet/hacknet-hacknet-daemon.js',
    MANAGER_FILE: '/hacknet/manager.js',
    FARM_FILE: '/hacknet/farm.js',
    NODE_FILE: '/hacknet/node.js',
    COMPONENT_FILE: '/hacknet/component.js',
    CONFIG_FILE: '/hacknet/hacknetConfig.js',
    DISPLAY_TAIL: false,
};

export const HACKNET_CONFIG: {
    PACKAGE: string[],
    TARGET: string,
} = {
    PACKAGE: [
        '/hacknet/hacknet-daemon.js',
        '/hacknet/hacknet-config.js',
        '/hacknet/hacknet-adapters.js',
        '/hacknet/farm.js',
        '/hacknet/component.js',
        '/hacknet/node.js',
        '/resources/global-config.js',
        '/resources/helpers.js'],
    TARGET: 'foodnstuff',
};