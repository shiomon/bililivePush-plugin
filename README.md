## bililivePush-plugin
修改版本
### 根目录安装
国内环境 
```
git clone --depth=1 https://gh-proxy.com/https://github.com/shiomon/bililivePush-plugin.git ./plugins/bililivePush-plugin
```
国外环境
```
git clone --depth=1 https://github.com/shiomon/bililivePush-plugin.git ./plugins/bililivePush-plugin
```

### 更新变更（仅列与旧版不一致处）
|指令|功能|
|-------|-------|
|#订阅列表|查看本群订阅（原 `#本群订阅列表` 已合并）|
|#我的订阅列表|查看自己订阅|
|#取消全部订阅|管理员清空本群全部订阅|
|#开播|检查正在开播的订阅并@全体推送（管理员）|
|#测试推送[开播\|下播] [直播间\|uid:]ID|测试推送效果（仅Bot主人）|
|#推送群友[开\|关]|开关群友订阅权限（仅Bot主人，全局生效）|
|#推送前缀 [前缀\|重置]|设置指令前缀（仅Bot主人，重启生效）|
|~~#推送插件更新~~|已移除|
|~~#本群订阅列表~~|已合并至 `#订阅列表`|

---
### 原版
### 安装
```
cd plugins
git clone https://gitee.com/HDTianRu/bililivePush-plugin
cd ..
pnpm install
```

### 使用
|指令|功能|
|-------|-------|
|#推送帮助|换个方式展示这些功能|
|#(订阅/取消订阅)直播间+直播间room_id|如题|
|#(订阅/取消订阅)UP+UP的uid|同上(一般用这个)|
|#(我的/本群)订阅列表|如题|
|#推送插件更新|如题|
|Tips|如需艾特全体，指令前加"全体"二字"|
|Tips|如不需艾特自己，指令前加"匿名"二字"|

### 例子
```
#订阅直播间114514
#全体订阅UP1919810
#匿名订阅UP66666
#全体取消订阅12345
#取消订阅13579
#我的订阅列表
```

### 其他
交流群：[893157055](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=BWtOJkAHVX20OlQqgAIPn7UID9LtigSg&group_code=893157055)  
有问题提issue  
提交发pull request  
最后希望能给项目点个star~

#### 项目链接
听说Stars越多，更新越快哦~  
github：[https://github.com/HDTianRu/TianRu-plugin](https://github.com/HDTianRu/bililivePush-plugin)  
gitee：[https://gitee.com/HDTianRu/TianRu-plugin](https://gitee.com/HDTianRu/bililivePush-plugin)
