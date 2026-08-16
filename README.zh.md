# 🖥️ dsh-remote-workspace

[![License: MIT](https://img.shields.io/github/license/FYL1025/dsh-remote-workspace)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![DSH Plugin](https://img.shields.io/badge/DSH-plugin-blue)](https://github.com/deepseek-ai/deepseek-harness)
[![Type](https://img.shields.io/badge/type-module-blueviolet)](https://nodejs.org/api/esm.html)
[![Code Size](https://img.shields.io/github/languages/code-size/FYL1025/dsh-remote-workspace)](https://github.com/FYL1025/dsh-remote-workspace)
[![npm version](https://img.shields.io/badge/npm-pending-lightgrey)](https://www.npmjs.com)

[English](README.md) | **简体中文**

> **DeepSeek Harness (DSH) 远程工作区插件** —— 通过 SSH 连接**一台或多台服务器**，直接在 DSH 的 Web 界面里浏览文件、编辑代码、执行命令。体验类似 VS Code Remote-SSH，无需离开对话。

---

## 📑 目录

- [✨ 功能](#-功能)
- [🥇 我们的优势](#-我们的优势)
- [📦 安装](#-安装)
- [🚀 快速上手](#-快速上手)
- [⚠️ 前置准备：SSH 免密登录](#-前置准备ssh-免密登录)
- [🔒 安全说明](#-安全说明)
- [❓ 常见问题](#-常见问题)
- [🤝 反馈](#-反馈)
- [📄 License](#-license)

## ✨ 功能

- **多服务器连接管理**（设置 → 远程工作区）：SSH 别名方式（`~/.ssh/config` 的 Host）或 主机/端口/用户名 方式，随时切换当前连接；配置保存在浏览器本地，刷新不丢失
- **🔌 连接 / ⏹ 断开**：一键验证并保持/解除当前服务器的连接状态
- **文件树浏览器**：目录懒加载展开/折叠、隐藏文件开关、按类型显示图标（🐍📝📓🧠…）、一键复制路径
- **代码编辑器**：行号 + 👁 语法高亮预览（关键字/字符串/注释/数字/装饰器着色）+ ✏️ 编辑并保存回服务器
- **命令执行框**：在服务器上运行任意命令（工作目录自动跟随当前打开文件所在目录）
- **贴合 / 加宽 双模式**：贴合模式与对话并排（对话自动让位，分隔条可拖拽）；加宽模式为宽屏浮动面板（可拖到 1400px，代码一目了然）
- **对话直连**：在对话里直接说「看看 ~/fyl/xxx」「帮我改服务器上的文件」，智能体也会直接通过 SSH 操作

## 🥇 我们的优势

对比同类 DSH SSH / 远程文件浏览插件：

- **多服务器，而非单服务器** —— 可添加并随时切换任意数量的 SSH 连接（别名或主机/端口/用户名）；多数同类插件只能写死一台服务器
- **零构建、纯源码** —— 无需 tsdown/typert 构建步骤，发布的源码就是运行的代码，审查、二次开发、Fork 都容易
- **贴合 / 加宽 双模式** —— 可与对话并排（对话自动让位 + 分隔条可拖拽），或一键加宽到 1400px 浮动面板；其他插件通常只是覆盖在页面上
- **语法高亮 + 行号** —— IDE 级代码阅读体验（关键字/字符串/注释/数字/装饰器），不是普通文本框
- **配置持久化** —— 连接设置在刷新页面后不丢失（localStorage）
- **复用本机 SSH** —— 直接使用现有的 `~/.ssh/config` 别名与密钥，任何地方都不存密码
- **内置命令执行框** —— 面板内直接跑命令，工作目录跟随当前打开文件
- **对话直连** —— 与 DSH 智能体配合，在对话里说一句「改一下服务器上的这个文件」即可
- **双语文档 + MIT 开源**

## 📦 安装

**环境要求**：Node.js ≥ 18 · pnpm · DSH profile（通常为 `web`）

```bash
# SSH 方式（推荐，端口 22）
dsh plugin --profile web add git+ssh://git@github.com/FYL1025/dsh-remote-workspace.git

# 或 HTTPS 方式（端口 443）
dsh plugin --profile web add git+https://github.com/FYL1025/dsh-remote-workspace.git
```

安装后**重启 DSH**，打开 **设置 → 远程工作区** 即可使用。

```bash
# 验证插件已注册
dsh plugin --profile web list

# 有新版本时更新
dsh plugin --profile web update dsh-remote-workspace

# 卸载
dsh plugin --profile web remove dsh-remote-workspace
```

## 🚀 快速上手

1. **设置 → 远程工作区** → 添加你的服务器（SSH 别名 或 主机/端口/用户名），点单选按钮设为当前连接
2. 点 **🔌 连接** 验证连通性（成功后变为 ⏹ 断开）
3. 点 **📂 打开工作区面板** → 文件浏览器出现在对话右侧
4. 展开目录、点开文件：
   - **👁 预览**：语法高亮
   - **✏️ 编辑**：修改后点「保存」写回服务器
5. 底部命令框可执行任意命令（如 `ls -la`、`python train.py`）
6. 点 **⇔ 加宽** 切换宽屏模式，拖动边缘调整宽度

## ⚠️ 前置准备：SSH 免密登录（重要）

插件通过你**本机的 SSH 客户端**连接服务器，因此必须先配置好**免密登录（密钥认证）**：

1. **检查/生成密钥**：`ls ~/.ssh/` 没有就用 `ssh-keygen -t ed25519 -C "你的邮箱"` 生成（一路回车即可）
2. **把公钥添加到服务器**：
   ```bash
   ssh-copy-id -p 端口 用户名@服务器IP        # Linux/macOS 自带
   # 或手动：把 ~/.ssh/id_ed25519.pub 内容追加到服务器的 ~/.ssh/authorized_keys
   ```
3. **（推荐）配置服务器别名**：编辑 `~/.ssh/config`（Windows 为 `C:\Users\你的用户名\.ssh\config`）：
   ```
   Host myserver
     HostName 服务器IP
     User 用户名
     Port 端口
   ```
4. **验证**：`ssh myserver` 能**免密码**直接登录即可

## 🔒 安全说明

- 插件执行的 ssh 命令以**全访问（danger-full-access）**策略运行，等价于你自己在终端里执行 ssh，仅限本插件发起的命令
- 连接配置（别名/主机/端口/用户名）保存在浏览器 localStorage，**不含任何密码或私钥**

## ❓ 常见问题

| 问题 | 解决 |
| --- | --- |
| ❌ 连接失败 | 检查服务器 IP/端口/用户名；确认本机已配置免密登录（见上）；重试 |
| Permission denied (publickey) | 公钥未添加到服务器：执行 `ssh-copy-id` 或手动追加 `authorized_keys` |
| 读取大文件被拒 | 插件只读 ≤2MB 的文本文件，大文件请在对话里让智能体处理 |
| 重启后面板不见了 | 强制刷新页面（Ctrl+Shift+R）；确认 `dsh plugin --profile web list` 里有它 |

## 🤝 反馈

遇到问题或有想法？欢迎在 [Issues](https://github.com/FYL1025/dsh-remote-workspace/issues) 提出，也欢迎贡献代码。

## 📄 License

MIT
