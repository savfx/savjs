const typeMaps = {
  String: 'string',
  // 大数字会走科学计数
  Number: 'float64',

  Int8: 'int8',
  UInt8: 'uint8',
  Byte: 'int16', // 只能升级

  Int16: 'int16',
  UInt16: 'uint16',
  Short: 'int32',

  Int32: 'int32',
  UInt32: 'uint32',
  Integer: 'int64',

  Long: 'int64',

  Boolean: 'bool'

}

const nativeTypes = Object.values(typeMaps)

export function isNativeType (val) {
  return nativeTypes.indexOf(val) !== -1 || (!!typeMaps[val])
}

export function getNativeType (val) {
  return typeMaps[val] || val
}

const numberTypes = [
  'float64',
  'int8',
  'uint8',
  'int16',
  'uint16',
  'int32',
  'int32',
  'uint32',
  'int64'
]

export function isNumberType (val) {
  return numberTypes.indexOf(val) !== -1
}
