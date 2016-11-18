import {
    isObject,
    isArray
} from './type'

import {extend} from './extend'

export function clone (val) {
    if (isArray(val)) {
        return extend(true, [], val)
    }
    else if (isObject(val)) {
        return extend(true, {}, val)
    }
    return extend(true, [], [val])[0]
};