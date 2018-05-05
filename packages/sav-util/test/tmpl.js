import test from 'ava'
import {expect} from 'chai'
import {tmpl} from '../src/tmpl.js'

test('tmpl', (t) => {
  expect(tmpl('<div> </div>\n')()).to.eql('<div> </div>\n')
  expect(tmpl('<div>{%=state.a%}</div>')({a: 1})).to.eql('<div>1</div>')
  expect(tmpl('<div>{%#state.a%}</div>')({a: 1})).to.eql('<div>1</div>')
  expect(tmpl('<div>{%#state.a%}</div>')({a: '<br>'})).to.eql('<div><br></div>')
  expect(tmpl('<div>{% if (state.a){ %}x{% } %}</div>')({a: 1})).to.eql('<div>x</div>')

  t.pass()
})
