import React, { FC } from 'react';
import { cn } from '@bem-react/classname';
import Link from 'next/link';

import { Link as BaseLink } from 'components/link';
import { Text } from 'components/text';
import { Icon } from 'components/icon';

import './index.scss';

interface SideMenuItemProps {
  title: string;
  href?: string;
  glyph: JSX.Element;
  onClick?: () => void;
}

const cnSideMenuItem = cn('SideMenuItem');

const SideMenuItemInner = React.forwardRef<unknown, SideMenuItemProps>(
  ({ title, glyph, href, onClick }, _ref) => {
    return (
      <BaseLink
        className={cnSideMenuItem()}
        href={href}
        pseudo={!href}
        onClick={onClick}
      >
        <Icon size={16} className={cnSideMenuItem('Icon')}>
          {glyph}
        </Icon>
        <Text className={cnSideMenuItem('Title')}>{title}</Text>
      </BaseLink>
    );
  },
);

export const SideMenuItem: FC<SideMenuItemProps> = (props) => {
  return (
    <>
      {props.href ? (
        <Link href={props.href} passHref>
          <SideMenuItemInner {...props} />
        </Link>
      ) : (
        <SideMenuItemInner {...props} />
      )}
    </>
  );
};
