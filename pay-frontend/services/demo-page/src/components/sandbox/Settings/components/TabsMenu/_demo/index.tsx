import { withBemMod } from '@bem-react/core';
import { cnTabsMenu } from '@yandex-lego/components/TabsMenu';

import './index.css';

export interface TabsMenuViewDemoProps {
    view?: 'demo';
}

export const withViewDemo = withBemMod<TabsMenuViewDemoProps>(cnTabsMenu(), {
    view: 'demo',
});
