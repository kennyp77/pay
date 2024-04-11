import React, { useCallback } from 'react';

import { Button } from '../../components/button';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { history, Path } from '../../router';

const i18n = (v: string) => v;

export const SplitAboutPlus: React.FC = () => {
    const goMain = useCallback(() => history.push(Path.Main), []);

    return (
        <Panel
            header={
                <PanelHeader
                    closeHref={Path.Main}
                    title={
                        <Text inline variant="header-l">
                            {i18n('Баллы плюса')}
                        </Text>
                    }
                />
            }
            footer={
                <Button
                    onClick={goMain}
                    view="action"
                    variant="primary"
                    size="l"
                    width="max"
                    pin="round-m"
                >
                    {i18n('Понятно')}
                </Button>
            }
        >
            <Text>
                {i18n('Баллы будут зачислены на Ваш счет после оплаты последней части платежа.')}
            </Text>
            <Text top="l">
                {i18n(
                    'Зачисление происходит в установленные сроки. Максимальное количество баллов, доступных к начислению, в календарный месяц - не более 3000.',
                )}
            </Text>
        </Panel>
    );
};
