const db = wx.cloud.database()
const candidate = db.collection('candidate')
let res = null
let app = getApp()
Page({
  data: {
    candidates: [], //候选人数组
    posted: false //已投票状态
  },
  //页面加载生命周期回调
  onLoad: async function (options) {
    //调用云函数posted获取是否投过票
    res = await wx.cloud.callFunction({
      name: 'posted'
    })
    // console.log(res)
    //根据posted云函数返回的结果设置已投票状态
    this.setData({
      posted: res.result.total > 0
    })

    res = await candidate.get()
    // console.log(res)
    let candidates = res.data   //候选人数组
    let swiperCurrent = 0       //设置轮播图初始编号
    await this.setData({
      candidates,
      swiperCurrent
    })
    //刷新标题栏
    this.setBar(this.data.swiperCurrent)
  },
  async tap(res) {
    //如果已投票，提示不能再投
    if (this.data.posted) {
      //挑战任务2 取消投票提示，然后调用云函数取消投票。
      wx.showToast({
        title: '投过票不能再投！',
        icon: 'success'
      })
      return
    }
    res = await wx.showModal({
      title: '投票确认',
      content: '确定投这件作品吗？',
    })
    console.log(res)
    if (res.confirm) {
      //调用云函数post上传投票信息
      res = await wx.cloud.callFunction({
        name: 'post',
        data: {
          fileID: this.data.candidates[this.data.swiperCurrent].fileID
        }
      })
      //页面的data的当前候选人的票数加1
      this.data.candidates[this.data.swiperCurrent].vote++
      //设置已投票标志位为true
      this.data.posted = true
      //更新标题栏
      this.setBar(this.data.swiperCurrent)
    }
  },

  async schange(res) {
    await this.setData({
      swiperCurrent: res.detail.current
    })
    this.setBar(res.detail.current)
  },
  async long() {
    res = await wx.chooseImage({
      count: 1
    })

    res = await wx.cloud.uploadFile({
      cloudPath: res.tempFilePaths[0].replace(/(.*\/)*([^.]+)/i, "$2"),
      filePath: res.tempFilePaths[0]
    })

    let {
      fileID
    } = res

    res = await wx.cloud.callFunction({
      name: 'addCandidate',
      data: {
        fileID
      }
    })
    wx.reLaunch({
      url: "/" + getCurrentPages()[0].route,
    })
  },
  setBar(current) {
    //设置标题栏内容
    wx.setNavigationBarTitle({
      title: 'vote' + (current + 1) + "/" + this.data.candidates.length + " 票数：" + this.data.candidates[current].vote
    })
  }
})