let PROMISE = Promise
let promise = {
	resolve: PROMISE.resolve.bind(PROMISE),
	reject: PROMISE.reject.bind(PROMISE),
	all: PROMISE.all.bind(PROMISE),
	then: (fn) => {
	    return new PROMISE(fn)
	},
}

export {promise}