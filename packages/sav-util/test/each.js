import test from "ava"
import { each } from '../'

test("each.Array", (av) => {
	av.plan(6)
	each([0,1,2], (val, key)=>{
		av.true(val === key)
		av.pass()
	})
})

test("each.Argument", (av) => {
	av.plan(6)
	each((function(){return arguments})(0,1,2), (val, key)=>{
		av.true(val === key)
		av.pass()
	})
})

test("each.Object", (av) => {
	av.plan(6)
	let obj = {
		0: 0,
		1: 1,
		2: 2
	}
	each(obj, (val, key)=>{
		av.true(String(val) === key)
		av.pass()
	})
})
