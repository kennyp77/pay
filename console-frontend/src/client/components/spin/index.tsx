import { compose, ExtractProps } from '@bem-react/core';

import { Spin as SpinDesktop, withSizeXXS } from '@yandex/ui/Spin/desktop';

import { withVariantBlue } from './_variant/blue';

export const Spin = compose(withSizeXXS, withVariantBlue)(SpinDesktop);

export type SpinProps = ExtractProps<typeof Spin>;
