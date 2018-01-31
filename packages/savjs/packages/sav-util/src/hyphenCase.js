
export const hyphenCase = (() => {
  const replaceAZRE = /([A-Z])/g
  return (str) => camelCase(str).replace(replaceAZRE, '-$1').toLowerCase()
})()
