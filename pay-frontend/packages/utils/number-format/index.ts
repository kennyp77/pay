export const formatThousands = (amount: number): [string, string] => {
    let [value, fraction = ''] = amount.toString().split('.');

    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');

    fraction = fraction === '00' ? '' : fraction;
    fraction = fraction[1] === '0' ? fraction[0] : fraction;

    return [value, fraction];
};
