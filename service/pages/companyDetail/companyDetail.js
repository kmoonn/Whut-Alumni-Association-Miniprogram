Page({
  data: {
    webUrl: ''
  },
  onLoad(options) {
    const url = decodeURIComponent(options.url);
    console.log('Decoded URL:', url);
    if (url.startsWith('')) {
      this.setData({
        webUrl: url
      });
    } else {
      console.error('Invalid URL. web-view only supports HTTPS URLs.');
      wx.showToast({
        title: '无效的 URL，仅支持 HTTPS 链接',
        icon: 'none'
      });
    }
  }
});

