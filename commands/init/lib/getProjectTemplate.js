const request = require('@sorrow-cli-dev/request');

module.exports = function() {
  return request({
    url: '/project/template'
  })
}