import { getIconUrl } from '@trust/bank-cards/issuer/icon';
import { CardIssuer } from '@trust/bank-cards/typings';

const icons = Object.values(CardIssuer).map((issuer) => getIconUrl(issuer));

export default icons;
