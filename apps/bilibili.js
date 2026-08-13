import Bili from '../model/bilibili.js'
import moment from 'moment'
import common from '../../../lib/common/common.js'
import Cfg from '../model/Cfg.js'


export default class bilibili extends plugin {
  constructor(e) {
    const trigger = Cfg.get('trigger', '')
    const prefix = trigger ? `(${trigger})` : '(#|＃)'
    super({
      name: 'bilibili',
      priority: -114514,
      rule: [{
          reg: `^${prefix}(全体|匿名)?订阅直播间`,
          fnc: 'setLivePush'
        },
        {
          reg: `^${prefix}取消订阅直播间`,
          fnc: 'delLivePush'
        },
        {
          reg: `^${prefix}(全体|匿名)?订阅(up|UP|Up|uid:|UID:)+`,
          fnc: 'setLivePushByUid'
        },
        {
          reg: `^${prefix}取消订阅(up|UP|Up|uid:|UID:)+`,
          fnc: 'delLivePushByUid'
        },
        {
          reg: `^${prefix}取消全部订阅`,
          fnc: 'cancelAllSubscribe'
        },
        {
          reg: `^${prefix}(我的)?订阅(列表|list)?$`,
          fnc: 'listLivePush'
        },
        {
          reg: `^${prefix}测试推送(开播|下播)?`,
          fnc: 'testPush'
        },
        {
          reg: `^${prefix}开播`,
          fnc: 'checkLive'
        },
        {
          reg: '^#推送群友(开|关)$',
          fnc: 'setSubscribePermission'
        },
        {
          reg: '^#推送前缀',
          fnc: 'setTrigger'
        }
      ]
    })
    this.task = {
        name: 'bililivePush',
        fnc: () => this.livepush(),
        cron: '10 */1 * * * *',
        log: false
      },
      this.e = e
  }

  _processUserId(e) {
    if (/.*全体.*/.test(e.msg)) return 0
    if (/.*匿名.*/.test(e.msg)) return 99999
    return e.user_id
  }

  async _initRenderE(e) {
    if (e?.runtime) return e
    try {
      const Runtime = (await import('../../../lib/plugins/runtime.js')).default
      const tempE = { reply: async () => false }
      await Runtime.init(tempE)
      return tempE
    } catch (err) {
      return null
    }
  }

  checkSubscribePermission(e) {
    if (e.isMaster) return true
    const perm = Cfg.get('subscribePermission', 'all', e)
    if (perm === 'all') return true
    if (perm === 'master') {
      e.reply('暂无权限，仅Bot主人可订阅')
      return false
    }
    if (perm === 'admin') {
      if (!e.member?.is_admin) {
        if (!e.member) return true
        e.reply('暂无权限，仅群管理员及以上可订阅')
        return false
      }
      return true
    }
    return false
  }

  checkAdmin(e) {
    return e.isMaster || !!e.member?.is_admin
  }

  async setSubscribePermission(e) {
    if (!e.isMaster) return e.reply('暂无权限，仅Bot主人可使用')
    const enable = /开/.test(e.msg)
    const perm = enable ? 'all' : 'admin'
    Cfg.set('subscribePermission', perm)
    return e.reply(`已${enable ? '开启' : '关闭'}群友订阅权限（全局，所有群生效）`)
  }

