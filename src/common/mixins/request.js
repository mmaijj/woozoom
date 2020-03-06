import axios from 'axios'

function request (options) {
  return axios(options)
    .then(res => {
      return res
    })
    .catch(error => {
      const {
        // eslint-disable-next-line no-unused-vars
        response: { status, statusText }
      } = error
      return Promise.reject(error)
    })
}

export default request
