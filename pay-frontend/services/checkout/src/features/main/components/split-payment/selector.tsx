import React, { useMemo } from 'react';

import { cn } from '@bem-react/classname';

import QuestionSvg from '../../../../components/icons/assets/question.svg';
import { Icon } from '../../../../components/icons';
import { Link } from '../../../../components/link';
import { Row } from '../../../../components/row';
import { Text } from '../../../../components/text';
import { Tumbler } from '../../../../components/tumbler';
import { Path } from '../../../../router';

import './selector.scss';

export const cnSplitPaymentSelector = cn('SplitPaymentSelector');

const i18n = (v: string) => v;

interface SplitPaymentProps {
    size: 's' | 'm';
    iconBox?: React.ReactElement;
    disabled: boolean;
    active: boolean;
    onToggle: Sys.CallbackFn0;
}

export function SplitPaymentSelector({
    size,
    iconBox,
    active,
    disabled,
    onToggle,
}: SplitPaymentProps) {
    const aboutSplit = useMemo(
        () => (
            <Link href={Path.AboutSplit}>
                <Icon className={cnSplitPaymentSelector('Question', { size })} svg={QuestionSvg} />
            </Link>
        ),
        [size],
    );

    if (disabled) {
        return (
            <Row align="start" as="label" className={cnSplitPaymentSelector({ disabled })}>
                {iconBox}
                <Text variant="s">
                    {i18n('Выберите оплату картой, чтобы активировать оплату частями')}
                </Text>
                <Row.Spacer />
                {aboutSplit}
            </Row>
        );
    }

    return (
        <Row align="center" as="label" className={cnSplitPaymentSelector({ disabled })}>
            {iconBox}
            <Text inline color="black" variant={size}>
                {i18n('Оплатить частями')}
            </Text>
            {aboutSplit}
            <Row.Spacer />
            <Tumbler
                variant="split"
                view="default"
                size="m"
                disabled={disabled}
                checked={active}
                onChange={onToggle}
            />
        </Row>
    );
}
