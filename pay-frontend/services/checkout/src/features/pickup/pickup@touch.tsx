import * as React from 'react';
import { memo } from 'react';

import { asyncData } from '@trust/utils/async';
import { useSelector } from 'react-redux';

import { Box } from '../../components/box';
import { ButtonWrapper } from '../../components/button-wrapper';
import { DrawerLayout } from '../../components/layout/drawer@touch';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { history, Path } from '../../router';
import { getPickupPointsStatus } from '../../store/pickup';

import { PickupAddress } from './components/address';
import { PickupLoader } from './components/pickup-loader';
import { PickupContainer } from './pickup-container';

import './pickup@touch.scss';

export interface PickupProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
}

const completeCallbackDefault = () => history.push(Path.Main);

const i18n = (v: string) => v;

export const PickupTouch: React.FC<PickupProps> = memo(function Pickup({
    obHeader,
    completeCallback = completeCallbackDefault,
}: PickupProps) {
    const pickupPointsStatus = useSelector(getPickupPointsStatus);

    const [selectAddress, setSelectAddress] = React.useState(false);

    const addressStateChange = React.useCallback(() => {
        setSelectAddress((prev) => !prev);
    }, []);

    return (
        <PickupContainer>
            <Box top="m" left="l" right="l" bottom="xl">
                {asyncData.isNotComplete(pickupPointsStatus) && <PickupLoader />}

                <ButtonWrapper onClick={addressStateChange} width="max">
                    <PickupAddress size="s" disabled />
                </ButtonWrapper>
            </Box>

            {selectAddress && (
                <DrawerLayout fullHeight zIndexGroupLevel={1}>
                    <Panel
                        header={
                            <PanelHeader
                                title={
                                    <Text variant="header-m">{i18n('Поиск точек самовывоза')}</Text>
                                }
                                closeAction={addressStateChange}
                            />
                        }
                    >
                        <PickupAddress onSelect={addressStateChange} />
                    </Panel>
                </DrawerLayout>
            )}
        </PickupContainer>
    );
});
