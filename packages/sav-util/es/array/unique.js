/**
 * unique Array
 * @param  {Array} arr array to unique
 * @return {Array}     array
 */
export function unique (arr) {
  let len = arr.length
  let i = -1
  while (i < len) {
    for (let j = ++i, n = arr.length; j < n; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1)
      }
    }
  }
  return arr
}
