import React, { useCallback, useMemo } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Box } from '../../components/box';
import { Col } from '../../components/col';
import { Form, FormInput, FormSubmit } from '../../components/form';
import { Panel, PanelHeader } from '../../components/panel';
import { PanelWrapper } from '../../components/panel/wrapper';
import { Text } from '../../components/text';
import { history, Path } from '../../router';
import { createContact, getAddContactStatus } from '../../store/contacts';

import { fields, initialValues, validationSchema } from './helpers/forms';

interface ContactsAddProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
    initialFormValues?: Checkout.ContactFormData;
    needsObFooter?: boolean;
}

const completeCallbackDefault = () => history.push(Path.Main);

export function ContactsAdd({
    obHeader,
    completeCallback = completeCallbackDefault,
    initialFormValues,
    needsObFooter = false,
}: ContactsAddProps) {
    const createContactFn = useService(createContact);
    const addStatus = useSelector(getAddContactStatus);

    const onSubmit = useCallback(
        (values) => {
            createContactFn(values, completeCallback);
        },
        [createContactFn, completeCallback],
    );

    const header = useMemo(() => {
        return obHeader || <PanelHeader title="Получатель" backHref={Path.Contacts} />;
    }, [obHeader]);

    return (
        <PanelWrapper>
            <Form
                initialValues={initialFormValues || initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {() => (
                    <Panel
                        header={header}
                        footer={
                            <FormSubmit
                                size="l"
                                width="max"
                                progress={asyncData.isPending(addStatus)}
                            >
                                Сохранить
                            </FormSubmit>
                        }
                        needsObFooter={needsObFooter}
                    >
                        <Box>
                            <Text variant="s">
                                Информация о получателе сохранится в Yandex Pay, чтобы в следующий
                                раз не вводить его заново
                            </Text>
                        </Box>
                        <Col gap="m" top="m">
                            <FormInput {...fields.firstName} />
                        </Col>
                        <Col gap="m" top="m">
                            <FormInput {...fields.lastName} />
                        </Col>
                        <Col gap="m" top="m">
                            <FormInput {...fields.phoneNumber} />
                        </Col>
                        <Col gap="m" top="m">
                            <FormInput {...fields.email} />
                        </Col>
                    </Panel>
                )}
            </Form>
        </PanelWrapper>
    );
}
