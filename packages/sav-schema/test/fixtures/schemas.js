module.exports = {
  fields: [
    {
      id: '5a5dbaffd5fe4449384277e0',
      name: 'sfsf',
      title: 'dsdsd',
      type: 'String'
    },
    {
      id: '5a5dbaffd5fe4449384277e1',
      name: 'fewfe',
      title: 'wfewfw',
      type: 'UInt16',
      checks: [
        {
          value: '10',
          name: 'lgt',
          title: 's'
        },
        {
          value: '100',
          name: 'llt',
          title: 'b'
        }
      ]
    },
    {
      id: '5a63093d5ded884864721386',
      name: 'rew',
      title: 'rewrewr',
      type: '5a7987f215a1ad27446afd6f'
    },
    {
      id: '5a63093d5ded884864721388',
      name: 'ewefw',
      title: 'wfwfwf',
      type: 'String'
    },
    {
      id: '5a63093d5ded884864721387',
      name: 'fwef',
      title: 'wfewf',
      type: '5a5dbaffd5fe4449384277e2'
    }
  ],
  enums: [
    {
      id: '5a7987cb15a1ad27446afd6d',
      name: 'Sex',
      title: 'Sex',
      enums: [
        {
          key: 'male',
          value: '1',
          title: '男'
        },
        {
          key: 'female',
          value: '2',
          title: '女'
        }
      ]
    }
  ],
  lists: [
    {
      id: '5a7987da15a1ad27446afd6e',
      name: 'NumberList',
      title: 'NumberList',
      list: 'Number'
    },
    {
      id: '5a7987f215a1ad27446afd6f',
      name: 'ObjectList',
      title: 'ObjectList',
      list: '5a5dbaffd5fe4449384277e2'
    }
  ],
  structs: [
    {
      id: '5a5dbaffd5fe4449384277e2',
      name: 'StructA',
      title: 'we',
      props: [
        '5a5dbaffd5fe4449384277e0',
        '5a5dbaffd5fe4449384277e1'
      ]
    },
    {
      id: '5a63093d5ded884864721389',
      name: 'StructB',
      title: 'dsdsd',
      props: [
        '5a63093d5ded884864721386',
        '5a63093d5ded884864721387',
        '5a63093d5ded884864721388'
      ]
    }
  ],
  schemas: [
    {
      id: '5a5dbb1bd5fe4449384277e3',
      name: 'RefAccount',
      title: 'sb',
      refer: '5a5dbaffd5fe4449384277e2',
      flow: 0
    },
    {
      id: '5a5dbb25d5fe4449384277e4',
      name: 'ReqAccount',
      title: '帐号s-fds-请求',
      refer: '5a5dbaffd5fe4449384277e2',
      flow: 1
    },
    {
      id: '5a6309455ded88486472138a',
      name: 'ResAccount',
      title: '帐号s-sdsd-响应',
      refer: '5a63093d5ded884864721389',
      flow: 2
    }
  ]
}
