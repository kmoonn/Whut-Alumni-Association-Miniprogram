Page({
  data: {
    newsList: [], // 新闻列表
    activities: [], // 活动列表
    modalShow: true,
    taskInfo: {
      title: '任务提醒',
      btnText: '我已知晓',
      tasks: [
        {
          id: 1,
          name: '校友推荐 ',
          desc: '推荐 5 名有效重点校友信息',
          progress: 0,
          targetPage: '/alumni/pages/apply/apply'
        },
        {
          id: 2,
          name: '校友确认',
          desc: '确认 100 条待确认校友信息',
          progress: 0,
          targetPage: '/alumni/pages/check/dept/dept'
        },
      ]
    }
  },
  handleTaskBtn(){
    this.setData({
      modalShow: false
    })
  },

  onShow() {
    this.getTaskDetail();
  },

  goToTaskPage(e) {
    const targetPage = e.currentTarget.dataset.page;
    this.setData({
      modalShow: false
    });
    
    if (targetPage) {
      wx.navigateTo({
        url: targetPage,
        success: () => {
          console.log('跳转成功');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
        }
      });
    }
  },

  closeModal() {
    this.setData({ taskModalShow: false });
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
      ]);
      // 处理新闻列表，只保留最新的两条
    const sortedNewsList = newsList.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    const latestNewsList = sortedNewsList.slice(0, 5);

    // 处理活动列表，只保留最新的两条
    const sortedActivities = activities.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    const latestActivities = sortedActivities.slice(0, 3);
    this.setData({
      newsList: latestNewsList,
      activities: latestActivities,
    });
    } catch (error) {
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
  },

  // 显示弹窗
  showModal() {
    this.getTaskDetail();
    this.setData({
      modalShow: true
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      modalShow: false
    });
  },

  // 跳转到任务页面
  navigateToTask(e) {
    const { id, page } = e.detail;
    console.log(`跳转到任务ID: ${id}，页面: ${page}`);
    wx.navigateTo({
      url: page + '?id=' + id
    });
  },

  // 处理任务
  handleTaskAction() {
    console.log('开始处理任务...');
    // 这里可以添加处理任务的逻辑
    this.hideModal();
  },

  getTaskDetail () {
    const reviewerId = wx.getStorageSync('userInfo').id;
    wx.cloud.callFunction({
      name: 'alumni',
      data: {
        action: 'catchTaskDetail',
        reviewerId: reviewerId
      }
    }).then(res => {
      if (res.result.code === 200) {
        const { taskCount, applyCount } = res.result.data;
        this.setData({
          'taskInfo.tasks[0].progress': applyCount*100/5,
          'taskInfo.tasks[1].progress':taskCount
        });
      }
    }).catch(err => {
      console.error('获取待确认数据失败', err);
    });
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


