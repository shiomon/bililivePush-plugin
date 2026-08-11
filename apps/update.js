import { pluginName } from "../config/constant.js"
import upgrade from '../model/upgrade.js'

let Update = null
try {
  Update = (await import("../../other/update.js").catch(e => null))?.update
  Update ||= (await import("../../system/apps/update.ts")).update
} catch (e) {
  logger.error(`[${pluginName}]未获取到更新js ${logger.yellow("更新功能")} 将无法使用`)
}

export class update extends plugin {
  constructor() {
    super({
      name: "推送更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: `^#*(推送|${pluginName})(插件)?(强制)?更新|^#*(强制)?更新(推送|${pluginName})(插件)?`,
          fnc: "update"

        }
      ]
    })
  }
  
  async init() {
    await upgrade()
  }

  async update(e = this.e) {
    if (!e.isMaster) return
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新${pluginName}`
    const up = new Update(e)
    up.e = e
    return up.update()
  }

}
