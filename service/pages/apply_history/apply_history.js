Page({
  data: {
    list: [],
    page: 1,
    pageSize: 10,
    loading: false,
    refreshing: false,
    finished: false,
  },

  onLoad() {
    this.loadData();
  },

  async loadData(refresh = false) {
    if (this.data.loading || this.data.finished) return;

    this.setData({ loading: true });

    const page = refresh ? 1 : this.data.page;
    const user_id = wx.getStorageSync('userInfo').id;

    try {
      const res = await wx.cloud.callFunction({
        name: 'alumni',
        data: {
          action: "getRecommendHistory",
          user_id,
          page,
          pageSize: this.data.pageSize
        }
      });

      const data = res.result?.data?.list || [];
      data.forEach(item => {
        if (item.created_at) {
          item.created_at = formatDateTime(item.created_at);
        }
      });

      this.setData({
        list: refresh ? data : [...this.data.list, ...data],
        page: page + 1,
        finished: data.length < this.data.pageSize,
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false, refreshing: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ refreshing: true, finished: false });
    this.loadData(true);
  },

  // 滚动到底部加载更多
  onReachBottom() {
    this.loadData();
  },
 // WXML 里使用的过滤器
 toJson(item) {
  return JSON.stringify(item);
},

goToEdit(e) {
  const index = e.currentTarget.dataset.index;

  try {
    const item = this.data.list[index];
    console.log(item)
    wx.navigateTo({
      url: `/service/pages/edit_apply/edit_apply?alum=${encodeURIComponent(JSON.stringify(item))}`
    });
  } catch (err) {
    console.error('解析校友数据失败', err);
    wx.showToast({ title: '跳转失败', icon: 'none' });
  }
},
});

function formatDateTime(dateStr) {
  return dateStr.slice(0, 16).replace('T', ' ');
}