import { createService } from '@yandex-pay/react-services';

import { RootState } from '..';
import { watchPickupPoints } from '../pickup';

export const initializeWatchers = createService<RootState>(async ({ dispatch }) => {
    dispatch(watchPickupPoints());
});
