Page({
  data: {
    // 登录
    activeTab: 'login',

    // 登录数据
    username: '',
    password: '',
    isAgreed: false,

    // 弹窗控制
    confirmBtn: { content: '知道了', variant: 'base' },
    dialogKey: '',
    showMultiTextAndTitle: false,

    // 初始密码修改弹窗
    showPasswordModal: false,
    newPwd: '',
    confirmPwd: ''
  },

  // Tab 切换
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 输入监听
  onUsernameChange(e) {
    this.setData({ username: e.detail.value });
  },
  onPasswordChange(e) {
    this.setData({ password: e.detail.value });
  },
  onAgreeChange(e) {
    this.setData({ isAgreed: e.detail.value.length > 0 });
  },

  // 登录逻辑
  onLogin() {
    const { username, password, isAgreed } = this.data;

    if (!username || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (!isAgreed) {
      wx.showToast({ title: '请先同意服务协议', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    wx.cloud.callFunction({
      name: 'login',
      data: { username, password }
    }).then(res => {
      wx.hideLoading();

      if (res.result.success) {
        const userInfo = res.result.data;
        wx.setStorageSync('userInfo', userInfo);
        if (userInfo.isInitialPassword === 1) {
          this.setData({ showPasswordModal: true });
        } else {
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.navigateTo({ url: '/pages/service/index' });
              }, 1500);
            }
          });
        }
      } else {
        wx.showToast({
          title: res.result.message || '登录失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '登录失败，请稍后重试', icon: 'none' });
      console.error('[云函数] [login] 调用失败：', err);
    });
  },

  // 弹窗展示与关闭
  showDialog(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ [key]: true, dialogKey: key });
  },
  closeDialog() {
    const { dialogKey } = this.data;
    this.setData({ [dialogKey]: false });
  },

  // 初始密码弹窗 - 输入监听
  onOldPwdInput(e) {
    this.setData({ password: e.detail.value });
  },
  onNewPwdInput(e) {
    this.setData({ newPwd: e.detail.value });
  },
  onConfirmPwdInput(e) {
    this.setData({ confirmPwd: e.detail.value });
  },

  // 取消修改密码
  onCancelPasswordModal() {
    wx.showToast({ title: '请修改密码后才能继续使用', icon: 'none' });
  },

  // 确认修改密码
  onConfirmPasswordModal() {
    const { password, newPwd, confirmPwd } = this.data;
    const userInfo = wx.getStorageSync('userInfo');

    if (newPwd.length < 6) {
      wx.showToast({ title: '密码太短', icon: 'none' });
      return;
    }
    if (newPwd !== confirmPwd) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    if (newPwd === password) {
      wx.showToast({ title: '不能与初始密码相同', icon: 'none' });
      return;
    }

    wx.cloud.callFunction({
      name: 'updatePwd',
      data: {
        userId: userInfo.id,
        newPassword: newPwd
      }
    }).then(res => {
      wx.showToast({ title: '修改成功' });
      this.setData({ showPasswordModal: false });

      setTimeout(() => {
        wx.navigateTo({ url: '/pages/service/index' });
      }, 1000);
    }).catch(() => {
      wx.showToast({ title: '修改失败，请重试', icon: 'none' });
    });
  }
});
