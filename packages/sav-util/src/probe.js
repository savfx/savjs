
function defined (val) {
  return val !== 'undefined'
}

let probe = {
  Map: defined(typeof Map),
  Proxy: defined(typeof Proxy),
  MessageChannel: defined(typeof MessageChannel),
  localStorage: defined(typeof localStorage),
  XMLHttpRequest: defined(typeof XMLHttpRequest),
  MutationObserver: defined(typeof MutationObserver),
  window: defined(typeof window),
  document: defined(typeof document)
}

export {probe}
