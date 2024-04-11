import { FC, useCallback, useEffect, useMemo } from 'react';
import { useToggle } from 'react-use';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@bem-react/classname';

import { Block } from 'components/block';
import { Button } from 'components/button';
import { Box } from 'components/box';
import { Flex } from 'components/flex';
import { Modal } from 'components/modal';
import { Row } from 'components/row';
import { Table, TableAlign } from 'components/table';
import { Text } from 'components/text';
import { TextinputClipboard } from 'components/text-input-clipboard';
import { Icon } from 'components/icon';
import { SubmitError } from 'components/submit-error';

import {
  getApiKeysSelector,
  getNewApiKeySelector,
  getApiKeyErrorSelector,
} from 'store/developers/selectors';
import { getPartnerSubmitSelector } from 'store/partner-submit/selectors';
import {
  deleteApiKey,
  fetchApiKeys,
  postApiKey,
} from 'store/developers/actions';
import { ApiKeyType } from 'types/api-keys';
import { getDatetime } from 'helpers/utils';

import PlusFilledIcon from '/public/icons/plus-filled.svg';

import { basePath } from 'const';
import './index.scss';

const cnDevelopersApiKeys = cn('DevelopersApiKeys');

const MaxCountApiKeys = 3;

const IconAddKey = () => (
  <Icon size={20}>
    <PlusFilledIcon />
  </Icon>
);

export const DevelopersApiKeys: FC = () => {
  const dispatch = useDispatch();
  const apiKeysList = useSelector(getApiKeysSelector);
  const newApiKey = useSelector(getNewApiKeySelector);
  const partnerSubmit = useSelector(getPartnerSubmitSelector);
  const apiKeyError = useSelector(getApiKeyErrorSelector);

  const [modalVisibility, toggleModalVisibility] = useToggle(false);

  const IconDeleteKey = useCallback(
    (className: string) => (
      <Icon
        className={className}
        size={16}
        url={`${basePath}/icons/trash.svg`}
      />
    ),
    [],
  );

  useEffect(() => {
    if (partnerSubmit?.merchant_id) {
      dispatch(fetchApiKeys({ merchant_id: partnerSubmit.merchant_id }));
    }
  }, [dispatch, partnerSubmit]);

  const handleDeleteKey = useCallback(
    (keyId: ApiKeyType['key_id']) => {
      if (partnerSubmit?.merchant_id) {
        dispatch(
          deleteApiKey({
            merchant_id: partnerSubmit.merchant_id,
            key_id: keyId,
          }),
        );
      }
    },
    [dispatch, partnerSubmit],
  );

  const handlePostKey = useCallback(() => {
    if (partnerSubmit?.merchant_id) {
      dispatch(postApiKey({ merchant_id: partnerSubmit?.merchant_id }));
      toggleModalVisibility(true);
    }
  }, [dispatch, toggleModalVisibility, partnerSubmit]);

  const [tableBody, tableHeading] = useMemo(() => {
    const body = apiKeysList
      ? apiKeysList.map((apiKey) => ({
          id: apiKey.key_id,
          datetime: getDatetime(apiKey.created),
          deleteButton: (
            <Button
              variant="cleared-with-border-effects"
              icon={IconDeleteKey}
              onClick={() => handleDeleteKey(apiKey.key_id)}
            />
          ),
        }))
      : [];

    const heading = [
      { title: 'ID ключа' },
      { title: 'Дата выпуска' },
      { align: TableAlign.right, title: '' },
    ];

    return [body, heading];
  }, [IconDeleteKey, apiKeysList]);

  return (
    <Block shadow radius={24} bg="white" bottom={24}>
      <Row align="stretch" justify="center">
        <Box className={cnDevelopersApiKeys()}>
          <Text variant="header_m" as="h2" bottom={20}>
            Ключи API
          </Text>
          <Text color="secondary" as="p" size={14} bottom={20}>
            Ключи API нужны для интеграции Yandex Pay Checkout с вашим
            провайдером платежей. Максимум можно выпустить до 3-х ключей.
          </Text>
          <Flex direction="column">
            <Table heading={tableHeading} data={tableBody} />
            {apiKeyError ? <SubmitError /> : null}
          </Flex>
          <Row top={20} gap={12} align="center">
            <Button
              variant="default"
              size="l"
              onClick={handlePostKey}
              disabled={apiKeysList?.length === MaxCountApiKeys}
            >
              <IconAddKey />
              Выпустить ключ
            </Button>
            {apiKeysList?.length === MaxCountApiKeys ? (
              <Text
                className={cnDevelopersApiKeys('WarningText')}
                color="tertiary"
                size={12}
              >
                Максимум 3 ключа. Чтобы выпустить новый ключ, удалите один из
                старых.
              </Text>
            ) : null}
          </Row>
        </Box>
      </Row>

      {/* modal add key start */}
      {newApiKey ? (
        <Modal
          className={cnDevelopersApiKeys('Modal')}
          variant="no-cross"
          theme="normal"
          visible={modalVisibility}
          contentPadding={0}
          onClose={() => toggleModalVisibility(false)}
        >
          <Block padding={24}>
            <Text align="center" as="h2">
              Новый API ключ
            </Text>
            <Row top={20}>
              <TextinputClipboard
                label="ID ключа"
                value={newApiKey.key_id}
                variant="bordered"
              />
            </Row>
            <Row top={20} bottom={20}>
              <TextinputClipboard
                label="Ключ"
                value={newApiKey.value}
                variant="bordered"
              />
            </Row>
          </Block>

          <Block padding={24} shadow>
            <Text align="center" as="p" bottom={20}>
              Сохраните значение ключа в надежно защищенное место.
              <br />В случае утраты значения ключа, его придется выпускать
              заново.
            </Text>
            <Row justify="center">
              <Button
                variant="default"
                size="l"
                onClick={() => {
                  toggleModalVisibility(false);
                }}
              >
                Сохранил себе
              </Button>
            </Row>
          </Block>
        </Modal>
      ) : null}

      {/* modal add key end */}
    </Block>
  );
};
