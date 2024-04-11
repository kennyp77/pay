import prop from '@tinkoff/utils/object/prop';

type ItemWithId = Record<string, any> & { id: string };

export function hasId(list: ItemWithId[], id: string) {
    return list.some((item) => prop('id', item) === id);
}