  async setTrigger(e) {
    if (!e.isMaster) return e.reply('暂无权限，仅Bot主人可使用')
    const value = e.msg.replace(/^#推送前缀/, '').trim()

    if (!value) {
      const trigger = Cfg.get('trigger', '')
      return e.reply(`当前前缀：${trigger || '默认(#)'}\n设置：#推送前缀 xxx\n重置：#推送前缀 重置`)
    }

    if (value === '重置') {
      Cfg.set('trigger', '')
      return e.reply('前缀已重置为默认(#)，重启后生效')
    }

    Cfg.set('trigger', value)
    return e.reply(`前缀已设为：${value}，重启后生效`)
  }


  async listLivePush(e) {
    try {
      let ret, key
      let msg = []
      if (/.*我.*/.test(e.msg)) {
        ret = Bili.listLiveData({
          user_id: e.user_id
        })
        key = 'groups'
      } else {
        ret = Bili.listLiveData({
          group_id: e.group_id
        })
        key = 'users'
      }
      ret = await Bili.setRoomInfo(ret)
      for (const {
          uid,
          uname,
          face,
          ...item
        }
        of ret) {
        msg.push([
          segment.image(face),
          `昵称: ${uname}\n`,
          `用户uid: ${uid}\n`,
          `订阅${key}:\n${item[key].map(item => (item == 99999) ? '匿名' : item).join('\n')}`
        ])
      }
      msg = !!msg.length ? await common.makeForwardMsg(e, msg) : '无'
      e.reply(msg)
      return true
    } catch (err) {
      logger.error('[bililivePush-plugin] ' + err.message)
      return e.reply('查询失败：' + err.message)
    }
  }

  async setLivePush(e) {
    if (!this.checkSubscribePermission(e)) return true
    if (/.*全体.*/.test(e.msg) && !this.checkAdmin(e)) return e.reply('全体订阅仅管理员及以上可使用')
    const user_id = this._processUserId(e)
    const room_id = /[0-9]+/.exec(e.msg)?.[0]
    if (!room_id || isNaN(room_id)) {
      return e.reply("直播间id格式不对！请输入数字！")
    }
    try {
      const { uid, face, uname } = await Bili.getRoomInfo(room_id)
      if (!uid) {
        return e.reply("不存在该直播间！")
      }
      Bili.setLiveData({ room_id, uid, group_id: e.group_id, user_id })
      return e.reply([segment.image(face), `${uname}直播间订阅成功！`])
    } catch (err) {
      logger.error('[bililivePush-plugin] ' + err.message)
      return e.reply('订阅失败：' + err.message)
    }
  }

  async setLivePushByUid(e) {
    if (!this.checkSubscribePermission(e)) return true
    if (/.*全体.*/.test(e.msg) && !this.checkAdmin(e)) return e.reply('全体订阅仅管理员及以上可使用')
    const user_id = this._processUserId(e)
    const id = /[0-9]+/.exec(e.msg)?.[0]
    if (!id || isNaN(id)) {
      return e.reply("格式不对！请输入数字！")
    }
    let uid, room_id, face, uname
    try {
      const info = await Bili.getRoomInfoByUid(id)
      uid = id
      room_id = info.room_id
      face = info.face
      uname = info.uname
    } catch {
      try {
        const info = await Bili.getRoomInfo(id)
        uid = info.uid
        room_id = id
        face = info.face
        uname = info.uname
      } catch {
        return e.reply(`查询失败：${id} 既不是有效的UID也不是有效的直播间号`)
      }
    }
    if (!room_id) {
      return e.reply("不存在该直播间！")
    }
    Bili.setLiveData({ room_id, uid, group_id: e.group_id, user_id })
    return e.reply([segment.image(face), `${uname}直播间订阅成功！`])
  }

  async _delSubscription(e, uid) {
    if (!uid) return e.reply("不存在该直播间！")
    const data = Bili.getLiveData()?.data || {}
    const group = data[uid]?.group?.[e.group_id]
    if (!group?.length) return e.reply("本群还没有订阅该直播间！")

    if (this.checkAdmin(e)) {
      Bili.delLiveDataAll({ uid, group_id: e.group_id })
      return e.reply("取消直播间订阅成功！")
    }

    if (!group.includes(e.user_id)) {
      return e.reply("你还没有订阅该直播间！")
    }
    Bili.delLiveData({ uid, group_id: e.group_id, user_id: e.user_id })
    return e.reply("取消直播间订阅成功！")
  }

  async delLivePush(e) {
    const room_id = /[0-9]+/.exec(e.msg)?.[0]
    if (!room_id || isNaN(room_id)) {
      return e.reply("直播间id格式不对！请输入数字！")
    }
    try {
      const { uid } = await Bili.getRoomInfo(room_id)
      return this._delSubscription(e, uid)
    } catch (err) {
      logger.error('[bililivePush-plugin] ' + err.message)
      return e.reply('取消订阅失败：' + err.message)
    }
  }

  async delLivePushByUid(e) {
    const uid = /[0-9]+/.exec(e.msg)?.[0]
    if (!uid || isNaN(uid)) {
      return e.reply("uid格式不对！请输入数字！")
    }
    return this._delSubscription(e, uid)
  }

  async sendLiveStartMessage(groupId, userIds, roomInfo, renderE) {
    const { room_id, cover_from_user, uname, title, uid, online, live_time, area_v2_parent_name, area_v2_name } = roomInfo
    const userMentions = userIds.filter(item => item != 99999).map(item => segment.at(item == 0 ? 'all' : item))
    const coverImage = cover_from_user || roomInfo.user_cover

    const message = [
      ...userMentions,
      ...(coverImage ? [segment.image(coverImage)] : []),
      `昵称: ${uname}\n`,
      `用户uid: ${uid}\n`,
      `标题: ${title}\n`,
      `分区: ${area_v2_parent_name}-${area_v2_name}\n`,
      `历史人次: ${online}\n`,
      `开播时间: ${moment(live_time).format('YYYY-MM-DD HH:mm:ss')}\n`,
      `直播间地址: https://live.bilibili.com/${room_id}`
    ]
    if (Cfg.get('user.forward', false)) {
      Bot.pickGroup(groupId).sendMsg(await common.makeForwardMsg(renderE, [message]))

    } else {
      Bot.pickGroup(groupId).sendMsg(message)
    }
  }

  async sendLiveEndMessage(groupId, roomInfo, liveDuration, renderE) {
    const { cover_from_user, user_cover, room_id } = roomInfo
    const coverImage = cover_from_user || user_cover

    const message = [
      ...(coverImage ? [segment.image(coverImage)] : []),
      '主播下播la~~~~\n',
      `本次直播时长: ${liveDuration}`
    ]
    Bot.pickGroup(groupId).sendMsg(message)
  }

  async cancelAllSubscribe(e) {
    if (!this.checkAdmin(e)) {
      return e.reply('暂无权限，仅管理员及以上可使用')
    }
    const data = Bili.getLiveData()?.data || {}
    let count = 0
    for (const uid of Object.keys(data)) {
      if (data[uid]?.group?.[e.group_id]) {
        Bili.delLiveDataAll({ uid, group_id: e.group_id })
        count++
      }
    }
    return e.reply(count ? `已取消本群全部订阅（共${count}个直播间）` : '本群没有任何订阅')
  }

  async checkLive(e) {
    try {
      const allData = Bili.getLiveData()?.data || {}
      const subscriptions = Object.values(allData)
      if (!subscriptions.length) return e.reply('当前没有任何订阅')
      const liveData = await Bili.setRoomInfo(subscriptions)
      const renderE = await this._initRenderE(e)
      let count = 0

      for (const { group, ...roomInfo } of liveData) {
        if (!group?.[e.group_id]) continue
        roomInfo.live_time *= 1000
        if (roomInfo.live_status === 1) {
          await this.sendLiveStartMessage(e.group_id, [0], roomInfo, renderE)
          count++
        }
      }

      if (!count) return e.reply('当前没有正在开播的订阅直播间')
      return e.reply(`已推送 ${count} 个正在开播的直播间`)
    } catch (err) {
      logger.error('[bililivePush-plugin] ' + err.message)
      return e.reply('检查失败：' + err.message)
    }
  }

  async testPush(e) {
    if (!e.isMaster) {
      return e.reply('暂无权限，仅Bot主人可使用测试推送')
    }
    if (!e.group_id) {
      return e.reply('测试推送需在群聊中使用，以便确认推送效果')
    }
    const msg = e.msg.trim()
    const pushType = msg.includes('下播') ? 'end' : 'start'

    const roomIdMatch = /(?:直播间|room|房间|room_id)[：:_]*(\d+)/i.exec(msg)
    const uidMatch = /(?:uid|up)[：:]*(\d+)/i.exec(msg)
    let room_id = roomIdMatch?.[1]
    let uid = uidMatch?.[1]

    if (!room_id && !uid) {
      return e.reply('请指定要测试的房间ID或UID，格式：\n#测试推送开播 直播间123456\n#测试推送下播 uid:123456')
    }

    try {
      const basicInfo = room_id ? await Bili.getRoomInfo(room_id) : await Bili.getRoomInfoByUid(uid)
      if (!basicInfo || (!basicInfo.uid && !uid)) {
        return e.reply(`获取房间信息失败，${room_id ? `房间ID: ${room_id}` : `UID: ${uid}`}`)
      }
      const targetUid = uid || basicInfo.uid
      const fullInfo = await Bili.BApi.getRoomInfobyUids([targetUid])
      let roomInfo
      if (fullInfo?.[targetUid]) {
        roomInfo = {
          ...basicInfo,
          ...fullInfo[targetUid],
          cover_from_user: fullInfo[targetUid].cover_from_user || basicInfo.user_cover,
          user_cover: basicInfo.user_cover || fullInfo[targetUid].cover_from_user
        }
      } else {
        roomInfo = basicInfo
      }

      if (!roomInfo.cover_from_user && roomInfo.user_cover) {
        roomInfo.cover_from_user = roomInfo.user_cover
      }
      roomInfo.live_time = roomInfo.live_time || Date.now()
      roomInfo.area_v2_parent_name = roomInfo.area_v2_parent_name || '测试分区'
      roomInfo.area_v2_name = roomInfo.area_v2_name || '测试子分区'

      const renderE = await this._initRenderE(e)
      const groupId = e.group_id
      const userIds = [e.user_id]

      if (pushType === 'start') {
        if (roomInfo.live_status !== 1) {
          const statusMsg = [
            segment.image(roomInfo.cover_from_user || roomInfo.user_cover),
            `主播: ${roomInfo.uname || '未知'}\n`,
            `房间号: ${roomInfo.room_id || room_id}\n`,
            `状态: 未在直播\n`,
            `标题: ${roomInfo.title || '无'}`
          ]
          await Bot.pickGroup(groupId).sendMsg(statusMsg)
          return e.reply('该直播间当前未在直播，已发送未开播状态')
        }
        await this.sendLiveStartMessage(groupId, userIds, roomInfo, renderE)
        return e.reply('测试开播推送已发送')
      } else {
        await this.sendLiveEndMessage(groupId, roomInfo, '1小时30分钟', renderE)
        return e.reply('测试下播推送已发送')
      }
    } catch (err) {
      logger.error('测试推送失败', err)
      return e.reply(`测试推送失败: ${err.message}`)
    }
  }

  async livepush(e) {
    try {
      const allData = Bili.getLiveData()?.data || {}
      const subscriptions = Object.values(allData)
      if (!subscriptions.length) return
      const liveData = await Bili.setRoomInfo(subscriptions)
      const renderE = await this._initRenderE(e)
      const sleep = Cfg.get('user.sleep', 0) * 1000
      const rePush = Cfg.get('rePush', false)
      const msleep = () => sleep > 0 ? new Promise(resolve => setTimeout(resolve, sleep)) : Promise.resolve()

      for (const { group, ...roomInfo } of liveData) {
        roomInfo.live_time *= 1000
        const { room_id, live_status, title, area_v2_parent_name, area_v2_name } = roomInfo
        const redisKey = `bililive_${room_id}`
        const cached = await redis.get(redisKey)
        const cachedData = cached ? JSON.parse(cached) : null
        const key = `${title}-${area_v2_parent_name}-${area_v2_name}`


        if (live_status === 1 && (!cached || (rePush && key !== cachedData?.key))) {
          await redis.set(redisKey, JSON.stringify({ live_time: roomInfo.live_time, key }))
          for (const [groupId, userIds] of Object.entries(group)) {
            await this.sendLiveStartMessage(groupId, userIds, roomInfo, renderE)
            await msleep()
          }
        } else if (live_status != 1 && cached) {
          await redis.del(redisKey)
          if (!Cfg.get('user.endPush', true)) continue
          const { live_time } = cachedData
          const liveDuration = this.getDealTime(moment(live_time), moment())
          for (const [groupId] of Object.entries(group)) {
            await this.sendLiveEndMessage(groupId, roomInfo, liveDuration, renderE)
            await msleep()
          }
        }
      }
    } catch (err) {
      logger.error('[bililivePush-plugin] livepush error: ' + err.message)
    }
  }

  getDealTime(stime, etime) {
    let str = ''
    let dura = etime.format('x') - stime.format('x')
    let tempTime = moment.duration(dura)
    str += tempTime.years() ? tempTime.years() + '年' : ''
    str += tempTime.months() ? tempTime.months() + '月' : ''
    str += tempTime.days() ? tempTime.days() + '日' : ''
    str += tempTime.hours() ? tempTime.hours() + '小时' : ''
    str += tempTime.minutes() ? tempTime.minutes() + '分钟' : ''
    if (dura <= 5 * 60 * 1000) str += `\n(没关系的, ${str}也很厉害了)`
    return str
  }
}
