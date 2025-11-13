Page({
  data: {
    imageBaseUrl: '',
    fullServiceList: [],
    visibleServiceList: []
  },

  onLoad: function() {
    const app = getApp();
    this.setData({
      imageBaseUrl: app.globalData.imageBaseUrl
    });
    
    const fullList = [
      {
        name: '校友推荐',
        icon: 'apply.png',
        path: '/alumni/pages/apply/apply',
        key: 'apply'
      },
      {
        name: '校友确认',
        icon: 'check.png',
        path: '/alumni/pages/check/dept/dept',
        key: 'check'
      },
      {
        name: '在库校友',
        icon: 'famous.png',
        path: '/alumni/pages/famous/famous',
        key: 'famous'
      },
      {
        name: '校友搜索',
        icon: 'search.png',
        path: '/service/pages/search/search',
        key: 'search'
      },
      {
        name: '校友地图',
        icon: 'map.png',
        path: '/service/pages/map/map',
        key: 'map'
      },
      {
        name:"推荐历史",
        icon: 'recommend_history.png',
        path: '/service/pages/apply_history/apply_history',
        key: 'apply_history'

      },
      {
        name: '确认历史',
        icon: 'history.png',
        path: '/service/pages/history/history',
        key: 'history'
      },
      {
        name: '排行榜',
        icon: 'ranks.png',
        path: '/service/pages/ranks/ranks',
        key: 'ranks'
      },
    ];

    const userInfo = wx.getStorageSync('userInfo');
    const userRole = userInfo ? userInfo.role : null;

    let userPermissions = [];

    if (userRole === 'admin' || userRole === 'leader') {
      userPermissions = ['apply', 'apply_history', 'check', 'history', 'famous', 'search', 'map','ranks'];
    } else {
      userPermissions = ['apply', 'apply_history', 'check', 'history','ranks'];
    }
    // console.log(userPermissions)

    const visible = fullList.filter(item => userPermissions.includes(item.key));

    this.setData({
      fullServiceList: fullList,
      visibleServiceList: visible
    });
  },

  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path
    });
  }
});
