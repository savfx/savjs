/**
 * fill make array
 * @param  {Number} len    array length
 * @param  {Number} start  start number
 * @param  {Number} indent inc step
 * @return {Array}
 */
export function fill (len, start = 0, indent = 1) {
  let arr = new Array (len)
  for (let i = 0; i < len; ++i) {
    arr[i] = start + indent * i
  }
  return arr
}
