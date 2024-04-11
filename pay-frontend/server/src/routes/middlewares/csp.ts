import config from '../../configs';
import csp from '../../middlewares/csp';

export default csp(config.yaCSP, config.env);
