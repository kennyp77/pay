import React, { useCallback, useMemo } from 'react';

import { asyncData } from '@trust/utils/async';
import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';
import { useToggle } from 'react-use';

import { Col } from '../../components/col';
import { Form, FormInput, FormSubmit } from '../../components/form';
import { Panel, PanelHeader } from '../../components/panel';
import { PanelWrapper } from '../../components/panel/wrapper';
import { isPayOwner } from '../../helpers/contacts';
import { history, Path } from '../../router';
import {
    getContactFormData,
    getContactById,
    getEditContactStatus,
    updateContact,
    getContactList,
} from '../../store/contacts';

import { ContactDelete } from './delete';
import { fields, initialValues, validationSchema } from './helpers/forms';

interface ContactsEditProps {
    contactId: string;
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
    needsObFooter?: boolean;
}

const completeCallbackDefault = () => history.push(Path.Main);

export function ContactsEdit({
    contactId,
    obHeader,
    completeCallback = completeCallbackDefault,
    needsObFooter = false,
}: ContactsEditProps) {
    const [confirmRemove, toggleConfirmRemove] = useToggle(false);
    const editStatus = useSelector(getEditContactStatus);
    const contactEditData = useSelector(getContactFormData)(contactId);
    const contact = useSelector(getContactById)(contactId);
    const contactList = useSelector(getContactList);

    const updateContactFn = useService(updateContact);

    const onSubmit = useCallback(
        (values) => {
            updateContactFn(contactId, values, completeCallback);
        },
        [updateContactFn, contactId, completeCallback],
    );

    const header = useMemo(
        () =>
            obHeader || (
                <PanelHeader
                    title="Изменить данные"
                    backHref={Path.Contacts}
                    deleteAction={
                        isPayOwner(contact) && contactList.length > 1
                            ? toggleConfirmRemove
                            : undefined
                    }
                />
            ),
        [contact, obHeader, toggleConfirmRemove, contactList],
    );

    return (
        <PanelWrapper>
            <Form
                initialValues={contactEditData || initialValues}
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
                                progress={asyncData.isPending(editStatus)}
                            >
                                Сохранить
                            </FormSubmit>
                        }
                        needsObFooter={needsObFooter}
                    >
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

            <ContactDelete
                show={confirmRemove}
                contactId={contactId}
                onCancel={toggleConfirmRemove}
            />
        </PanelWrapper>
    );
}
