Page({
  data: {
    companyList: [] // 企业列表
  },

  onLoad() {
    this.fetchCompany();
  },

  // 获取企业列表
  fetchCompany() {
    wx.showLoading({ title: '加载中' });
    wx.cloud.callFunction({
      name: 'service',
      data: {
        action: 'getCompany',
      },
      success: res => {
        if (res.result.code === 200) {
          const companyList = res.result.result;
          this.setData({
            companyList: companyList
          });
        }
      },
      fail: err => {
        console.error('获取校友企业失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  navigateToWeb(e) {
    const url = e.currentTarget.dataset.url;
    console.log('Decoded URL:', url);
    wx.navigateTo({
      url: `/service/pages/companyDetail/companyDetail?url=${encodeURIComponent(url)}`
    });
  }
  
});


