
export const snakeCase = (() => {
  const replaceAZRE = /([A-Z])/g
  return (str) => camelCase(str).replace(replaceAZRE, '_$1').toLowerCase()
})()
