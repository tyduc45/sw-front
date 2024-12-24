import request from '@/utils/request'

// 查询中国中铁不合格分包企业名录列表
export function listBancompany(query) {
  return request({
    url: '/manage/bancompany/list',
    method: 'get',
    params: query
  })
}

// 查询中国中铁不合格分包企业名录详细
export function getBancompany(Id) {
  return request({
    url: '/manage/bancompany/' + Id,
    method: 'get'
  })
}

// 新增中国中铁不合格分包企业名录
export function addBancompany(data) {
  return request({
    url: '/manage/bancompany',
    method: 'post',
    data: data
  })
}

// 修改中国中铁不合格分包企业名录
export function updateBancompany(data) {
  return request({
    url: '/manage/bancompany',
    method: 'put',
    data: data
  })
}

// 删除中国中铁不合格分包企业名录
export function delBancompany(Id) {
  return request({
    url: '/manage/bancompany/' + Id,
    method: 'delete'
  })
}
