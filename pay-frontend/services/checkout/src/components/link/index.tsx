import { compose, composeU, ExtractProps } from '@bem-react/core';
import { Link as LinkBase, withViewDefault } from '@yandex-lego/components/Link/desktop';

import { withHref } from './_mix/href';

import './override.scss';

export const Link = compose(composeU(withViewDefault), compose(withHref))(LinkBase);

export type LinkProps = ExtractProps<typeof Link>;
