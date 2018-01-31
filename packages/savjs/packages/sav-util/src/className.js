
export function className (val) {
  return Object.prototype.toString.call(val).slice(8, -1)
} 
