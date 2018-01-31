
export const camelCase = (() => {
  const camelCaseRE = /[-_](\w)/g
  return (str)  => lcfirst(str.replace(camelCaseRE, (_, c) => c ? c.toUpperCase() : ''))
})()
