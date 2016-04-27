import deepFind from '../helpers/deepFind';

/*eslint func-style:0*/
export default function required(equalsField, errorMessage) {
    return function (value, fieldValues) {
        if (deepFind(fieldValues, equalsField) !== value) {
            return errorMessage;
        }
    };
}
