# 前端脚手架

## 安装

```sh
yarn add -g swen-cli
```

验证是否安装成功：

```sh
swen-cli --version
```

### 通过脚手架创建项目

```sh
swen-cli create my-app -f -u swen-xiong
```

上述命令的执行逻辑是：从 github 用户 `swen-xiong` 的仓库拉取所有 `topics` 包含 `template` 的非 `private` 项目作为模板，在当前目录下创建名为 `my-app` 的项目，若当前目录下已存在 `my-app` 同名文件则强制覆盖。
