/**
 * 对象或数组遍历
 * @param  {Array|Object} obj      要遍历的对象
 * @param  {Function} iterator 遍历函数，统一遵循值在前的模式
 * @param  {Mixed} context  上下文对象
 * @return {Mixed}          返回要遍历的对象
 *
 * @example
 * each(['a','b'], function(val, key){
 *     if (val == 'a') {
 *         console.log(val);
 *         return false;
 *     }
 * });
 */
export function each(obj, iterator, context) {
    if (obj) {
        var _length = obj.length,
            _key;
        if (_length === +_length) { // array like
            for (_key = 0; _key < _length; _key++) {
                if (false === iterator.call(context, obj[_key], _key)) {
                    return obj;
                }
            }
        } else { //object
            for (_key in obj) {
                if (obj.hasOwnProperty(_key)) {
                    if (false === iterator.call(context, obj[_key], _key)) {
                        return obj;
                    }
                }
            }
        }
    }
    return obj;
}