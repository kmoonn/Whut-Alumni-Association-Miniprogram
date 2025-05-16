Page({
  data: {
    imageBaseUrl: '',
    company: '',
    alumniList: [] // 校友列表
  },

  onLoad(options) {
    const app = getApp();
    this.setData({
      imageBaseUrl: app.globalData.imageBaseUrl
    });
    this.setData({
      company: options.company // 获取传递过来的公司名称
    });
    this.loadAlumni(options.company); // 根据公司名称加载校友信息
  },

  loadAlumni(company) {
    wx.cloud.callFunction({
      name: 'service',
      data: { action: 'getAlumniByCompany', company: company }, // 获取该公司校友信息
      success: res => {
        if (res.result.success === 200) {
          this.setData({
            alumniList: res.result.result
          });
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      },
      fail: error => {
        wx.showToast({
          title: '加载校友数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 显示校友详情
  showDetail(e) {
    const id = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo');
    const userRole = userInfo ? userInfo.role : null;

    if (userRole !== 'admin' && userRole !== 'leader') {
      wx.showToast({
        title: '无详细信息查看权限',
        icon: 'none'
      });
      return;
    }

    if (id) {
      wx.showLoading({ title: '加载中', mask: true });
      wx.navigateTo({
        url: `/alumni/pages/famous/detail/detail?id=${id}`
      });
    } else {
      console.error('未获取到有效的 id');
    }
  }
});
