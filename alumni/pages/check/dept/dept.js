Page({
    data: {
        departmentList: [],
        selectedDepartments: []
    },
    onLoad: function() {
        this.deptList();
    },

    onCheckboxChange(e) {
        this.setData({
            selectedDepartments: e.detail.value
        });
    },

    deptList() {
        wx.showLoading({ title: '加载中' });
        wx.cloud.callFunction({
            name: 'service',
            data: {
                action: 'listDept',
            },
            success: res => {
                if (res.result.code === 200) {
                    const deptList = res.result.result.map(item => item.dept_name);
                    deptList.push('其他');
                    this.setData({
                        departmentList: deptList
                    });
                }
            },
            fail: err => {
                console.error('获取学院列表失败', err);
                wx.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                });
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },

    onConfirm () {
        const selected = this.data.selectedDepartments;
        const query = encodeURIComponent(JSON.stringify(selected));
        wx.navigateTo({
            url: `/alumni/pages/check/check?departments=${query}`
        });
    }
});