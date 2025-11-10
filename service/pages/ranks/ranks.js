Page({
  data: {
    rankings: [],
    imageBaseUrl: '',
    medals: [
      'gold.png',
      'silver.png',
      'bronze.png'
    ]
  },

  onLoad() {
    const app = getApp();
    this.setData({
      imageBaseUrl: app.globalData.imageBaseUrl
    });
    
    wx.cloud.callFunction({
      name:"alumni",
      data:{
        action:"getRanks"
      },
      success: res => {
        if (res.result.code === 200) {
          console.log(res)
          this.setData({
            rankings:res.result.data.list
          })  
        }
      }
    })

   
  }
});
