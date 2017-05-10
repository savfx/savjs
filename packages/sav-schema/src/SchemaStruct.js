/**
 * 结构体类型
 */

/*
props: {
  name: String,
  name1: 'String',
  age: {
    type: Number
  },
  age1: 'Number',
  sex: 'Sex',
  sex1: {
    type: 'Sex',
    optional: true
  }
},
refs: {
  Sex: {
    enums: [
      {key: 'male', value: 1},
      {key: 'female', value: 2}
    ]
  }
}
 */

export class SchemaStruct {
  constructor (props, schema) {
    this.schema = schema
    Object.assign(this, props)
  }
}
