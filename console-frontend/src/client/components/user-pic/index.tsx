import { compose, composeU, ExtractProps } from '@bem-react/core';

import {
  UserPic as UserPicDesktop,
  withSizeM,
} from '@yandex/ui/UserPic/desktop';

import { withSizeS } from './_size/small';

/* TODO: логика для UserPic */

export const UserPic = compose(composeU(withSizeS, withSizeM))(UserPicDesktop);

export type UserPicProps = ExtractProps<typeof UserPic>;
