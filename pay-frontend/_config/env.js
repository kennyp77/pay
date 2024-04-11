function getEnv(envName, defaultValue) {
    const envValue = process.env[envName];

    if (envValue) {
        return envValue;
    }

    if (typeof defaultValue !== 'undefined') {
        return defaultValue;
    }

    throw new Error(`"${envName}" environment variable is not found`);
}

module.exports = getEnv;
