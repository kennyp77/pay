import React, { useMemo } from 'react';

import { numberWord } from '@trust/utils/string';

import { Col } from '../../../components/col';
import { Row } from '../../../components/row';
import { SpacerSize } from '../../../components/spacer-mods/typings';
import { Text } from '../../../components/text';

const i18n = (v: string) => v;

const pluralizeDays = (v: string, options: { count: number }) => {
    return `${options.count} ${numberWord(options.count, ['день', 'дня', 'дней'])}`;
};

const formatDate = new Intl.DateTimeFormat('ru', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});

export function PickupInfo({
    pickupPoint,
    middle = 'l',
    top = 'l',
}: {
    pickupPoint: Sdk.PickupPoint;
    middle?: SpacerSize;
    top?: SpacerSize;
}): React.ReactElement {
    const deliveryDate = useMemo(
        () => formatDate.format(pickupPoint.deliveryDate),
        [pickupPoint.deliveryDate],
    );

    const contacts = useMemo(() => pickupPoint.info?.contacts ?? [], [pickupPoint.info?.contacts]);
    const schedule = useMemo(() => pickupPoint.info?.schedule ?? [], [pickupPoint.info?.schedule]);

    return (
        <React.Fragment>
            <Col bottom={middle}>
                {/* Информация о сроке доставки*/}
                <Text variant="m">{`${i18n('Будет доступно:')} ${deliveryDate}`}</Text>

                {/* Информация о сроке хранения */}
                {pickupPoint.storagePeriod && (
                    <Text variant="m" top={top}>
                        {`${i18n('Срок хранения')}: ${pluralizeDays('{count} дней', {
                            count: pickupPoint.storagePeriod,
                        })}`}
                    </Text>
                )}
            </Col>

            {/* Контактная информация */}
            {contacts.map((phoneNumber) => (
                <Row key={phoneNumber} bottom="xs">
                    <Text color="grey" style={{ width: '128px' }}>
                        {i18n('Телефон')}
                    </Text>
                    <Text color="grey">{phoneNumber}</Text>
                </Row>
            ))}

            {/* Информация о времени работы */}
            {schedule.map((schedule) => (
                <Row key={schedule.label} bottom="xs">
                    <Text color="grey" style={{ width: '128px' }}>
                        {schedule.label}
                    </Text>
                    <Text color="grey">
                        {schedule.timeFrom} — {schedule.timeTo}
                    </Text>
                </Row>
            ))}
        </React.Fragment>
    );
}
