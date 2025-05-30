Page({
  data: {
    sourceInfo: null,
    pendingInfo: null,
    pendingCount: 0,
    departments: [],
    result:'',
    remark:'',
    reasonOptions: ['查询档案', '本人认识', '询问他人', '其他'],
    noMoreData: false,
    confirmBtn: { content: '我已知晓', variant: 'base' },
    dialogKey: '',
    showMultiTextAndTitle: false,
    showModal: true
  },
  
  onLoad: function(options) {
    const departments = JSON.parse(decodeURIComponent(options.departments));
    this.setData({
      departments: departments
    });
    this.fetchPendingMatches();
  },

  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    });
  },

  formatDate(date) {
    //const d = new Date(date);
    const year = date.substr(0, 4);
    const month = date.substr(5, 2).padStart(2, '0');
    const day = date.substr(8, 2).padStart(2, '0');
    return `${year}-${month}-${day}`;
    //return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },

  showAgreement(callback) {
    wx.showModal({
      title: '疑似校友确认要求',
      content: '这里是校友审核要求的内容。',
      showCancel: false,
      confirmText: '我已知晓',
      success: () => {
        if (typeof callback === 'function') {
          callback();
        }
      }
    });
  },

  fetchPendingMatches() {
    const reviewerId = wx.getStorageSync('userInfo').id;
    const departments = this.data.departments;

    wx.cloud.callFunction({
      name: 'alumni',
      data: {
        action: 'getPendingMatches',
        reviewerId: reviewerId,
        departments: departments
      }
    }).then(res => {
      if (res.result.code === 200 && res.result.data.pendingCount > 0) {
        const { sourceAlumni, pendingAlumni, pendingCount } = res.result.data;

        if (pendingAlumni?.birthday) {
          pendingAlumni.birthday = this.formatDate(pendingAlumni.birthday);
        }
        if (sourceAlumni?.birthday) {
          sourceAlumni.birthday = this.formatDate(sourceAlumni.birthday);
        }

        this.setData({
          sourceInfo: sourceAlumni,
          pendingInfo: pendingAlumni,
          pendingCount: pendingCount,
          noMoreData: false
        });
      } else {
        this.showError(res.result.message || '获取数据失败');
        this.setData({
          noMoreData: true
        });
        wx.showToast({
          title: '暂无更多待确认数据',
          icon: 'none',
          duration: 1500
        });

      }
    }).catch(err => {
      console.error('获取待确认数据失败', err);
      this.showError('获取数据失败');
    });
  },

  toggleTooltip() {
    this.setData({ showMultiTextAndTitle: true, dialogKey: 'showMultiTextAndTitle' });
  },

  showDialog(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ [key]: true, dialogKey: key });
  },
  closeDialog() {
    const { dialogKey } = this.data;
    this.setData({ [dialogKey]: false });
  },

  rejectMatch() {
    this.submitMatch('非校友');
  },

  nonMatch() {
    this.submitMatch('不确定');
  },

  approveMatch() {
    this.submitMatch('是校友');
  },

  submitMatch(result) {
    if (result === '不确定') {
      this.doSubmit(result, '');
      return;
    }
    const reasonList = this.data.reasonOptions;
    wx.showActionSheet({
      itemList: reasonList,
      success: (res) => {
        const selected = reasonList[res.tapIndex];

        if (selected === '其他') {
          wx.showModal({
            title: '请输入其他理由',
            editable: true,
            placeholderText: '请输入审核理由',
            success: modalRes => {
              if (modalRes.confirm && modalRes.content.trim()) {
                this.doSubmit(result, modalRes.content.trim());
              } else {
                this.showError('请输入有效的理由');
              }
            }
          });
        } else {
          this.doSubmit(result, selected);
        }
      },
      fail: (err) => {
        console.log('用户取消选择或出错', err);
      }
    });
  },

  doSubmit(result, reason) {
    const reviewerId = wx.getStorageSync('userInfo').id;

    wx.cloud.callFunction({
      name: 'alumni',
      data: {
        action: 'submitReviewResult',
        alum_id: this.data.pendingInfo.id,
        reviewerId,
        result,
        remark: reason
      }
    }).then(res => {
      if (res.result.code === 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        this.fetchPendingMatches();
      } else {
        this.showError(res.result.message || '提交失败');
      }
    }).catch(err => {
      console.error('提交失败', err);
      this.showError('提交失败');
    });
  },

  copyLink() {
    const url = this.data.pendingInfo.source;
    wx.setClipboardData({
      data: url,
      success() {
        wx.showModal({
          title: '提示',
          content: '链接已复制，请在浏览器中粘贴打开',
          showCancel: false
        });
      }
    });
  },

  checkReviewStatus() {
  setTimeout(() => {
    this.setData({
      showModal: true
    });
  }, 1000);
},

closeModal() {
  this.setData({
    showModal: false
  });
}
});

