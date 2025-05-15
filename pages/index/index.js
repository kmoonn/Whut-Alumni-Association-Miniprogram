Page({
  data: {
    newsList: [], // 新闻列表
    activities: [], // 活动列表
    // companies: [] // 公司列表
  },

  onLoad() {
    this.fetchData();
  },

  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async fetchData() {
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    });
    try {
      const [newsList, activities, companies] = await Promise.all([
        getNewsList(),
        getActivities()
        // getCompanies()
      ]);
      // 处理新闻列表，只保留最新的两条
    const sortedNewsList = newsList.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    const latestNewsList = sortedNewsList.slice(0, 3);

    // 处理活动列表，只保留最新的两条
    const sortedActivities = activities.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    const latestActivities = sortedActivities.slice(0, 3);

    // 处理公司列表，只保留最新的两条
    // const sortedCompanies = companies.sort((a, b) => {
    //   return new Date(b.date) - new Date(a.date);
    // });
    // const latestCompanies = sortedCompanies.slice(0, 3);

    this.setData({
      newsList: latestNewsList,
      activities: latestActivities,
      // companies: latestCompanies
    });
  
      console.log('获取数据成功：', { newsList, activities });
    } catch (error) {
      console.error('获取首页数据失败：', error);
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  navigateTo(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  }
});

// 模拟获取新闻列表
function getNewsList() {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '加载中' });
    wx.cloud.callFunction({
      name: 'service',
      data: {
        action: 'getNews',
      },
      success: res => {
        if (res.result.code === 200) {
          const newsList = res.result.result;
          newsList.forEach(news => {
            if (news.date) {
              const formatDate = date => {
                let d = new Date(date);
                return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
              };
               news.date = formatDate(news.date);
            }
          });
          // 处理成功，将处理后的数据传递给 Promise 的 resolve 方法
          resolve(newsList);
        } else {
          reject(new Error(`获取新闻列表失败，错误码: ${res.result.code}`));
        }
      },
      fail: err => {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
}


// 获取活动列表
function getActivities() {
  return new Promise((resolve, reject) => {
      wx.showLoading({ title: '加载中' });
      wx.cloud.callFunction({
          name: 'service',
          data: {
              action: 'getActivity',
          },
          success: res => {
              if (res.result.code === 200) {
                  const activities = res.result.result;
                  activities.forEach(activity => {
                      if (activity.date) {
                          const date = new Date(activity.date);
                          activity.date = date.toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                          });
                          // 新增月份和日期属性
                          activity.month = date.getMonth() + 1; // getMonth 返回 0 - 11，所以要加 1
                          activity.day = date.getDate();
                      }
                  });
                  // 处理成功，将处理后的数据传递给 Promise 的 resolve 方法
                  resolve(activities);
              } else {
                  // 若返回码不是 200，视为请求失败，抛出错误信息
                  reject(new Error(`获取活动列表失败，错误码: ${res.result.code}`));
              }
          },
          fail: err => {
              console.error('获取活动详情失败', err);
              wx.showToast({
                  title: '获取数据失败',
                  icon: 'none'
              });
              reject(err);
          },
          complete: () => {
              wx.hideLoading();
          }
      });
  });
}

// // 模拟获取公司列表
// function getCompanies() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const companies = [
//         { id: 1, name: '校友科技', industry: '', logo: 'https://636c-cloud1-6gsqyvkd3f24bdd8-1311119192.tcb.qcloud.la/images/default-avatar.jpg' },
//         { id: 2, name: '校友金融', industry: '', logo: 'https://636c-cloud1-6gsqyvkd3f24bdd8-1311119192.tcb.qcloud.la/images/default-avatar.jpg' }
//       ];
//       resolve(companies);
//     }, 1000);
//   });
// }