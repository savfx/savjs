/**
 * one argument function proxy
 * @example
 * [97].map(oneArg(String.fromCodePoint)) === ['a']
 * @param  {Function} fn raw function
 * @param  {Mixed} ctx context
 * @return {Function}     proxy function
 */
export function oneArg (fn, ctx) {
  return ctx ? (arg) => fn.call(ctx, arg) : (arg) => fn(arg)
}
