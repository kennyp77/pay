import React from 'react';

import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';

import { Col } from '../../../../components/col';
import { Popup } from '../../../../components/popup';
import { Text } from '../../../../components/text';
import { isTouchTemplate } from '../../../../helpers/app';
import { getIsOnboardingActive } from '../../../../store/app';

import './styles.scss';

interface NoPlacemarksPopupProps {
    visible?: boolean;
    variant: 'no-placemarks' | 'large-zoom';
}

const cnNoPlacemarksPopup = cn('NoPlacemarksPopup');

const i18n = (v: string) => v;

const isTouch = isTouchTemplate();

export function NoPlacemarksPopup({ visible, variant = 'no-placemarks' }: NoPlacemarksPopupProps) {
    const isObActive = useSelector(getIsOnboardingActive);

    return (
        <Popup
            view="default"
            direction={isTouch ? 'bottom-end' : 'right-start'}
            visible={visible}
            hasTail
            className={cnNoPlacemarksPopup({
                platform: isTouch ? 'touch' : 'desktop',
                ob: isObActive,
            })}
        >
            <Col top="s" bottom="s" left="m" right="m">
                {variant === 'no-placemarks' ? (
                    <React.Fragment>
                        <Text color="white" variant="header-s" bottom="s">
                            {i18n('Пункты выдачи')} <br />
                            {i18n('не найдены')}
                        </Text>
                        <Text color="white" variant="s">
                            {i18n('Измените масштаб или')} <br />
                            {i18n('выберите доставку курьером')}
                        </Text>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Text color="white" variant="header-s" bottom="s">
                            {i18n('Слишком большой')} <br />
                            {i18n('масштаб')}
                        </Text>
                        <Text color="white" variant="s">
                            {i18n('Уменьшите масштаб, чтобы')} <br />
                            {i18n('загрузить новые точки самовывоза')}
                        </Text>
                    </React.Fragment>
                )}
            </Col>
        </Popup>
    );
}
