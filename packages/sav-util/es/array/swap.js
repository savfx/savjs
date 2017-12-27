/**
 * swap array
 * @param  {Array} a   array to swap
 * @param  {Number} i   first index
 * @param  {Number} j   second index
 */
export function swap (a, i, j, tmp) {
  tmp = a[i]
  a[i] = a[j]
  a[j] = tmp
}
