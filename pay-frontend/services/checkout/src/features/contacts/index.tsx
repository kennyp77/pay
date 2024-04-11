import React, { useCallback, useState } from 'react';

import { useService } from '@yandex-pay/react-services';
import { useSelector } from 'react-redux';

import { Box } from '../../components/box';
import { Button } from '../../components/button';
import { Icon } from '../../components/icons';
import { ListButtonDefault, ListButtonRadio } from '../../components/list-button';
import { Panel, PanelHeader } from '../../components/panel';
import { Text } from '../../components/text';
import { history, Path } from '../../router';
import { getContactList, getSelectedContactId, selectContact } from '../../store/contacts';

import PlusIcon from './assets/plus.svg';

const i18n = (v: string) => v;

interface ContactsProps {
    obHeader?: React.ReactNode;
    completeCallback?: Sys.CallbackFn0;
    needsObFooter?: boolean;
}

export function Contacts({
    obHeader,
    completeCallback = () => history.push(Path.Main),
    needsObFooter = false,
}: ContactsProps) {
    const selectContactFn = useService(selectContact);

    const list = useSelector(getContactList);
    const selectedContactId = useSelector(getSelectedContactId);
    const [selectedId, setSelected] = useState(selectedContactId);

    const onSelectContact = useCallback(
        () => selectContactFn(selectedId, completeCallback),
        [selectContactFn, selectedId, completeCallback],
    );

    const header = obHeader || (
        <PanelHeader title="Получатель" closeHref={selectedContactId ? Path.Main : undefined} />
    );

    return (
        <Panel
            header={header}
            footer={
                <Button
                    size="l"
                    view="action"
                    variant="primary"
                    width="max"
                    pin="round-m"
                    disabled={!selectedId}
                    onClick={onSelectContact}
                >
                    {i18n('Продолжить')}
                </Button>
            }
            needsObFooter={needsObFooter}
        >
            {list.map((contact) => (
                <React.Fragment key={contact.id}>
                    <ListButtonRadio
                        size="m"
                        bottom="xs"
                        active={selectedId === contact.id}
                        onClick={() => setSelected(contact.id)}
                        hrefRight={Path.ContactsEdit(contact)}
                        radioPosition="left"
                    >
                        <Box bottom="2xs">
                            <Text variant="m">
                                {[contact.lastName, contact.firstName, contact.secondName].join(
                                    ' ',
                                )}
                            </Text>
                        </Box>
                        <Text variant="s" color="grey">
                            {contact.phoneNumber}
                        </Text>
                        <Text variant="s" color="grey">
                            {contact.email}
                        </Text>
                    </ListButtonRadio>
                </React.Fragment>
            ))}
            <ListButtonDefault
                size="m"
                iconLeft={<Icon svg={PlusIcon} size="l" />}
                href={Path.ContactsAdd}
            >
                <Text variant="m">{i18n('Новый получатель')}</Text>
            </ListButtonDefault>
        </Panel>
    );
}
