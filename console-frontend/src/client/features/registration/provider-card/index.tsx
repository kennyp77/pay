import React, { FC } from 'react';
import { useToggle } from 'react-use';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';

import { Text } from 'components/text';
import { Block } from 'components/block';
import { Spin } from 'components/spin';

import { basePath } from 'const';
import './index.scss';

type ProviderCardProps = {
  checked?: boolean;
  onClick?: () => void;
  logo?: string;
  name?: string;
  small?: boolean;
};

const cnProviderCard = cn('ProviderCard');

export const ProviderCard: FC<ProviderCardProps> = ({
  checked,
  name,
  logo,
  onClick,
  small,
}) => {
  const [loading, loadingToggle] = useToggle(false);

  const selectCard = () => {
    // TODO: Здесь будет обработка выбора карточки
    loadingToggle(true);
    setTimeout(() => {
      loadingToggle(false);
      if (onClick) {
        onClick();
      }
    }, 200);
  };

  return (
    <Block
      className={cnProviderCard({ checked, small })}
      padding="16"
      radius="16"
      onClick={selectCard}
      as="button"
      type="button"
    >
      <Spin
        className={cnProviderCard('Spin')}
        progress={loading}
        variant="blue"
        size="xxs"
      />
      <Image
        className={cnProviderCard('Logo')}
        src={`${basePath}${logo}`}
        alt=""
      />
      <Text className={cnProviderCard('Text')} color="primary" size={14}>
        {name}
      </Text>
    </Block>
  );
};
