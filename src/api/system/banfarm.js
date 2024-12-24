import request from '@/utils/request'

// 查询农民工黑名单列表
export function listBanfarm(query) {
  return request({
    url: '/system/banfarm/list',
    method: 'get',
    params: query
  })
}

// 查询农民工黑名单详细
export function getBanfarm(id) {
  return request({
    url: '/system/banfarm/' + id,
    method: 'get'
  })
}

// 新增农民工黑名单
export function addBanfarm(data) {
  return request({
    url: '/system/banfarm',
    method: 'post',
    data: data
  })
}

// 修改农民工黑名单
export function updateBanfarm(data) {
  return request({
    url: '/system/banfarm',
    method: 'put',
    data: data
  })
}

// 删除农民工黑名单
export function delBanfarm(id) {
  return request({
    url: '/system/banfarm/' + id,
    method: 'delete'
  })
}
