/**
 * 接口数据缓存
 */
export class Cache {
  constructor () {
    this.count = 0
    this.caches = {}
  }
  get (key) {
    let val = this.caches[key]
    if (val) {
      let now = +new Date()
      if (now < val.now + val.ttl * 1000) {
        return JSON.parse(val.value)
      }
      delete this.caches[key]
      this.count--
    }
  }
  set (key, ttl, name, value) {
    let exists = key in this.caches
    this.caches[key] = {
      now: +new Date(),
      ttl,
      name,
      value: JSON.stringify(value)
    }
    if (!exists) {
      this.count++
    }
  }
  clear () {
    this.caches = {}
    this.count = 0
  }
  removeByName (name) {
    let it
    let cacheKey
    for (cacheKey in this.caches) {
      it = this.caches[cacheKey]
      if (it.name === name) {
        delete this.caches[cacheKey]
        this.count--
      }
    }
  }
}
