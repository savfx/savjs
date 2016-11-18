import {prop} from './func'

export function bindEvent(target) {
	let _events = {}
	prop(target, 'on', (event, fn)=>{
		(_events[event] || (_events[event] = [])).push(fn)
	})

	prop(target, 'off', (event, fn) => {
		if (_events[event]) {
			let list = _events[event]
			if (fn) {
				let pos = list.indexOf(fn)
				if (pos != -1) {
					list.splice(pos, 1);
				}
			}
			else {
				delete _events[event]
			}
		}
	})

	prop(target, 'once', (event, fn) => {
		let once = (...args) => {
		    target.off(event, fn);
		    fn(...args);
		};
		target.on(event, once);
	})
	
	prop(target, 'listen', (event, fn) => {
		target.on(event, fn);
		return () => {
		    target.off(event, fn);
		};
	})

	prop(target, 'emit',  (event, ...args) => {
		if (_events[event]) {
		    let list = _events[event].slice(), fn
		    while ((fn = list.shift())) {
		        fn(...args)
		    }
		}
	})
}