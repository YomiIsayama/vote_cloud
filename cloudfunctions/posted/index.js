// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const posts = cloud.database().collection('posts')
  const openid = wxContext.OPENID

  const res = await posts.where({ openid }).count()

  const total = res.total
  return {
    total
  }
}