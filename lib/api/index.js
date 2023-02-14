const axios = require('./request')

const getRepoList = (gitUsername, params) => {
  return axios.request({
      url: `https://api.github.com/users/${gitUsername}/repos`,
      params,
      method: 'get'
  })
}

module.exports = {
  getRepoList
}
