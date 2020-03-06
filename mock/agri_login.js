function login (method) {
  let res = null
  switch (method) {
    case 'GET':
      res = '0'
      break
    default:
      res = null
  }
  return res
}

module.exports = login
