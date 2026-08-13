import {
  pluginName
} from "./constant.js"

export const helpCfg = {
  title: '推送帮助',
  subTitle: pluginName,
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: [/*'default'*/],
  style: {
    fontColor: '#d3bc8e',
    descColor: '#eee',
    contBgColor: 'rgba(6, 21, 31, .5)',
    contBgBlur: 3,
    headerBgColor: 'rgba(6, 21, 31, .4)',
    rowBgColor1: 'rgba(6, 21, 31, .2)',
    rowBgColor2: 'rgba(6, 21, 31, .35)'
  }
}

export const helpList = [{
  group: '"[]"内为必填项,"{}"内为可填项,"|"表选择'
}, {
  group: '订阅命令',
  list: [{
    icon: 71,
    title: '#[全体|匿名]订阅UP[UID]',
    desc: '按UID订阅(全体需管理员)'
  },
    {
      icon: 71,
      title: '#[全体|匿名]订阅直播间[房间号]',
      desc: '按房间号订阅(全体需管理员)'
    },
    {
      icon: 74,
      title: 'Tips',
      desc: '全体: @全体成员(需管理员) 匿名: 不@自己'
    },
    {
      icon: 75,
      title: '#订阅列表',
      desc: '查看本群订阅'
    },
    {
      icon: 75,
      title: '#我的订阅',
      desc: '查看自己订阅'
    },
    {
      icon: 75,
      title: '#取消全部订阅',
      desc: '管理员清空本群订阅'
    }]
}, {
  group: '管理命令',
  list: [{
      icon: 85,
      title: '#开播',
      desc: '检查正在开播的订阅并推送'
    },
    {
      icon: 85,
      title: '#测试推送[开播|下播] [直播间|uid:]ID',
      desc: '测试推送效果(仅主人)'
    },
    {
      icon: 85,
      title: '#推送群友[开|关]',
      desc: '开关群友订阅权限(仅主人)'
    },
    {
      icon: 85,
      title: '#推送前缀 [前缀|重置]',
      desc: '设置指令前缀(仅主人)'
    }]
}]
