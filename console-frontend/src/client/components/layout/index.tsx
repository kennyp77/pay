import React, { FC, useEffect } from 'react';
import { cn } from '@bem-react/classname';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import { Row } from 'components/row';
import { Col } from 'components/col';
import { Text } from 'components/text';
import { Box } from 'components/box';
import { Flex } from 'components/flex';
import { SideMenu } from './side-menu';
import { Header } from './header';

import { useCheckPartner } from 'client/hooks/useCheckPartner';
import { routes } from 'const';

import { getPartnerSubmitSelector } from 'store/partner-submit/selectors';

import './index.scss';

const cnLayout = cn('Layout');

export const Layout: FC = ({ children }) => {
  const router = useRouter();
  const partnerSubmit = useSelector(getPartnerSubmitSelector);

  useCheckPartner();

  useEffect(() => {
    if (partnerSubmit && !partnerSubmit?.merchant_id) {
      router.push({ pathname: routes.registration.stepOne });
    }
  }, [partnerSubmit, router]);

  return (
    <main className={cnLayout()}>
      <Row className={cnLayout('Wrapper')}>
        <Col className={cnLayout('NavigationContainer')}>
          <SideMenu />
        </Col>
        <Col className={cnLayout('MainContainer')} grow>
          <Box>
            <Flex direction="column" className={cnLayout('InnerContainer')}>
              <Header />
              <Flex direction="column" right={32} left={20}>
                {children}
              </Flex>
              <Row top="auto" justify="center">
                <Col top={40} bottom={56} right={32} left={20}>
                  <Text variant="label">
                    © 2001–{new Date().getFullYear() || '2022'} ООО «Яндекс»
                  </Text>
                </Col>
              </Row>
            </Flex>
          </Box>
        </Col>
      </Row>
    </main>
  );
};
