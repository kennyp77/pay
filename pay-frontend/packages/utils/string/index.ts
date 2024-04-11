import { Pred } from '@tinkoff/utils/typings/types';

export const contain = (val: string, word = false): Pred => {
    if (word) {
        const regex = new RegExp(`\\b${val}\\b`);

        return (str: string): boolean => regex.test(str);
    }

    return (str: string): boolean => str.includes(val);
};

/**
 * @description склоняет слова
 *
 * @param number - число, количество
 * @param textForms - ['яблоко', 'яблока', 'яблок']
 */
export const numberWord = (number: number, textForms: [string, string, string]) => {
    const reducedNumber = Math.abs(number) % 100;

    const numberMod = reducedNumber % 10;
    if (reducedNumber > 10 && reducedNumber < 20) {
        return textForms[2];
    }
    if (numberMod > 1 && numberMod < 5) {
        return textForms[1];
    }
    if (numberMod == 1) {
        return textForms[0];
    }

    return textForms[2];
};
