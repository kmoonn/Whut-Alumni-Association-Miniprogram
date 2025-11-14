Page({
  data: {
    visible: false,
    formData: {
      name: '',
      staffId: '',
      phone: '',
      company: '',
      position: '',
      inviter: ''
    }
  },

  onLoad() {
    this.fetchUserInfo();
  },

  onChangeName(e) {
    this.setData({ 'formData.name': e.detail.value });
  },
  onChangeStaffId(e) {
    this.setData({ 'formData.staffId': e.detail.value });
  },
  onChangePhone(e) {
    this.setData({ 'formData.phone': e.detail.value });
  },
  onChangeCompany(e) {
    this.setData({ 'formData.company': e.detail.value });
  },
  onChangePosition(e) {
    this.setData({ 'formData.position': e.detail.value });
  },

  fetchUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.nickname) {
      this.setData({ 'formData.inviter': userInfo.nickname });
    }
  },

  onVisibleChange(e) {
    this.setData({
      visible: e.detail.visible
    });
  },

  onClose() {
    this.setData({
      visible: false
    });
  },

  async onSubmit() {
    const { name, staffId, phone, company, position, inviter } = this.data.formData;
    const phoneReg = /^1[3-9]\d{9}$/;

    if (!name || !staffId || !phone || !company || !position) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (!phoneReg.test(phone)) {
      wx.showToast({ title: '手机号格式错误', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'service',
        data: {
          action: 'recommendUser',
          name,
          staffId,
          phone,
          company,
          position,
          inviter
        }
      });

      wx.hideLoading();

      if (res.result.success) {
        this.setData({
          visible: true,
          formData: {
            name: '',
            staffId: '',
            phone: '',
            company: '',
            position: '',
            inviter
          }
        });
      } else {
        wx.showToast({ title: '提交失败，请稍后再试', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
  }
});
