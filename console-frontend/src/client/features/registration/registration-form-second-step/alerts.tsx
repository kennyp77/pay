import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Wrapper } from '@yandex/ui/MessageBox/desktop/bundle';

import { Icon } from 'components/icon';
import { Link } from 'components/link';
import { Row } from 'components/row';
import { MessageBox } from 'components/message-box';

import { getPartnerDataSelector } from 'store/partner-data/selectors';
import { ProviderApplicationState } from 'types/providers-type';
import { basePath, routes } from 'const';

type ProviderApplicationModalProps = {
  state?: ProviderApplicationState;
  providerName?: string;
};

const successIcon = () => (
  <Icon url={`${basePath}/icons/message-box-success.svg`} />
);

const clockIcon = () => <Icon url={`${basePath}/icons/clock.svg`} />;

const errorRedIcon = () => <Icon url={`${basePath}/icons/error-red.svg`} />;

const toAccountButton = () => (
  <Link
    variant="grey"
    href={`${basePath}${routes.account.about}`}
    target="_blank"
  >
    В личный кабинет
    <Icon url={`${basePath}/icons/to-account.svg`} />
  </Link>
);

export const Alerts: FC<ProviderApplicationModalProps> = ({
  state,
  providerName,
}) => {
  const partnerData = useSelector(getPartnerDataSelector);

  return (
    <React.Fragment>
      <Row bottom={20}>
        <MessageBox view="default" variant="success">
          <Wrapper leading={successIcon()} trailing={toAccountButton()}>
            Вы можете перейти в личный кабинет и завершить регистрацию позднее
          </Wrapper>
        </MessageBox>
      </Row>
      {state === ProviderApplicationState.SUCCESSED && (
        <Row bottom={20}>
          <MessageBox view="default" variant="success">
            <Wrapper leading={successIcon()}>
              Провайдер {providerName} одобрил заявку!
            </Wrapper>
          </MessageBox>
        </Row>
      )}
      {state === ProviderApplicationState.PROCESSING && (
        <Row bottom={20}>
          <MessageBox view="default" variant="warning">
            <Wrapper leading={clockIcon()}>
              Подключаем провайдера <b>{providerName}</b>. Это займет 1-2 дня. О
              результате сообщим на <b>{partnerData?.email}</b>
            </Wrapper>
          </MessageBox>
        </Row>
      )}
      {state === ProviderApplicationState.CANCELED && (
        <Row bottom={20}>
          <MessageBox view="default" variant="error">
            <Wrapper leading={errorRedIcon()}>
              Подключение к <b>{providerName}</b> не состоялось. Вы можете
              попробовать подключить этого или другого провайдера повторно.
            </Wrapper>
          </MessageBox>
        </Row>
      )}
    </React.Fragment>
  );
};
