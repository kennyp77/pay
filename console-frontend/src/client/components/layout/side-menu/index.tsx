import React, { FC, useEffect, useState, useMemo } from 'react';
import { cn } from '@bem-react/classname';
import { useRouter } from 'next/router';
import { useToggle } from 'react-use';
import { Image } from '@yandex/ui/Image/desktop';

import { SideMenuItem } from './side-menu-item';

import { Menu } from 'components/menu';
import { ChangeEvent } from 'components/menu/base';
import { Box } from 'components/box';
import { Flex } from 'components/flex';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Text } from 'components/text';
import { Icon } from 'components/icon';
import { SupportModal } from 'components/support-modal';

import { basePath, routes } from 'const';

import PaymentsIcon from 'public/icons/payments.svg';
import ServicesIcon from 'public/icons/services.svg';
import AnalyticsIcon from 'public/icons/analytics.svg';
import IntegrationIcon from 'public/icons/integration.svg';
import AboutIcon from 'public/icons/about.svg';
import SupportIcon from 'public/icons/support.svg';
import BillsIcon from 'public/icons/bills.svg';

import './index.scss';

const cnSideMenu = cn('SideMenu');

export const SideMenu: FC = () => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [supportModalOn, supportModalToggle] = useToggle(false);

  const router = useRouter();

  const sideMenuItems = useMemo(
    () => [
      {
        content: (
          <SideMenuItem
            title="О компании"
            href={routes.account.about}
            glyph={<AboutIcon />}
          />
        ),
        value: routes.account.about,
      },
      {
        content: (
          <SideMenuItem
            title="Платежи"
            href={routes.account.payments}
            glyph={<PaymentsIcon />}
          />
        ),
        value: routes.account.payments,
      },
      {
        content: (
          <SideMenuItem
            title="Сервисы"
            href={routes.account.services}
            glyph={<ServicesIcon />}
          />
        ),
        value: routes.account.services,
        disabled: true,
      },
      {
        content: (
          <SideMenuItem
            title="Аналитика"
            href={routes.registration.stepOne}
            glyph={<AnalyticsIcon />}
          />
        ),
        value: routes.registration.stepOne,
        disabled: true,
      },
      {
        items: [
          {
            content: (
              <SideMenuItem
                title="Разработчикам"
                href={routes.account.developers}
                glyph={<IntegrationIcon />}
              />
            ),
            value: routes.account.developers,
          },
          {
            content: (
              <SideMenuItem
                title="Счета"
                href={routes.account.bills}
                glyph={<BillsIcon />}
              />
            ),
            value: routes.account.bills,
          },
          {
            content: (
              <SideMenuItem
                title="Поддержка"
                glyph={<SupportIcon />}
                onClick={() => supportModalToggle(true)}
              />
            ),
            value: 'support',
          },
        ],
      },
    ],
    [supportModalToggle],
  );

  useEffect(() => {
    if (!supportModalOn) {
      sideMenuItems.map((item) => {
        if (router.asPath === item.value) {
          setValue(item.value);
        } else if (item.items) {
          item.items.map((subitem) => {
            if (router.asPath === subitem.value) {
              setValue(subitem.value);
            }
          });
        }
      });
    }
  }, [sideMenuItems, router, supportModalOn]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: ChangeEvent<{ value: any }>) => {
    setValue(event.target.value);
  };

  return (
    <Flex direction="column" className={cnSideMenu()}>
      <Row bottom={16} className={cnSideMenu('Organisation')}>
        <Col>
          <Icon url={`${basePath}/icons/organisation.svg`} />
        </Col>
        <Col>
          <Text
            className={cnSideMenu('OrganisationTitle')}
            color="secondary"
            left={8}
            weight={500}
            size={14}
          >
            Рога и копыта
          </Text>
        </Col>
      </Row>
      <Box bottom={24} className={cnSideMenu('MenuWrapper')}>
        <Menu
          size="m"
          view="default"
          width="max"
          items={sideMenuItems}
          value={value}
          onChange={handleChange}
        />
      </Box>
      <SupportModal
        visible={supportModalOn}
        onClose={() => supportModalToggle(false)}
      />
      <Row justify="center" top="auto" bottom={28}>
        <Image
          className={cnSideMenu('YaPayIcon')}
          src={`${basePath}/logo.svg`}
          alt="ya-pay"
          height="36px"
        />
      </Row>
    </Flex>
  );
};
