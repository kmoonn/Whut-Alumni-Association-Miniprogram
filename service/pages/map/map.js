Page({
  data: {
    imageBaseUrl: '',
    latitude: 0,
    longitude: 0,
    scale: 5,
    markers: [],
    companies: [],
    selectorVisible: false,
    selectedProvince: null,
    selectedCity: null,
    showPanel: false,
  },

  onLoad: function () {
    const app = getApp();
    this.setData({
      imageBaseUrl: app.globalData.imageBaseUrl
    });
    this.getUserLocation();
    this.loadCompanies();
  },

  showSelector() {
    this.setData({
      selectorVisible: true,
    });
  },

  onSelectCity(e) {
    const { province,city } = e.detail;
    this.setData({
      selectedProvince: province.fullname,
      selectedCity: city.fullname,
      latitude: city.location.latitude,
      longitude: city.location.longitude,
      scale: 10
    });
    if(this.data.selectedCity == '深圳市' ) {
      this.loadCompanies('深圳市');
    } else {
    this.loadCompanies(this.data.selectedProvince);
  }
  },

  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        wx.showToast({ title: '无法获取位置', icon: 'none' });
      }
    });
  },

  loadCompanies(region = '%') {
    wx.cloud.callFunction({
      name: 'service',
      data: { action: 'getCompanyList',
      region: region
     },
      success: res => {
        if (res.result.success === 200) {
          const companies = res.result.result;
          const markers = companies.map(company => ({
            id: company.id,
            latitude: company.lat,
            longitude: company.lng,
            iconPath: this.data.imageBaseUrl+'%E5%85%AC%E5%8F%B8.png?sign=923f7a43ecd0482006466de99a4a793c&t=1760937731',
            width: 30,
            height: 30
          }));
          this.setData({
            markers,
            companies
          });
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      },
      fail: error => {
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 地图标记点击事件
  onMarkerTap(e) {
    const markerId = e.markerId;
    const company = this.data.companies.find(item => item.id === markerId).company;
    wx.navigateTo({
      url: `/service/pages/map/alumni/alumni?company=${company}`
    });
  },

  togglePanel() {
    this.setData({
      showPanel: !this.data.showPanel
    });
  },

  // 点击列表项
  onCompanyTap(e) {
    const id = e.currentTarget.dataset.id;
    const company = this.data.companies.find(item => item.id === id).company;
    console.log(company);
    wx.navigateTo({
      url: `/service/pages/map/alumni/alumni?company=${company}`
    });
  },

  resetLocation() {
    this.setData({
      scale: 12,
      selectedCity: null,  // 清除选中的城市
      selectedProvince: null  // 清除选中的省份
    });
    this.getUserLocation();
    this.loadCompanies();
  }

});
