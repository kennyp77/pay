import config from '../../configs';

const bunker = require('express-bunker');

const { url, project, version } = config.services.bunker;
const updateInterval = 1000 * 60;

export default bunker({
    api: url,
    project,
    version,
    updateInterval,
});
