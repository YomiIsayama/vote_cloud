// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database()
  const posts = db.collection("posts")
  const candidate = db.collection("candidate")
  const _ = db.command

  let today = new Date().toDateString()
  let openid = wxContext.OPENID

  let {
    fileID
  } = event

  let res = await posts.add({
    data: {
      openid,
      fileID,
      today
    }
  })

  res = await candidate.where({
    fileID
  }).update({
    data: {
      vote: _.inc(1)
    }
  })
  return {
    res
  }
}