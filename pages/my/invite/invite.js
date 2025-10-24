Page({
  data: {
    codeList: [],
    qrCodeUrl: '',
    showQr: false
  },

  onLoad() {
    this.loadCodes();
  },

  async generateCode() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id == null) {
      wx.showToast({ title: '用户未登录', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '正在生成...', mask: true });
      const res = await wx.cloud.callFunction({
        name: 'service',
        data: {
          action: 'genInviteCode',
          userId: userInfo.id
        }
      });
      wx.hideLoading();
      wx.showToast({ title: '生成成功', icon: 'success' });
      this.loadCodes();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '生成失败', icon: 'none' });
      console.error('生成邀请码失败：', err);
    }
  },

  async loadCodes() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || userInfo.id == null) {
      wx.showToast({ title: '用户未登录', icon: 'none' });
      return;
    }

    try {
      const res = await wx.cloud.callFunction({
        name: 'service',
        data: {
          action: 'selectInviteCode',
          userId: userInfo.id
        }
      });
      this.setData({ codeList: res.result.result });
    } catch (err) {
      console.error('加载邀请码失败：', err);
    }
  },

  onShareTap(e) {
    const code = e.currentTarget.dataset.code;
    wx.cloud.callFunction({
      name: 'service',
      data: {
        action: 'genQRcode',
        code: code
      },
      success: res => {
        const fileID = res.result && res.result.fileID;
        if (!fileID) {
          wx.hideLoading();
          wx.showToast({ title: '二维码生成失败', icon: 'none' });
          return;
        }
    
        // 获取临时访问链接
        wx.cloud.getTempFileURL({
          fileList: [fileID],
          success: r => {
            const tempFile = r.fileList && r.fileList[0];
            if (!tempFile || !tempFile.tempFileURL) {
              wx.hideLoading();
              wx.showToast({ title: '获取二维码失败', icon: 'none' });
              return;
            }
            console.log('[二维码 URL]', tempFile.tempFileURL);
            this.setData({
              qrCodeUrl: tempFile.tempFileURL,
              showQr: true
            });
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '获取二维码失败', icon: 'none' });
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('云函数调用失败:', err);
        wx.showToast({ title: '二维码生成失败', icon: 'none' });
      }
    });    
  },

  onDeleteTap(e) {
    const code = e.currentTarget.dataset.code;
    wx.showLoading({ title: '正在删除...', mask: true });

    wx.cloud.callFunction({
      name: 'service',
      data: {
        action: 'delInviteCode',
        code: code 
      },
      success: res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          wx.showToast({ title: '删除成功', icon: 'success' });
          this.loadCodes(); 
        } else {
          wx.showToast({ title: res.result?.msg || '删除失败', icon: 'none' });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
        console.error('删除邀请码失败:', err);
      }
    });
  },

  closeQr() {
    this.setData({
      showQr: false,
      qrCodeUrl: ''
    });
  },

  stopPropagation() {
  }

});
