Page({
  data: {
    searchValue: '',
    searchHistory: [],
    alumniList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    const app = getApp();
    this.setData({
      imageBaseUrl: app.globalData.imageBaseUrl
    });
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })
  },
  
  onPullDownRefresh() {
    this.setData({
      alumniList: [],
      page: 1,
      hasMore: true
    })
    this.fetchSearchResults().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.fetchSearchResults()
    }
  },

  onShareAppMessage() {
    return {
      title: '校友查找',
      path: '/service/pages/search/search'
    }
  },

  // 输入搜索内容
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },  

  // 清空搜索
  clearSearch() {
    this.setData({
      searchValue: '',
      alumniList: [],
      page: 1,
      hasMore: true
    })
  },

  // 搜索
  onSearch() {
    const { searchValue } = this.data
    if (!searchValue.trim()) return

    // 保存搜索历史
    let history = this.data.searchHistory
    if (!history.includes(searchValue)) {
      history.unshift(searchValue)
      if (history.length > 10) history.pop()
      this.setData({ searchHistory: history })
      wx.setStorageSync('searchHistory', history)
    }

    // 重置列表
    this.setData({
      alumniList: [],
      page: 1,
      hasMore: true
    })

    // 开始搜索
    this.fetchSearchResults()
  },

  // 点击搜索历史
  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ searchValue: keyword }, () => {
      this.onSearch()
    })
  },

  // 清空搜索历史
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] })
          wx.removeStorageSync('searchHistory')
        }
      }
    })
  },

  // 获取搜索结果
  async fetchSearchResults() {
    const { searchValue, page, pageSize } = this.data
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'service',
        data: {
          action: 'search',
          keyword: searchValue,
          page,
          pageSize
        }
      })

      const { data, hasMore } = result
      
      this.setData({
        alumniList: [...this.data.alumniList, ...data],
        hasMore,
        page: page + 1,
        loading: false
      })
    } catch (error) {
      console.error('搜索失败：', error)
      wx.showToast({
        title: '搜索失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },
  
  // 加载更多数据
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.fetchSearchResults()
    }
  },
  
  // 显示校友详情
  showDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log(id)
    if (id) {
      wx.navigateTo({
        url: `/alumni/pages/famous/detail/detail?id=${id}`
      });
    } else {
      console.error('未获取到有效的 id');
      wx.showToast({
        title: '无法获取校友详情',
        icon: 'none'
      });
    }
  }
})