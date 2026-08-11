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
    title: '#[订阅|取消订阅]UP[UP的uid]',
    desc: '如题(一般用这个)'
  },
    {
      icon: 71,
      title: '#[订阅|取消订阅]直播间[直播间room_id]',
      desc: '如题'
    },
    {
      icon: 74,
      title: 'Tips',
      desc: '如需艾特全体，指令前加"全体"二字'
    },
    {
      icon: 74,
      title: 'Tips',
      desc: '如需不需艾特自己，指令前加"匿名"二字'
    },
    {
      icon: 75,
      title: '#订阅列表',
      desc: '查看本群订阅'
    },
    {
      icon: 75,
      title: '#我的订阅列表',
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
      desc: '检查正在开播的订阅并@全体推送'
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
