import { useState, useRef } from 'react';
import { NextPage } from 'next';
import { cn } from '@bem-react/classname';
import { Wrapper } from '@yandex/ui/MessageBox/MessageBox';

import { MessageBox } from 'components/message-box';
import { Row } from 'components/row';
import { Icon } from 'components/icon';
import { Button } from 'components/button';
import { Col } from 'components/col';
import { FilterCalendar } from 'features/global/filters/filter-calendar';
import { FilterDropdown } from 'features/global/filters/filter-dropdown';
import { FilterSearch } from 'features/global/filters/filter-search';
import { FilterPeriod } from 'features/analytics/filter-period';
import { OrderInfoModal } from 'features/payments/order-info-modal';
import { Pagination } from 'components/pagination';

import { basePath } from 'const';
import './index.scss';

const errorWhiteIcon = () => (
  <Icon size={20} url={`${basePath}/icons/error-white.svg`} />
);

const clockIcon = () => <Icon size={20} url={`${basePath}/icons/clock.svg`} />;

const freezeIcon = () => (
  <Icon size={20} url={`${basePath}/icons/freeze.svg`} />
);

const pauseIcon = () => <Icon size={20} url={`${basePath}/icons/pause.svg`} />;

const supportButton = () => (
  <Button variant="message-box-white">Связаться со службой поддержки</Button>
);

const finishButton = () => (
  <Button variant="default" size="m">
    Завершить регистрацию
  </Button>
);

const saveButton = () => (
  <Button variant="default" size="m">
    Сохранить
  </Button>
);

export const cnExamplePage = cn('Example');

export const ExamplePage: NextPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [popupVisibility, setPopupVisibility] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <main>
      <div className={cnExamplePage()} ref={wrapperRef}>
        {/* new alerts start */}
        <Row bottom={20}>
          <MessageBox view="default" variant="freeze">
            <Wrapper leading={freezeIcon()} trailing={supportButton()}>
              <b>Аккаунт заморожен.</b> Чтобы продолжить использование Yandex
              Pay, пожалуйста, пришлите фото своего паспорта в службу поддержки
            </Wrapper>
          </MessageBox>
        </Row>
        <Row bottom={20}>
          <MessageBox view="default" variant="critical">
            <Wrapper leading={pauseIcon()} trailing={supportButton()}>
              <b>Возникла задолженность.</b> Сейчас возникла задолженность по
              оплате сервиса. Пожалуйста, погасите задолженность в кратчайшие
              сроки, чтобы продолжить принимать заказы через Yandex Pay
            </Wrapper>
          </MessageBox>
        </Row>
        <Row bottom={20}>
          <MessageBox view="default" variant="check">
            <Wrapper leading={clockIcon()}>
              <b>Проверяем данные.</b> Уже сейчас вы можете принимать заказы
              через Yandex Pay. О результате модерации сообщим вам по эл. почте
              и в смс
            </Wrapper>
          </MessageBox>
        </Row>
        <Row bottom={20}>
          <MessageBox view="default" variant="finish">
            <Wrapper leading={errorWhiteIcon()} trailing={finishButton()}>
              Чтобы начать использовать Yandex Pay почти всё готово. Осталось
              завершить процесс регистрации
            </Wrapper>
          </MessageBox>
        </Row>
        {popupVisibility && (
          <MessageBox
            view="default"
            variant="popup-default"
            hasClose={true}
            onClose={() => setPopupVisibility(false)}
          >
            <Wrapper trailing={saveButton()}>Несохраненные изменения</Wrapper>
          </MessageBox>
        )}
        {/* new alerts end */}

        {/* filters for payments start */}
        <Row justify="between" gap={8} bottom={20}>
          <Col>
            <FilterCalendar selectData={() => {}} />
          </Col>
          <Col>
            <Row gap={8}>
              <FilterSearch onChange={() => {}} />
              <FilterDropdown
                buttonText="Все виды оплат"
                options={[
                  { content: 'Yandex Pay', value: 'Yandex Pay' },
                  { content: 'Сплит', value: 'Сплит' },
                ]}
                hasDropdownIcon
              />
              <FilterDropdown
                buttonText="Все статусы"
                options={[
                  { content: 'Оплачен', value: 'Оплачен' },
                  { content: 'Возвращен', value: 'Возвращен' },
                  {
                    title: 'Ошибки',
                    items: [
                      {
                        content: 'Недостаточно средств',
                        value: 'Недостаточно средств',
                      },
                      {
                        content: 'Неверные реквизиты',
                        value: 'Неверные реквизиты',
                      },
                    ],
                  },
                ]}
                hasDropdownIcon
              />
              <FilterDropdown
                options={[
                  {
                    content: 'ID заказа',
                    value: 'ID заказа',
                  },
                  { content: 'Сумма', value: 'Сумма' },
                  { content: 'Статус', value: 'Статус' },
                ]}
                iconUrl={`${basePath}/icons/settings.svg`}
              />
              <FilterDropdown
                options={[
                  {
                    content: (
                      <a download href="#">
                        Скачать в CSV
                      </a>
                    ),
                    value: 'Скачать в CSV',
                  },
                  {
                    content: (
                      <a download href="#">
                        Скачать в XLSX
                      </a>
                    ),
                    value: 'Скачать в XLSX',
                  },
                  {
                    content: (
                      <a download href="#">
                        Скачать в PDF
                      </a>
                    ),
                    value: 'Скачать в PDF',
                  },
                ]}
                iconUrl={`${basePath}/icons/load.svg`}
                notCheckOptions
              />
            </Row>
          </Col>
        </Row>
        {/* filters for payments end */}

        {/* filters for analytic start */}
        <Row bottom={20}>
          <FilterPeriod />
        </Row>
        {/* filters for analytic end */}

        {/* popup for payments start */}
        <Row bottom={20}>
          <Button view="action" size="m" onClick={() => setOpenModal(true)}>
            Детали заказа
          </Button>
        </Row>
        <OrderInfoModal
          id={null}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
        {/* popup for payments end */}
        <Row bottom={20}>
          <Pagination
            totalCount={143}
            currentPage={currentPage}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </Row>
      </div>
    </main>
  );
};
