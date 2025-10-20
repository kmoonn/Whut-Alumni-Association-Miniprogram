App({
  onLaunch() {
    wx.cloud.init({
      env: "cloud1-9gmxebo9bcb28c86",
      traceUser: true
    });
    },
    globalData: {
      imageBaseUrl: 'https://636c-cloud1-9gmxebo9bcb28c86-1363518935.tcb.qcloud.la/images/'
    }
});