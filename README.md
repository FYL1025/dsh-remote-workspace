# 🖥️ dsh-remote-workspace

DeepSeek Harness (DSH) 远程工作区插件：通过 SSH 连接**多台服务器**，在 Web 界面中浏览/编辑文件、执行命令，体验类似 VS Code Remote-SSH。

## 功能

- **多服务器连接管理**（设置 → 远程工作区）：SSH 别名方式（`~/.ssh/config` 的 Host）或 主机/端口/用户名 方式，随时切换当前连接，配置保存在浏览器 localStorage
- **文件树**：懒加载展开/折叠目录，隐藏文件开关，按类型显示图标，一键复制路径
- **代码编辑器**：行号 + 👁 语法高亮预览（关键字/字符串/注释/数字/装饰器）+ ✏️ 编辑保存
- **命令执行框**：在服务器上运行任意命令（工作目录跟随当前文件）
- **贴合 / 加宽 双模式**：贴合模式面板位于对话右侧、对话自动让位（系统分隔条可拖拽 300-520px）；加宽模式为宽屏浮动面板（可拖到 1400px 宽）
- **对话直连**：可直接在对话里让智能体处理服务器文件（由各会话智能体通过 SSH 操作）

## 安装

```bash
# 需要 pnpm；profile 名为你的 GUI profile（通常是 web）
dsh plugin --profile web add dsh-remote-workspace
# 或从 Git 仓库安装（发布后）
dsh plugin --profile web add git+https://github.com/<你的用户名>/dsh-remote-workspace.git
```

安装后重启 DSH，打开 **设置 → 远程工作区** 即可使用。

> 前置要求：服务器密钥已配置在本机（`~/.ssh/config` 别名，或默认密钥 `id_ed25519`）。
> 说明：ssh 命令以全访问（danger-full-access）策略执行，等价于用户自己执行 ssh，仅限本插件发起的命令。

## 使用

1. 设置 → 远程工作区 → 连接管理：添加/切换/删除服务器连接
2. 点「🔌 连接并打开远程工作区面板」→ 面板出现在对话右侧
3. 面板内可切换「⇔ 加宽」宽屏模式，拖动边缘调整宽度

## 开发与发布

```bash
git init && git add -A && git commit -m "init"
git remote add origin https://github.com/<你的用户名>/dsh-remote-workspace.git
git push -u origin main
```

然后其他人即可用 `dsh plugin --profile web add git+https://github.com/<你的用户名>/dsh-remote-workspace.git` 安装。

### 包结构说明（为什么无需构建）

```
dsh-remote-workspace/
├── package.json        # dsh.bundle.patch 声明 cordis.patch.yml；dsh.client 声明浏览器端
├── cordis.patch.yml    # profile 补丁层：插入一个 loader 条目
├── lib/index.js        # 宿主端：TypertRemoteService（srvfs），@Remote 装饰器手写转译
├── lib/client.js       # 浏览器端：window.__ModuleLoader__.load 标准 CJS bundle
└── README.md
```

- 宿主端暴露远程服务 `srvfs`（`hello/listDir/readFile/writeFile/exec`），方法经 `@Remote` 标记，浏览器端通过 Connection 原始 RPC 通道（`connection.rpc.call('/api', 'srvfs/<method>', { args: { args } })`）调用，**不需要 typert 描述符贡献**，因此免构建。
- 浏览器端遵循 DSH 客户端插件的标准加载格式（`window.__ModuleLoader__.load`），样式在模块加载时注入。
- 若未来需要接入更多宿主能力，参考官方插件（如 dsh-dream-skin）用 tsdown/typert 构建即可迁移。

## License

MIT
