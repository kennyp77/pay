import React, { FC } from 'react';
import { cn } from '@bem-react/classname';
import { useToggle } from 'react-use';

import { Box } from 'components/box';
import { Row } from 'components/row';
import { Col } from 'components/col';
import { Text } from 'components/text';
import { Button } from 'components/button';
import { Image } from '@yandex/ui/Image/desktop';
import { Icon } from 'components/icon';
import { Flex } from 'components/flex';
import { ProviderApplicationModal } from 'features/registration/provider-application-modal';

import {
  ProviderFutureProps,
  ProviderBankItemnProps,
} from 'types/providers-type';

import { basePath } from 'const';
import './index.scss';

type FutureProviderCardProps = ProviderFutureProps & {
  bankList: ProviderBankItemnProps[] | null;
};

const cnFuturePCard = cn('FutureProviderCard');

export const FutureProviderCard: FC<FutureProviderCardProps> = ({
  name,
  logo_url: logoUrl,
  info_text: infoText,
  is_soon,
  //commission,
  link,
  bankList,
}) => {
  const [providerAppOn, providerAppOnToggle] = useToggle(false);

  const handleOpenProviderApplicationModal = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    providerAppOnToggle(true);
  };

  return (
    <Box as="section" className={cnFuturePCard()}>
      <Row>
        <Col align="start">
          <Flex>
            <Col>
              <Image
                className={cnFuturePCard('Logo')}
                src={`${basePath}${logoUrl}`}
                alt={name}
              />
            </Col>
            {is_soon ? (
              <Col align="center">
                <Box
                  align="center"
                  left={16}
                  className={cnFuturePCard('SoonBadge')}
                >
                  <Text
                    size={12}
                    weight={700}
                    color="secondary"
                    transform="uppercase"
                  >
                    Скоро
                  </Text>
                </Box>
              </Col>
            ) : null}
          </Flex>
          <Text
            isContent
            dangerouslySetInnerHTML={{ __html: infoText }}
            top={24}
            bottom={0}
            className={cnFuturePCard('InfoTex')}
          />
        </Col>
        {/* {commission ? (
          <Box className={cnFuturePCard('Fact')}>
            <Box>
              <Text size={14}>от </Text>
              <Text variant="header_l" weight={700}>
                {commission}&#8239;%
              </Text>
            </Box>
            <Text as="div" top={4} color="tertiary" size={12}>
              комиссия за платежи
            </Text>
          </Box>
        ) : null} */}
      </Row>
      {!is_soon ? (
        <>
          <Box top={16}>
            <Text as="p" color="secondary">
              Пул банков-эквайеров для бесперебойного приема ваших платежей:
            </Text>
            {bankList ? (
              <Row gap={8} top={16} bottom={16} wrap="wrap">
                {bankList.map((item, index) => (
                  <Image
                    key={index}
                    className={cnFuturePCard('BankLogo')}
                    src={`${basePath}/${item.logo_url}`}
                    alt={item.title}
                  />
                ))}
              </Row>
            ) : null}
          </Box>
          {
            link ? (
              <Button
                type="link"
                url={link}
                className={cnFuturePCard('JoinBtn', { withoutOutline: true })}
                variant="outlined"
                view="pseudo"
                target="_blank"
              >
                <Text right={8}>Подробнее</Text>
                <Icon size={24} url={`${basePath}/icons/external.svg`} />
              </Button>
            ) : null
            /* TODO: Отключено перед первым выпуском в прод. Позже вернуть обратно
          (
            <>
              <Button
                onClick={handleOpenProviderApplicationModal}
                className={cnFuturePCard('JoinBtn')}
                variant="outlined"
                view="pseudo"
              >
                Подключить
              </Button>
              <ProviderApplicationModal
                providerName={name}
                image={logoUrl}
                isOpen={providerAppOn}
                infoText={infoText}
                onClose={() => providerAppOnToggle(false)}
              />
            </>
          ) */
          }
        </>
      ) : null}
    </Box>
  );
};
