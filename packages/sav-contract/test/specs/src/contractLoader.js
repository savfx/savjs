import test from 'ava'
import {expect} from 'chai'
import {loadInterface} from '../../../src/loaders/interface.js'
import {loadContract} from '../../../src/loaders/contract.js'
import {writeContract} from '../../../src/writers/contract.js'
import {writePhpContract} from '../../../src/writers/contractPhp.js'
import {CommandContract} from '../../../src/CommandContract.js'
import {updatePhpActions} from '../../../src/updaters/updatePhp.js'
import {updateNodeActions} from '../../../src/updaters/updateNode.js'
import path from 'path'
// import fs from 'fs'

test('loadContract', async (ava) => {
  expect(loadInterface).to.be.a('function')
  expect(loadContract).to.be.a('function')
  expect(writeContract).to.be.a('function')
  let contract = await loadContract(path.resolve(__dirname,
    '../../fixtures/suite'))
  expect(contract).to.be.a('object')
  expect(contract.project).to.be.a('object')

  expect(contract.modals).to.be.a('array')
  expect(contract.actions).to.be.a('array')
  expect(contract.pages).to.be.a('array')

  expect(contract.schemas).to.be.a('array')
  expect(contract.structs).to.be.a('array')
  expect(contract.lists).to.be.a('array')
  expect(contract.enums).to.be.a('array')
  expect(contract.fields).to.be.a('array')

  expect(contract.mocks).to.be.a('array')

  let cmd = new CommandContract()
  cmd.load(contract)

  let dist = path.resolve(__dirname, '../../fixtures/suite-contract')
  await writeContract(dist, cmd)

  let output = await writeContract(dist, cmd, {mem: true})
  let outputJson = JSON.stringify(output, null, 2)
  let cmd2 = new CommandContract()
  cmd2.load(JSON.parse(outputJson))
  let output2 = await writeContract(dist, cmd2, {mem: true})
  let output2Json = JSON.stringify(output2, null, 2)
  // fs.writeFileSync('./out1.json', outputJson)
  // fs.writeFileSync('./out2.json', output2Json)

  expect(output2Json).to.eql(outputJson)

  let data = await loadContract(dist)
  let cmd3 = new CommandContract()
  cmd3.load(data)
  let output3 = await writeContract(dist, cmd3, {mem: true})
  let output3Json = JSON.stringify(output3, null, 2)
  // fs.writeFileSync('./out3.json', output3Json)
  expect(output3Json).to.eql(outputJson)

  let outputPhp = await writePhpContract(dist, cmd)
  let outputPhp2 = await writePhpContract(dist, cmd2, {mem: true})
  let outputPhp3 = await writePhpContract(dist, cmd3, {mem: true})

  expect(outputPhp3).to.eql(outputPhp2)
  expect(outputPhp3).to.eql(outputPhp)

  let actionPath = path.resolve(__dirname, '../../fixtures/suite-actions')
  let modals = cmd.getContractModals()
  await updatePhpActions(actionPath, modals)
  await updateNodeActions(actionPath, modals)

  ava.pass()
})
