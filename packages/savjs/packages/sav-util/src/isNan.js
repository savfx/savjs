
export function isNan (val) {
  return typeof val === 'number' && isNaN(val)
}
