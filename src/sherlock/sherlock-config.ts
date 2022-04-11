export const SHERLOCK_CONFIG: {
    INSTALL_PACKAGE: string[],
    RUN_PACKAGE: string[],
    CONTRACT_EXTENSION: string,
    LOGFILE: string,
} = {
    INSTALL_PACKAGE: [
        '/sherlock/sherlock-daemon.js',
        '/sherlock/sherlock-config.js',
        '/resources/helpers.js',
    ],
    RUN_PACKAGE: [
        '/sherlock/sherlock-daemon.js',
    ],
    CONTRACT_EXTENSION: 'cct',
    LOGFILE: '/sherlock-fails.log.txt',
};