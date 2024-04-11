import { compose, ExtractProps } from '@bem-react/core';

import {
  Link as LinkDesktop,
  withViewDefault,
  withPseudo,
} from '@yandex/ui/Link/desktop';

import { withVariantGrey } from './_variant/grey';

export const Link = compose(
  withViewDefault,
  withPseudo,
  withVariantGrey,
)(LinkDesktop);

export type LinkProps = ExtractProps<typeof Link>;
