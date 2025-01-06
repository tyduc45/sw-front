import request from '@/utils/request'

// 查询公司黑名单列表
export function listBanCompany(query) {
  return request({
    url: '/system/banCompany/list',
    method: 'get',
    params: query
  })
}

// 查询公司黑名单详细
export function getBanCompany(id) {
  return request({
    url: '/system/banCompany/' + id,
    method: 'get'
  })
}

// 新增公司黑名单
export function addBanCompany(data) {
  return request({
    url: '/system/banCompany',
    method: 'post',
    data: data
  })
}

// 修改公司黑名单
export function updateBanCompany(data) {
  return request({
    url: '/system/banCompany',
    method: 'put',
    data: data
  })
}

// 删除公司黑名单
export function delBanCompany(id) {
  return request({
    url: '/system/banCompany/' + id,
    method: 'delete'
  })
}
