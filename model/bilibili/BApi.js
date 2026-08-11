import fetch from "node-fetch"

const FETCH_TIMEOUT = 10000

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

class BApi {
  async getRoomInfo(room_id) {
    const response = await fetchWithTimeout(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${room_id}`, {
      headers: {},
    })
    const res = await response.json()
    if (res.code !== 0) {
      logger.error(res.msg || res.message)
      return false
    }
    const {
      uid,
      online,
      live_status,
      user_cover,
      live_time,
      title
    } = res.data
    return {
      uid,
      room_id,
      online,
      live_status,
      user_cover,
      live_time,
      title
    }
  }

  async getRoomInfobyUid(uid) {
    return (await this.getRoomInfobyUids([uid]))?.[uid]
  }

  async getRoomInfobyUids(uids) {
    if (!uids?.length) return {}
    const params = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'uids': uids.map(item => parseInt(item))
      })
    }
    const response = await fetchWithTimeout('https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids', params)
    const res = await response.json()
    if (res.code !== 0) {
      logger.error(res.msg || res.message)
      return false
    }
    return res.data
  }
}

export default new BApi()
