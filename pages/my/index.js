Page({
  data: {
    userInfo: null,
    showContactModal: false
  },
  
  contactService() {
    this.setData({
      showContactModal: true
    });
  },
  
  hideModal() {
    this.setData({
      showContactModal: false
    });
  },

  onLoad() {
    this.fetchUserInfo();
  },

  onShow() {
  },

  async fetchUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      } else {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取用户信息失败：', error);
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    }
  },

  navigateTo(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 执行退出登录逻辑
          wx.clearStorageSync();  // 清除缓存
          wx.redirectTo({
            url: '/pages/login/login'  // 跳转到登录页面
          });
        }
      }
    });
  }

}); 