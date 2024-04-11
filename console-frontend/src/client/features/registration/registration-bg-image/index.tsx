import React, { FC } from 'react';
import { ExtractProps, IClassNameProps } from '@bem-react/core';
import { cn } from '@bem-react/classname';
import { Image } from '@yandex/ui/Image/desktop';
import { useToggle } from 'react-use';

import { Button } from 'components/button';
import { Icon } from 'components/icon';
import { SupportModal } from 'components/support-modal';

import { basePath } from 'const';
import './index.scss';

const cnRegistrationBgImage = cn('RegistrationBgImage');

interface IRegistrationBgImageProps extends IClassNameProps {
  className?: string;
}

export const RegistrationBgImage: FC<
  React.PropsWithChildren<
    IRegistrationBgImageProps & React.HTMLAttributes<HTMLElement>
  >
> = ({ className, ...props }) => {
  const [modalVisibility, toggleModalVisibility] = useToggle(false);

  return (
    <div className={cnRegistrationBgImage(null, [className])} {...props}>
      <Image
        className={cnRegistrationBgImage('Img')}
        src={`${basePath}/registration-img.webp`}
        src2x={`${basePath}/registration-img_2x.webp`}
        fallbackSrc="/registration-img.png"
        alt=""
      />
      <Button
        className={cnRegistrationBgImage('Button')}
        onClick={() => toggleModalVisibility(true)}
        view="raised"
        variant="compact"
      >
        <Icon
          url={`${basePath}/icons/chat.svg`}
          className={cnRegistrationBgImage('ButtonIcon')}
        />
        Нужна помощь? Напишите нам
      </Button>
      <SupportModal
        visible={modalVisibility}
        onClose={() => toggleModalVisibility(false)}
      />
    </div>
  );
};

export type RegistrationBgImageProps = ExtractProps<typeof RegistrationBgImage>;
