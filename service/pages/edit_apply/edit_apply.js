Page({
  data: {
    category_to_select: ['政界', '商界', '学界', '其他'],
    category: [],       // 最终选中的数组
    checkboxItems: [],  // 每个选项的 { Name, checked }
    name: '',
    region: '',
    company: '',
    position: '',
    graduation_year: '',
    education: '',
    department: '',
    major: '',
    phone: '',
    deeds: ''
  },

  onLoad(options) {
    // 初始化 checkboxItems
    const items = this.data.category_to_select.map(name => ({
      Name: name,
      checked: false
    }));

    let selected = [];
    if (options.alum) {
      const alum = JSON.parse(decodeURIComponent(options.alum));

      // 格式化 category
      if (alum.category) {
        selected = Array.isArray(alum.category) ? alum.category : [alum.category];
        selected = selected.map(s => String(s).trim());
      }

      // 更新 checkboxItems 中的 checked
      items.forEach(item => {
        if (selected.indexOf(item.Name) !== -1) item.checked = true;
      });

      this.setData({
        category: selected,
        checkboxItems: items,
        name: alum.name || '',
        region: alum.region || '',
        company: alum.company || '',
        position: alum.position || '',
        graduation_year: alum.graduation_year || '',
        education: alum.education || '',
        department: alum.department || '',
        major: alum.major || '',
        phone: alum.phone || '',
        deeds: alum.deeds || ''
      });
    } else {
      this.setData({ checkboxItems: items });
    }
  },

  onCategoryChange(e) {
    const selected = e.detail.value; // 当前勾选的 Name 数组

    // 更新 checkboxItems 的 checked 状态
    this.data.checkboxItems.forEach(item => {
      item.checked = selected.indexOf(item.Name) !== -1;
    });

    this.setData({
      checkboxItems: this.data.checkboxItems,
      category: selected
    });

    console.log('当前选中类别:', selected);
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onRegionChange(e) {
    this.setData({ region: e.detail.value.join(' ') });
  },

  onDateChange(e) {
    this.setData({ graduation_year: e.detail.value });
  },

  submitForm() {
    console.log('提交的类别数组:', this.data.category);
  }
});
