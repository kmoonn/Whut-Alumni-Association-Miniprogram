Page({
  data: {
    records: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    noMore: false,
    searchName: '',
    showDetail: false,
    detail: {},
    sourceInfo: null, // 校友库源信息
    updateResult: '', // 修改后的确认结果
    reasonOptions: ['查询档案', '本人认识', '询问他人', '其他'],
    selectedReason: '',
  },

  onLoad() {
    this.fetchRecords();
  },

  // 输入搜索
  onSearchInput(e) {
    this.setData({
      searchName: e.detail.value
    });
  },

  // 点击搜索
  onSearch() {
    this.setData({
      records: [],
      page: 1,
      noMore: false,
    });
    this.fetchRecords();
  },

  // 拉取记录
  async fetchRecords() {
    if (this.data.loading || this.data.noMore) return;

    this.setData({ loading: true });
    const reviewerId = wx.getStorageSync('userInfo').id;
    const { page, pageSize, searchName } = this.data;

    try {
      const res = await wx.cloud.callFunction({
        name: 'alumni',
        data: {
          action: 'getHistory',
          user_id: reviewerId,
          page,
          pageSize,
          alum_name: searchName
        }
      });

      const newRecords = res.result.data.list || [];
      const total = res.result.data.total || 0;
      
      newRecords.forEach(item => {
        if (item.date) {
          item.date = formatDateTime(item.date);
        }
      });

      this.setData({
        records: [...this.data.records, ...newRecords],
        total,
        loading: false,
        noMore: this.data.records.length + newRecords.length >= total,
        page: page + 1,
      });
    } catch (err) {
      console.error('获取历史记录失败', err);
      this.setData({ loading: false });
    }
  },

  // 下拉加载更多
  loadMore() {
    this.fetchRecords();
  },

  // 查看详情
  async viewDetail(e) {
    const item = e.currentTarget.dataset.item;

    this.setData({
      detail: item,
      showDetail: true,
      updateResult: item.result || '',
      selectedReason: '',
      sourceInfo: null,
    });

    // 拉取校友库源信息
    try {
      if (item.sourceId !== null) {
        const res = await wx.cloud.callFunction({
          name: 'alumni',
          data: {
            action: 'getHistorySource',
            source_id: item.sourceId,
          }
        });
        this.setData({ sourceInfo: res.result.data });
      } else {
        this.setData({ sourceInfo: null });
      }
    } catch (err) {
      console.error('获取源信息失败', err);
    }
  },

  // 点击选择确认结果
  chooseResult() {
    const options = ['是校友', '非校友', '不确定'];
    wx.showActionSheet({
      itemList: options,
      success: res => {
        const selected = options[res.tapIndex];
        this.setData({ updateResult: selected });

        // 如果选择“不确定”，自动清空理由
        if (selected === '不确定') {
          this.setData({ selectedReason: '' });
        }
      },
      fail: err => {
        console.log('用户取消选择', err);
      }
    });
  },

  // 点击选择理由
  chooseReason() {
    if (this.data.updateResult === '不确定') {
      wx.showToast({ title: '不确定无需理由', icon: 'none' });
      return;
    }

    const reasonOptions = this.data.reasonOptions;
    wx.showActionSheet({
      itemList: reasonOptions,
      success: res => {
        const selected = reasonOptions[res.tapIndex];

        if (selected === '其他') {
          wx.showModal({
            title: '请输入其他理由',
            editable: true,
            placeholderText: '请输入修改理由',
            success: modalRes => {
              if (modalRes.confirm && modalRes.content.trim()) {
                this.setData({ selectedReason: modalRes.content.trim() });
              } else {
                wx.showToast({ title: '请输入有效理由', icon: 'none' });
              }
            }
          });
        } else {
          this.setData({ selectedReason: selected });
        }
      },
      fail: err => {
        console.log('用户取消选择', err);
      }
    });
  },

  // 提交修改
  async submitUpdate() {
    const { detail, updateResult, selectedReason } = this.data;

    if (!updateResult) {
      wx.showToast({ title: '请选择确认结果', icon: 'none' });
      return;
    }

    // 不确定无需理由
    const reason = updateResult === '不确定' ? '' : selectedReason;

    try {
      console.log(detail)
       const res = await wx.cloud.callFunction({
        name: 'alumni',
        data: {
          action: 'updateReview',
          review_id: detail.Id,
          result: updateResult,
          remark: reason
        }
      });
      console.log(res)

      wx.showToast({ title: '修改成功', icon: 'success' });
      this.setData({ showDetail: false, records: [], page: 1, noMore: false });
      this.fetchRecords();
    } catch (err) {
      console.error('更新失败', err);
      wx.showToast({ title: '更新失败', icon: 'error' });
    }
  },

  closeDetail() {
    this.setData({ showDetail: false });
  }
});

function formatDateTime(dateStr) {
  return dateStr.slice(0, 16).replace('T', ' ');
}