import test from "ava"
import expect from 'expect.js'
import * as type from '../'

test('type', (ava) => {
    const items = {
        'Object': {},
        'Array': [],
        'Nan': NaN,
        'Undefined':undefined,
        'Boolean':true,
        'Number':1.,
        'String':'',
        'Function':function(){},
        'RegExp':/text/,
        'Date': new Date(),
    };
	Object.keys(items).forEach((name) =>{
        //items
        Object.keys(items).forEach((key) =>{
        	let ret = type['is'+ name](items[key]);
            expect(ret).to.be(name === key);
        });
    });
});
