# Whut-Alumni-Association-Miniprogram

# 武汉理工大学校友会微信小程序

武汉理工大学校友会微信小程序是一个服务于武汉理工大学校友处领导、全校各级部门教职工的服务平台，旨在挖掘知名校友、加强知名校友与母校之间的联系，促进知名校友之间的交流与合作。

## 主要功能

### 1. 校友推荐
- 可以申报身边已知校友信息
- 提供便捷的信息填写界面

### 2. 校友确认
- 可以查看待审核的校友信息
- 提供详细的审核记录

### 3. 知名校友
- 展示学校知名校友信息
- 按照政商学等多维度分类

### 4. 校友地图
- 查找指定范围内校友工作单位
- 搜索关键字模糊查询校友信息

### 5. 校友活动、校友企业

## 技术栈
- 微信小程序原生开发框架
- 腾讯云开发
- MySQL
- 腾讯地图 API

## 项目结构

```text
WHUT-Alumni-Association-MINIPROGRAM
├─ alumnus 校友模块
│  └─ pages
│     ├─ apply
│     ├─ check
│     ├─ famous
│     └─ famous_detail
├─ cloudfunctions 云函数
│  ├─ apply
│  ├─ check
│  ├─ getActivity
│  ├─ getActivityDetail
│  ├─ getAlumnus
│  ├─ getAlumnusDetail
│  ├─ getCompany
│  ├─ getCompanyDetail
│  ├─ getNews
│  ├─ getVisualData
│  ├─ login
│  ├─ register
│  └─ search
├─ components 组件
│  ├─ iView
│  └─ navigation-bar
├─ images 静态资源
├─ pages 全局模块
│  ├─ index
│  ├─ login
│  ├─ my
│  ├─ service
│  └─ utils
├─ service 服务模块
│  ├─ ec-canvas
│  ├─ pages
│  │  ├─ activity
│  │  ├─ activityDetail
│  │  ├─ company
│  │  ├─ companyDetail
│  │  ├─ nearby
│  │  ├─ search
│  │  └─ visual
│  └─ utils
└─ sql 数据库文件
```

## 版权说明

© 2025 武汉理工大学。保留所有权利。
