import { shortNumber } from '@enso-ui/mixins';

export default (number, { chart: { options: { precision = 2 } } }) => {
    return shortNumber(number, precision)
};
