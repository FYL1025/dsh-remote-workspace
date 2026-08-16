// dsh-remote-workspace — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/dsh-remote-workspace/client.js and
// executed through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with
// require() resolved against the shell's module table — the same shape the
// shipped ui-* packages' bundles emit. Only platform seed words and
// registered client bundles may be required.
//
// 通信：浏览器端通过 Connection 的原始 RPC 通道调用宿主的 `srvfs` 远程服务
// （endpoint `srvfs/<method>`），不依赖生成的 Typert 描述符，因此无需构建。
//
// 持久化：连接配置保存在 localStorage（宿主设置线只允许白名单命名空间，
// 第三方命名空间会返回 settings-not-exposed；localStorage 是纯浏览器偏好
// 的标准边界）。

window.__ModuleLoader__.load({
	id: "dsh-remote-workspace",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		// ---- 样式注入（模块加载时执行一次）----
		function injectCss(css) {
			try {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-remote-workspace";
				tag.textContent = css;
				document.head.appendChild(tag);
			} catch (e) {}
		}
		injectCss(`
.srvfs-root { height: 100%; display: flex; flex-direction: column; min-height: 0; background: var(--dsw-alias-bg-base, #202124); color: var(--dsw-alias-label-primary, #e8e8ea); font-size: 13px; font-family: system-ui, "Segoe UI", sans-serif; }
.srvfs-float { position: fixed; top: 0; bottom: 0; right: 0; background: var(--dsw-alias-bg-base, #202124); border-left: 1px solid var(--dsw-alias-border-l2, #4a4b52); box-shadow: -10px 0 30px rgba(0,0,0,.3); display: flex; flex-direction: column; z-index: 997; overflow: hidden; color: var(--dsw-alias-label-primary, #e8e8ea); font-size: 13px; font-family: system-ui, "Segoe UI", sans-serif; }
.srvfs-resize { position: absolute; left: -3px; top: 0; bottom: 0; width: 8px; cursor: col-resize; z-index: 3; }
.srvfs-resize:hover { background: var(--dsw-alias-brand-primary, #4f8cff); opacity: .4; }
.srvfs-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--dsw-alias-border-l1, #3a3b40); flex: none; }
.srvfs-title { font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.srvfs-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px 4px; flex: none; }
.srvfs-quickbtn { background: none; border: 1px solid transparent; color: var(--dsw-alias-label-secondary, #b8b9bd); border-radius: 6px; padding: 3px 8px; cursor: pointer; font-size: 12px; }
.srvfs-quickbtn:hover { background: var(--dsw-alias-interactive-bg-hover, #323438); color: var(--dsw-alias-label-primary, #e8e8ea); }
.srvfs-quickbtn.active { background: var(--dsw-alias-interactive-bg-active, #3d3f45); color: var(--dsw-alias-label-primary, #e8e8ea); border-color: var(--dsw-alias-border-l2, #4a4b52); }
.srvfs-pathbar { display: flex; gap: 6px; padding: 4px 14px 8px; flex: none; }
.srvfs-input { flex: 1; min-width: 0; background: var(--dsw-alias-bg-layer-1, #26272b); color: inherit; border: 1px solid var(--dsw-alias-border-l1, #3a3b40); border-radius: 6px; padding: 5px 8px; font-size: 12px; font-family: Consolas, monospace; }
.srvfs-btn { background: var(--dsw-alias-interactive-bg-hover, #323438); color: var(--dsw-alias-label-primary, #e8e8ea); border: 1px solid var(--dsw-alias-border-l1, #3a3b40); border-radius: 6px; padding: 5px 10px; cursor: pointer; font-size: 12px; white-space: nowrap; }
.srvfs-btn:hover { background: var(--dsw-alias-interactive-bg-active, #3d3f45); }
.srvfs-btn:disabled { opacity: .5; cursor: default; }
.srvfs-main { flex: 1; display: flex; min-height: 0; }
.srvfs-tree { width: 30%; min-width: 110px; max-width: 190px; overflow: auto; border-right: 1px solid var(--dsw-alias-border-l1, #3a3b40); padding: 4px 0; background: var(--dsw-alias-bg-layer-1, #26272b); }
.srvfs-editorpane { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.srvfs-row { display: flex; align-items: center; gap: 5px; padding: 3px 8px; cursor: pointer; border-radius: 4px; white-space: nowrap; font-size: 12px; }
.srvfs-row:hover { background: var(--dsw-alias-interactive-bg-hover, #323438); }
.srvfs-row.active { background: var(--dsw-alias-interactive-bg-active, #3d3f45); }
.srvfs-arrow { width: 12px; text-align: center; flex: none; font-size: 9px; color: var(--dsw-alias-label-tertiary, #9a9ba0); }
.srvfs-icon { width: 18px; text-align: center; flex: none; }
.srvfs-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.srvfs-size { color: var(--dsw-alias-label-tertiary, #9a9ba0); font-size: 11px; flex: none; }
.srvfs-copy { background: none; border: none; color: var(--dsw-alias-label-tertiary, #9a9ba0); cursor: pointer; font-size: 11px; padding: 0 3px; border-radius: 4px; opacity: 0; flex: none; }
.srvfs-row:hover .srvfs-copy { opacity: 1; }
.srvfs-copy:hover { color: var(--dsw-alias-label-primary, #e8e8ea); background: var(--dsw-alias-interactive-bg-active, #3d3f45); }
.srvfs-tabs { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1, #3a3b40); flex: none; background: var(--dsw-alias-bg-layer-1, #26272b); }
.srvfs-tab { font-size: 12px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.srvfs-edwrap { flex: 1; min-height: 0; display: flex; overflow: hidden; }
.srvfs-gutter { flex: none; width: 38px; padding: 8px 5px 8px 8px; text-align: right; background: var(--dsw-alias-bg-layer-1, #26272b); color: var(--dsw-alias-label-tertiary, #9a9ba0); border-right: 1px solid var(--dsw-alias-border-l1, #3a3b40); font-family: Consolas, "Courier New", monospace; font-size: 11.5px; line-height: 1.5; overflow: hidden; white-space: pre; user-select: none; }
.srvfs-code { flex: 1; min-width: 0; margin: 0; background: var(--dsw-alias-bg-base, #202124); color: var(--dsw-alias-label-primary, #e8e8ea); border: none; outline: none; padding: 8px; font-family: Consolas, "Courier New", monospace; font-size: 11.5px; line-height: 1.5; resize: none; white-space: pre; overflow: auto; tab-size: 4; }
.srvfs-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--dsw-alias-label-tertiary, #9a9ba0); text-align: center; padding: 20px; }
.tok-str { color: #7ec699; }
.tok-com { color: #6a737d; font-style: italic; }
.tok-kw { color: #c678dd; font-weight: 600; }
.tok-num { color: #d19a66; }
.tok-dec { color: #61afef; }
.srvfs-cmd { border-top: 1px solid var(--dsw-alias-border-l1, #3a3b40); padding: 8px 14px; display: flex; flex-direction: column; gap: 6px; flex: none; background: var(--dsw-alias-bg-layer-1, #26272b); }
.srvfs-cmdline { display: flex; gap: 6px; }
.srvfs-out { background: var(--dsw-alias-bg-base, #202124); border: 1px solid var(--dsw-alias-border-l1, #3a3b40); border-radius: 6px; padding: 8px; font-family: Consolas, monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all; max-height: 130px; overflow: auto; margin: 0; }
.srvfs-status { padding: 6px 14px; font-size: 12px; color: var(--dsw-alias-label-secondary, #b8b9bd); border-top: 1px solid var(--dsw-alias-border-l1, #3a3b40); min-height: 26px; flex: none; }
.srvfs-err { color: var(--dsw-alias-state-error-primary, #e5534b); }
.srvfs-ok { color: var(--dsw-alias-state-success-primary, #3fb950); }
.srvfs-foot-btn { background: none; border: none; color: var(--dsw-alias-label-secondary, #b8b9bd); cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 6px; }
.srvfs-foot-btn:hover { background: var(--dsw-alias-interactive-bg-hover, #323438); color: var(--dsw-alias-label-primary, #e8e8ea); }
.srvfs-settings { padding: 4px 2px; display: flex; flex-direction: column; gap: 14px; }
.srvfs-settings h3 { margin: 0; font-size: 15px; }
.srvfs-settings h4 { margin: 0 0 8px; font-size: 13px; color: var(--dsw-alias-label-secondary, #b8b9bd); }
.srvfs-settings-row { display: flex; gap: 6px; align-items: center; }
.srvfs-settings-note { color: var(--dsw-alias-label-tertiary, #9a9ba0); font-size: 12px; line-height: 1.6; margin: 0; }
.srvfs-connlist { display: flex; flex-direction: column; gap: 6px; }
.srvfs-conn { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid var(--dsw-alias-border-l1, #3a3b40); border-radius: 8px; background: var(--dsw-alias-bg-layer-1, #26272b); }
.srvfs-conn.active { border-color: var(--dsw-alias-brand-primary, #4f8cff); }
.srvfs-conn-name { font-weight: 600; font-size: 13px; }
.srvfs-conn-desc { color: var(--dsw-alias-label-tertiary, #9a9ba0); font-size: 11px; font-family: Consolas, monospace; }
.srvfs-conn-actions { margin-left: auto; display: flex; gap: 6px; }
.srvfs-radio { accent-color: var(--dsw-alias-brand-primary, #4f8cff); cursor: pointer; }
.srvfs-errbox { padding: 12px; color: var(--dsw-alias-state-error-primary, #e5534b); font-size: 12px; border: 1px solid var(--dsw-alias-border-l1, #3a3b40); border-radius: 8px; margin: 8px; white-space: pre-wrap; word-break: break-all; }
`);

		// ---- 原始 RPC 通道：调用宿主的 srvfs 服务 ----
		let connection = null;
		function rpc(method, args) {
			if (!connection) return Promise.reject(new Error("浏览器尚未连接到主机"));
			return connection.rpc.call("/api", "srvfs/" + method, { args: { args: args || {} } }, undefined).then((res) => {
				if (res && res.ok) return res.value;
				const msg = res && res.error ? (res.error.message || JSON.stringify(res.error)) : "远程调用失败";
				const err = new Error(msg);
				err.remote = true;
				throw err;
			});
		}

		const CONN_KEY = "srvfs.connections";
		const ACTIVE_KEY = "srvfs.activeConn";
		const CONNECTED_KEY = "srvfs.connectedId";
		function loadConns() {
			try {
				const raw = localStorage.getItem(CONN_KEY);
				if (raw) {
					const arr = JSON.parse(raw);
					if (Array.isArray(arr) && arr.length) return arr;
				}
			} catch (e) {}
			return [{ id: "default", name: "fanyuelong-25003", alias: "25003" }];
		}
		function saveConns(arr) { try { localStorage.setItem(CONN_KEY, JSON.stringify(arr)); } catch (e) {} }
		function loadActiveId() { try { return localStorage.getItem(ACTIVE_KEY) || "default"; } catch (e) { return "default"; } }
		function saveActiveId(id) { try { localStorage.setItem(ACTIVE_KEY, id); } catch (e) {} }
		function loadConnectedId() { try { return localStorage.getItem(CONNECTED_KEY) || null; } catch (e) { return null; } }
		function saveConnectedId(id) { try { localStorage.setItem(CONNECTED_KEY, id || ""); } catch (e) {} }
		function connArgsOf(c) {
			if (c && c.alias) return { alias: c.alias };
			if (c && c.host) return { host: c.host, port: Number(c.port) || 22, user: c.user || "ubuntu" };
			return { alias: "25003" };
		}
		function connDesc(c) {
			if (c && c.alias) return "ssh " + c.alias;
			if (c && c.host) return (c.user || "ubuntu") + "@" + c.host + ":" + (Number(c.port) || 22);
			return "";
		}

		const store = {
			open: false, mode: "dock", width: 780, listeners: [],
			lastPath: "/home/ubuntu/fyl",
			conns: loadConns(),
			activeConnId: loadActiveId(),
			connectedId: loadConnectedId()
		};
		store.subscribe = function (fn) {
			this.listeners.push(fn);
			return () => {
				const i = this.listeners.indexOf(fn);
				if (i >= 0) this.listeners.splice(i, 1);
			};
		};
		store.notify = function () { this.listeners.forEach((f) => f()); };
		store.set = function (v) { this.open = v; this.notify(); };
		store.setPath = function (p) { this.lastPath = p; this.notify(); };
		store.setMode = function (m) { this.mode = m; this.notify(); };
		store.setActive = function (id) {
			if (!this.conns.some((c) => c.id === id)) return;
			this.activeConnId = id;
			saveActiveId(id);
			this.notify();
		};
		store.setConnected = function (id) {
			this.connectedId = id;
			saveConnectedId(id);
			this.notify();
		};
		store.clearConnected = function () {
			this.connectedId = null;
			saveConnectedId("");
			this.notify();
		};
		store.updateConns = function (arr) {
			this.conns = arr;
			saveConns(arr);
			if (!arr.some((c) => c.id === this.activeConnId)) {
				this.activeConnId = arr.length ? arr[0].id : "default";
				saveActiveId(this.activeConnId);
			}
			if (!arr.some((c) => c.id === this.connectedId)) this.clearConnected();
			this.notify();
		};
		store.activeConn = function () {
			return this.conns.find((c) => c.id === this.activeConnId) || this.conns[0] || null;
		};

		function useStore(sel) {
			const [v, setV] = React.useState(sel());
			React.useEffect(() => store.subscribe(() => setV(sel())), []);
			return v;
		}
		const useOpen = () => useStore(() => store.open);
		const useMode = () => useStore(() => store.mode);
		const useWidth = () => useStore(() => store.width);
		const useConns = () => useStore(() => store.conns);
		const useActiveConnId = () => useStore(() => store.activeConnId);
		const useConnectedId = () => useStore(() => store.connectedId);

		function openPanel(layout) {
			store.set(true);
			if (store.mode !== "dock") store.setMode("dock");
			if (layout) layout.openDetails();
		}
		function toDock(layout) {
			store.setMode("dock");
			if (layout) layout.openDetails();
		}
		function toFloat(layout) {
			store.setMode("float");
			if (layout) layout.closeDetails();
		}
		function closePanel(layout) {
			store.set(false);
			if (layout) layout.closeDetails();
		}

		class ErrorBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { error: null };
			}
			static getDerivedStateFromError(error) {
				return { error: error };
			}
			componentDidCatch(error) {
				console.error("srvfs render error:", error);
			}
			render() {
				if (this.state.error) {
					return React.createElement("div", { className: "srvfs-errbox" },
						"远程工作区渲染出错: " + String((this.state.error && this.state.error.message) || this.state.error));
				}
				return this.props.children;
			}
		}

		function esc(s) {
			return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
		const HL_KW = ["def", "class", "return", "import", "from", "if", "elif", "else", "for", "while", "try", "except", "finally", "with", "as", "lambda", "True", "False", "None", "not", "and", "or", "in", "is", "yield", "global", "pass", "break", "continue", "raise", "assert", "async", "await", "print", "self", "super", "__init__"].join("|");
		const HL_RE = new RegExp("('''[\\s\\S]*?'''|\"\"\"[\\s\\S]*?\"\"\"|'(?:\\\\.|[^'\\\\\\n])*'|\"(?:\\\\.|[^\"\\\\\\n])*\")|(#[^\\n]*)|(\\b(?:" + HL_KW + ")\\b)|(\\b\\d+(?:\\.\\d+)?\\b)|(@[\\w.]+)", "g");
		function hl(src) {
			const text = esc(src);
			let out = "";
			let last = 0;
			let m;
			HL_RE.lastIndex = 0;
			while ((m = HL_RE.exec(text)) !== null) {
				out += text.slice(last, m.index);
				if (m[1]) out += '<span class="tok-str">' + m[1] + "</span>";
				else if (m[2]) out += '<span class="tok-com">' + m[2] + "</span>";
				else if (m[3]) out += '<span class="tok-kw">' + m[3] + "</span>";
				else if (m[4]) out += '<span class="tok-num">' + m[4] + "</span>";
				else if (m[5]) out += '<span class="tok-dec">' + m[5] + "</span>";
				last = m.index + m[0].length;
			}
			out += text.slice(last);
			return out;
		}

		function fmtSize(n) {
			if (!n) return "";
			if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
			if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
			return String(n) + " B";
		}
		function join(p, n) { return (p.endsWith("/") ? p : p + "/") + n; }
		function parent(p) {
			const t = p.replace(/\/+$/, "");
			if (!t) return "/";
			const i = t.lastIndexOf("/");
			return i <= 0 ? "/" : t.slice(0, i);
		}
		function iconOf(e) {
			if (e.type === "dir") return "📁";
			if (e.type === "link") return "🔗";
			const ext = (e.name.split(".").pop() || "").toLowerCase();
			const map = { py: "🐍", md: "📝", txt: "📄", json: "📋", yml: "⚙️", yaml: "⚙️", toml: "⚙️", cfg: "⚙️", ini: "⚙️", sh: "💻", html: "🌐", css: "🎨", js: "🟨", ts: "🟦", vue: "💚", java: "☕", c: "🔧", cpp: "🔧", h: "🔧", ipynb: "📓", csv: "📊", docx: "📘", pdf: "📕", png: "🖼️", jpg: "🖼️", jpeg: "🖼️", pt: "🧠", pth: "🧠", onnx: "🧠", zip: "🗜️", tar: "🗜️", gz: "🗜️" };
			return map[ext] || "📄";
		}
		function copyText(text, onDone) {
			try {
				navigator.clipboard.writeText(text).then(() => onDone("已复制: " + text)).catch(() => onDone("复制失败，请手动复制"));
			} catch (e) {
				onDone("复制失败: " + String((e && e.message) || e));
			}
		}

		function SettingsPage(props) {
			const layout = props && props.layout;
			const open = useOpen();
			const conns = useConns();
			const activeId = useActiveConnId();
			const [conn, setConn] = React.useState(null);
			const [connecting, setConnecting] = React.useState(false);
			const [showForm, setShowForm] = React.useState(false);
			const [formMode, setFormMode] = React.useState("alias");
			const [fName, setFName] = React.useState("");
			const [fAlias, setFAlias] = React.useState("");
			const [fHost, setFHost] = React.useState("");
			const [fPort, setFPort] = React.useState("22");
			const [fUser, setFUser] = React.useState("ubuntu");
			const [defPath, setDefPath] = React.useState(store.lastPath);
			const [formErr, setFormErr] = React.useState("");

			const active = conns.find((c) => c.id === activeId) || conns[0] || null;
			const connectedId = useConnectedId();
			const isConnected = !!(active && connectedId === active.id);

			React.useEffect(() => {
				if (!active) return;
				let alive = true;
				setConn(null);
				rpc("hello", { conn: connArgsOf(active) }).then((r) => {
					if (!alive) return;
					setConn(r);
					if (r && r.ok) store.setConnected(active.id);
				}).catch(() => { if (alive) setConn({ ok: false }); });
				return () => { alive = false; };
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [activeId]);

			function connectNow() {
				if (!active || connecting) return;
				setConn(null);
				setConnecting(true);
				rpc("hello", { conn: connArgsOf(active) }).then((r) => {
					setConn(r);
					if (r && r.ok) store.setConnected(active.id);
					else store.clearConnected();
				}).catch(() => {
					setConn({ ok: false });
					store.clearConnected();
				}).finally(() => { setConnecting(false); });
			}

			function disconnectNow() {
				store.clearConnected();
				setConn({ ok: false });
			}

			function addConn() {
				setFormErr("");
				const name = fName.trim();
				if (!name) { setFormErr("请填写连接名称"); return; }
				let c = null;
				if (formMode === "alias") {
					const alias = fAlias.trim();
					if (!/^[A-Za-z0-9._-]+$/.test(alias)) { setFormErr("SSH 别名格式不正确（只能是字母/数字/._-）"); return; }
					c = { id: "c" + Date.now(), name: name, alias: alias };
				} else {
					const host = fHost.trim();
					if (!/^[A-Za-z0-9._-]+$/.test(host)) { setFormErr("主机地址格式不正确"); return; }
					const port = /^\d+$/.test(fPort.trim()) ? Number(fPort.trim()) : 22;
					const user = fUser.trim() || "ubuntu";
					c = { id: "c" + Date.now(), name: name, host: host, port: port, user: user };
				}
				const next = [...conns, c];
				store.updateConns(next);
				if (!active) store.setActive(c.id);
				setShowForm(false);
				setFName(""); setFAlias(""); setFHost(""); setFPort("22"); setFUser("ubuntu");
			}

			function removeConn(id) {
				const next = conns.filter((c) => c.id !== id);
				store.updateConns(next);
			}

			const statusText = isConnected
				? ("✅ 已连接 " + (active ? active.name : "") + (conn && conn.host ? " · " + conn.host : ""))
				: (conn && conn.host ? "❌ 连接失败" : "⚪ 未连接");
			const statusColor = isConnected ? "var(--dsw-alias-state-success-primary,#3fb950)" : "var(--dsw-alias-state-error-primary,#e5534b)";

			return React.createElement("div", { className: "srvfs-settings" },
				React.createElement("h3", null, "🖥️ 远程工作区"),
				React.createElement("div", null,
					React.createElement("h4", null, "连接管理（当前: " + (active ? active.name : "无") + "）"),
					React.createElement("div", { className: "srvfs-connlist" },
						conns.map((c) => React.createElement("div", { key: c.id, className: "srvfs-conn" + (c.id === activeId ? " active" : "") },
							React.createElement("input", {
								type: "radio",
								className: "srvfs-radio",
								checked: c.id === activeId,
								onChange: () => store.setActive(c.id),
								title: "设为当前连接"
							}),
							React.createElement("div", { style: { minWidth: 0 } },
								React.createElement("div", { className: "srvfs-conn-name" }, c.name + (c.id === activeId ? "（当前）" : "") + (connectedId === c.id ? " · 已连接" : "")),
								React.createElement("div", { className: "srvfs-conn-desc" }, connDesc(c))
							),
							React.createElement("div", { className: "srvfs-conn-actions" },
								React.createElement("button", { className: "srvfs-btn", onClick: () => removeConn(c.id), disabled: conns.length <= 1 }, "删除")
							)
						))
					),
					React.createElement("div", { style: { marginTop: 8 } },
						showForm
							? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, padding: 10, border: "1px solid var(--dsw-alias-border-l1,#3a3b40)", borderRadius: 8 } },
								React.createElement("input", { className: "srvfs-input", placeholder: "连接名称（如：训练服务器）", value: fName, onChange: (e) => setFName(e.target.value) }),
								React.createElement("div", { className: "srvfs-settings-row" },
									React.createElement("select", { className: "srvfs-input", style: { flex: "0 0 110px" }, value: formMode, onChange: (e) => setFormMode(e.target.value) },
										React.createElement("option", { value: "alias" }, "SSH 别名"),
										React.createElement("option", { value: "host" }, "主机/端口")
									),
									formMode === "alias"
										? React.createElement("input", { className: "srvfs-input", placeholder: "别名（~/.ssh/config 中的 Host，如 25003）", value: fAlias, onChange: (e) => setFAlias(e.target.value) })
										: React.createElement("input", { className: "srvfs-input", placeholder: "主机地址", value: fHost, onChange: (e) => setFHost(e.target.value) })
								),
								formMode === "host" ? React.createElement("div", { className: "srvfs-settings-row" },
									React.createElement("input", { className: "srvfs-input", style: { flex: "0 0 80px" }, placeholder: "端口", value: fPort, onChange: (e) => setFPort(e.target.value) }),
									React.createElement("input", { className: "srvfs-input", placeholder: "用户名", value: fUser, onChange: (e) => setFUser(e.target.value) })
								) : null,
								formErr ? React.createElement("div", { className: "srvfs-err", style: { fontSize: 12 } }, formErr) : null,
								React.createElement("div", { className: "srvfs-settings-row" },
									React.createElement("button", { className: "srvfs-btn", onClick: addConn }, "保存连接"),
									React.createElement("button", { className: "srvfs-btn", onClick: () => setShowForm(false) }, "取消")
								)
							)
							: React.createElement("button", { className: "srvfs-btn", onClick: () => { setShowForm(true); setFormErr(""); } }, "➕ 添加连接")
					)
				),
				React.createElement("div", { style: { color: statusColor, fontSize: 13 } }, statusText),
				React.createElement("div", null,
					React.createElement("div", { style: { marginBottom: 6, fontSize: 12, color: "var(--dsw-alias-label-secondary,#b8b9bd)" } }, "默认打开路径："),
					React.createElement("div", { className: "srvfs-settings-row" },
						React.createElement("input", { className: "srvfs-input", value: defPath, onChange: (ev) => setDefPath(ev.target.value), spellCheck: false }),
						React.createElement("button", { className: "srvfs-btn", onClick: () => { if (defPath.trim()) store.setPath(defPath.trim()); } }, "设为默认")
					)
				),
				React.createElement("div", { className: "srvfs-settings-row" },
					React.createElement("button", { className: "srvfs-btn", style: { padding: "8px 16px", fontSize: 13 }, onClick: isConnected ? disconnectNow : connectNow, disabled: !active || connecting },
						connecting ? "⏳ 连接中…" : (isConnected ? "⏹ 断开" : "🔌 连接")),
					React.createElement("button", { className: "srvfs-btn", style: { padding: "8px 16px", fontSize: 13 }, onClick: () => { if (store.open) closePanel(layout); else openPanel(layout); } },
						open ? "📂 收起面板" : "📂 打开工作区面板")
				),
				React.createElement("p", { className: "srvfs-settings-note" },
					"「🔌 连接」验证并保持当前服务器的连接状态；「⏹ 断开」解除连接状态（面板后续操作会自动重新连接）。「📂 打开工作区面板」在对话右侧展开文件浏览器（对话自动让位，可拖分隔条调宽，面板内可切换「⇔ 加宽」）。\n💬 也可以直接在对话里说「看看 ~/fyl/xxx」「帮我改服务器上的文件」，智能体会直接操作。")
			);
		}

		function RemoteWorkspace(props) {
			const isFloat = props && props.float;
			const layout = props && props.layout;
			const width = useWidth();
			const connectedId = useConnectedId();
			const conn = store.activeConn();
			const isConnected = !!(conn && connectedId === conn.id);
			const connArgs = conn ? connArgsOf(conn) : { alias: "25003" };
			const [root, setRoot] = React.useState(store.lastPath || "/home/ubuntu/fyl");
			const [dirs, setDirs] = React.useState({});
			const [expanded, setExpanded] = React.useState({});
			const [showHidden, setShowHidden] = React.useState(false);
			const [status, setStatus] = React.useState("");
			const [statusOk, setStatusOk] = React.useState(false);
			const [file, setFile] = React.useState(null);
			const [preview, setPreview] = React.useState(false);
			const [saving, setSaving] = React.useState(false);
			const [cmd, setCmd] = React.useState("");
			const [cmdOut, setCmdOut] = React.useState("");
			const [cmdBusy, setCmdBusy] = React.useState(false);
			const gutterRef = React.useRef(null);
			const codeRef = React.useRef(null);

			function fetchDir(p) {
				if (dirs[p] === undefined) setDirs((prev) => ({ ...prev, [p]: "loading" }));
				rpc("listDir", { path: p, conn: connArgs }).then((r) => {
					if (r && r.error) {
						setStatus(r.error); setStatusOk(false);
						setDirs((prev) => ({ ...prev, [p]: [] }));
						return;
					}
					store.setPath(p);
					setDirs((prev) => ({ ...prev, [p]: r.entries || [] }));
				}).catch((e) => {
					setStatus("连接失败: " + String((e && e.message) || e)); setStatusOk(false);
					setDirs((prev) => ({ ...prev, [p]: [] }));
				});
			}

			React.useEffect(() => {
				fetchDir(root);
				setExpanded((prev) => (prev[root] ? prev : { ...prev, [root]: true }));
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, []);

			function goto(p) {
				setRoot(p);
				setFile(null);
				setPreview(false);
				setExpanded((prev) => ({ ...prev, [p]: true }));
				fetchDir(p);
			}

			function toggleDir(p) {
				if (expanded[p]) {
					setExpanded((prev) => {
						const n = { ...prev };
						delete n[p];
						return n;
					});
				} else {
					if (dirs[p] === undefined || dirs[p] === "loading") fetchDir(p);
					setExpanded((prev) => ({ ...prev, [p]: true }));
				}
			}

			function openFile(p) {
				setStatus("读取中…"); setStatusOk(false);
				setPreview(false);
				setFile({ path: p, name: p.split("/").pop() || p });
				rpc("readFile", { path: p, conn: connArgs }).then((r) => {
					if (r && r.error) { setStatus(r.error); setStatusOk(false); setFile(null); return; }
					setFile({ path: p, name: p.split("/").pop() || p, size: r.size, content: r.content, binary: r.binary });
					setStatus("");
				}).catch((e) => {
					setStatus("读取失败: " + String((e && e.message) || e)); setStatusOk(false);
					setFile(null);
				});
			}

			function saveFile() {
				if (!file || file.binary) return;
				setSaving(true); setStatus("保存中…"); setStatusOk(false);
				rpc("writeFile", { path: file.path, content: file.content, conn: connArgs }).then((r) => {
					setSaving(false);
					if (r && r.error) { setStatus(r.error); setStatusOk(false); return; }
					setFile({ path: file.path, name: file.name, size: file.size, content: file.content, binary: file.binary });
					setStatus("已保存 ✓"); setStatusOk(true);
				}).catch((e) => {
					setSaving(false); setStatus("保存失败: " + String((e && e.message) || e)); setStatusOk(false);
				});
			}

			function runCmd() {
				const c = cmd.trim();
				if (!c || cmdBusy) return;
				setCmdBusy(true); setStatus("执行中…"); setStatusOk(false); setCmdOut("");
				rpc("exec", { command: c, cwd: file ? parent(file.path) : root, conn: connArgs }).then((r) => {
					setCmdBusy(false);
					if (r && r.error) { setStatus(r.error); setStatusOk(false); setCmdOut(""); return; }
					const out = (r.stdout || "") + (r.stderr ? "\n[stderr]\n" + r.stderr : "");
					setCmdOut(out + "\n[exit " + r.exitCode + "]" + (r.timedOut ? " (超时)" : ""));
					setStatus("");
				}).catch((e) => {
					setCmdBusy(false); setStatus("执行失败: " + String((e && e.message) || e)); setStatusOk(false);
				});
			}

			function syncScroll() {
				if (gutterRef.current && codeRef.current) gutterRef.current.scrollTop = codeRef.current.scrollTop;
			}

			function startResize(e) {
				e.preventDefault();
				const startX = e.clientX;
				const startW = store.width;
				function move(ev) {
					const next = Math.min(1400, Math.max(360, startW + (startX - ev.clientX)));
					store.width = next;
					store.notify();
				}
				function up() {
					window.removeEventListener("mousemove", move);
					window.removeEventListener("mouseup", up);
				}
				window.addEventListener("mousemove", move);
				window.addEventListener("mouseup", up);
			}

			function renderChildren(p, depth) {
				const data = dirs[p];
				if (data === "loading") {
					return [React.createElement("div", { key: "load-" + p, className: "srvfs-row", style: { paddingLeft: 8 + depth * 14, color: "var(--dsw-alias-label-tertiary,#9a9ba0)" } }, "加载中…")];
				}
				if (!data) return [];
				const rows = [];
				const vis = data.filter((e) => showHidden || !e.name.startsWith("."));
				for (const e of vis) {
					const cp = join(p, e.name);
					if (e.type === "dir") {
						const isOpen = !!expanded[cp];
						rows.push(React.createElement("div", {
							key: cp,
							className: "srvfs-row",
							style: { paddingLeft: 8 + depth * 14 },
							onClick: () => toggleDir(cp),
							title: cp
						},
							React.createElement("span", { className: "srvfs-arrow" }, isOpen ? "▼" : "▶"),
							React.createElement("span", { className: "srvfs-icon" }, "📁"),
							React.createElement("span", { className: "srvfs-name" }, e.name),
							React.createElement("button", {
								className: "srvfs-copy",
								title: "复制路径",
								onClick: (ev) => { ev.stopPropagation(); copyText(cp, (msg) => { setStatus(msg); setStatusOk(true); }); }
							}, "📋")
						));
						if (isOpen) rows.push(...renderChildren(cp, depth + 1));
					} else {
						const active = file && file.path === cp;
						rows.push(React.createElement("div", {
							key: cp,
							className: "srvfs-row" + (active ? " active" : ""),
							style: { paddingLeft: 8 + depth * 14 },
							onClick: () => openFile(cp),
							title: cp
						},
							React.createElement("span", { className: "srvfs-arrow" }, ""),
							React.createElement("span", { className: "srvfs-icon" }, iconOf(e)),
							React.createElement("span", { className: "srvfs-name" }, e.name),
							React.createElement("span", { className: "srvfs-size" }, fmtSize(e.size)),
							React.createElement("button", {
								className: "srvfs-copy",
								title: "复制路径",
								onClick: (ev) => { ev.stopPropagation(); copyText(cp, (msg) => { setStatus(msg); setStatusOk(true); }); }
							}, "📋")
						));
					}
				}
				return rows;
			}

			const QUICK = [
				{ label: "🏠 家", path: "/home/ubuntu" },
				{ label: "fyl", path: "/home/ubuntu/fyl" },
				{ label: "fhl", path: "/home/ubuntu/fhl" },
				{ label: "Cline", path: "/home/ubuntu/Cline" },
				{ label: "课题资料", path: "/home/ubuntu/fyl/课题资料" }
			];

			const rootData = dirs[root];
			const treeBody = rootData === "loading"
				? [React.createElement("div", { key: "rootload", className: "srvfs-row", style: { color: "var(--dsw-alias-label-tertiary,#9a9ba0)" } }, "加载中…")]
				: (rootData ? renderChildren(root, 0) : []);

			const lineCount = file ? (file.content || "").split("\n").length : 1;
			const gutterText = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1).join("\n");

			const editor = file
				? React.createElement("div", { className: "srvfs-editorpane" },
					React.createElement("div", { className: "srvfs-tabs" },
						React.createElement("span", { className: "srvfs-tab" }, iconOf({ name: file.name, type: "file" }) + " " + file.name + (file.size != null ? "  ·  " + fmtSize(file.size) : "")),
						React.createElement("button", { className: "srvfs-copy", style: { opacity: 1 }, title: "复制路径", onClick: () => copyText(file.path, (msg) => { setStatus(msg); setStatusOk(true); }) }, "📋"),
						React.createElement("button", { className: "srvfs-btn", onClick: () => setPreview(!preview) }, preview ? "✏️ 编辑" : "👁 预览"),
						!file.binary ? React.createElement("button", {
							className: "srvfs-btn",
							onClick: saveFile,
							disabled: saving || file.content === undefined || !file.dirty
						}, saving ? "保存中…" : (file.dirty ? "保存 (未保存)" : "保存")) : null
					),
					file.binary
						? React.createElement("div", { className: "srvfs-placeholder" }, "二进制文件，无法直接编辑")
						: React.createElement("div", { className: "srvfs-edwrap" },
							React.createElement("pre", { className: "srvfs-gutter", ref: gutterRef }, gutterText),
							preview
								? React.createElement("pre", { className: "srvfs-code", ref: codeRef, onScroll: syncScroll, dangerouslySetInnerHTML: { __html: hl(file.content || "") } })
								: React.createElement("textarea", {
									className: "srvfs-code",
									ref: codeRef,
									value: file.content || "",
									onChange: (ev) => setFile({ path: file.path, name: file.name, size: file.size, content: ev.target.value, binary: file.binary, dirty: true }),
									onScroll: syncScroll,
									spellCheck: false
								})
						)
				)
				: React.createElement("div", { className: "srvfs-editorpane" },
					React.createElement("div", { className: "srvfs-placeholder" }, "点击左侧文件查看 / 编辑\n💬 在对话里说「看看 xxx」智能体会直接操作")
				);

			const container = isFloat ? "srvfs-float" : "srvfs-root";
			const wrapStyle = isFloat ? { width: width + "px" } : null;

			return React.createElement("div", { className: container, style: wrapStyle },
				isFloat ? React.createElement("div", { className: "srvfs-resize", title: "拖动调整宽度", onMouseDown: startResize }) : null,
				React.createElement("div", { className: "srvfs-head" },
					React.createElement("span", { className: "srvfs-title" },
						(isConnected ? "🟢 " : "⚪ ") + "远程工作区 · " + (conn ? conn.name : "未连接")),
					isFloat
						? React.createElement("button", { className: "srvfs-btn", onClick: () => toDock(layout), title: "贴合对话右侧，对话自动让位" }, "⇔ 贴合")
						: React.createElement("button", { className: "srvfs-btn", onClick: () => toFloat(layout), title: "切换为宽屏浮动模式，可拖动调整宽度" }, "⇔ 加宽"),
					React.createElement("button", { className: "srvfs-foot-btn", title: "关闭", onClick: () => closePanel(layout) }, "✕")
				),
				React.createElement("div", { className: "srvfs-quick" },
					QUICK.map((q) => React.createElement("button", {
						key: q.path,
						className: "srvfs-quickbtn" + (root === q.path ? " active" : ""),
						onClick: () => goto(q.path)
					}, q.label)),
					React.createElement("button", {
						className: "srvfs-quickbtn" + (showHidden ? " active" : ""),
						onClick: () => setShowHidden(!showHidden),
						title: "显示/隐藏 .开头的隐藏文件"
					}, showHidden ? "👁 显示隐藏" : "🙈 隐藏文件")
				),
				React.createElement("div", { className: "srvfs-pathbar" },
					React.createElement("button", { className: "srvfs-btn", onClick: () => goto(parent(root)), title: "上级目录" }, "↑"),
					React.createElement("input", {
						className: "srvfs-input",
						value: root,
						onChange: (ev) => setRoot(ev.target.value),
						onKeyDown: (ev) => { if (ev.key === "Enter") goto(root); },
						spellCheck: false
					}),
					React.createElement("button", { className: "srvfs-btn", onClick: () => goto(root) }, "跳转")
				),
				React.createElement("div", { className: "srvfs-main" },
					React.createElement("div", { className: "srvfs-tree" }, treeBody),
					editor
				),
				React.createElement("div", { className: "srvfs-cmd" },
					React.createElement("div", { className: "srvfs-cmdline" },
						React.createElement("input", {
							className: "srvfs-input",
							placeholder: "在服务器上执行命令（工作目录: " + (file ? parent(file.path) : root) + "）",
							value: cmd,
							onChange: (ev) => setCmd(ev.target.value),
							onKeyDown: (ev) => { if (ev.key === "Enter") runCmd(); },
							spellCheck: false
						}),
						React.createElement("button", { className: "srvfs-btn", onClick: runCmd, disabled: cmdBusy || !cmd.trim() }, cmdBusy ? "运行中…" : "运行")
					),
					cmdOut ? React.createElement("pre", { className: "srvfs-out" }, cmdOut) : null
				),
				React.createElement("div", { className: "srvfs-status" + (status ? (statusOk ? " srvfs-ok" : " srvfs-err") : "") },
					status || (rootData && rootData !== "loading" ? rootData.filter((e) => showHidden || !e.name.startsWith(".")).length + " 项" : " ") + " · 💬 对话直连：直接告诉智能体要处理的路径")
			);
		}

		function DetailsPanel(props) {
			const open = useOpen();
			const mode = useMode();
			if (!open || mode !== "dock") return null;
			return React.createElement(RemoteWorkspace, { layout: props && props.layout });
		}

		function FloatPanel(props) {
			const open = useOpen();
			const mode = useMode();
			if (!open || mode !== "float") return null;
			return React.createElement(RemoteWorkspace, { float: true, layout: props && props.layout });
		}

		/** Client plugin body：捕获 connection/layout，注册设置板块与面板入口。 */
		function apply(ctx) {
			connection = ctx.get("connection") || null;
			const layout = ctx.get("layout");
			const slots = ctx.get("slots");
			if (slots === undefined) return;

			slots.inject("settings.section", () => slots.register(
				{ name: "settings.section", id: "srv-fs-settings", order: 50, label: "远程工作区", priority: -1 },
				() => React.createElement(ErrorBoundary, null, React.createElement(SettingsPage, { layout: layout }))
			));
			// 隐藏系统自带的 Cordis 插件管理快捷按钮（入口统一收进设置）；
			// 静态插件不走动态守卫，必须显式指定负优先级才能遮蔽系统条目（priority 0）
			slots.inject("sidebar.footer.action", () => slots.register(
				{ name: "sidebar.footer.action", id: "cordis-panel", order: 0, label: "插件管理", priority: -1 },
				() => null
			));
			slots.inject("details", () => slots.register(
				{ name: "details", priority: -1 },
				() => React.createElement(ErrorBoundary, null, React.createElement(DetailsPanel, { layout: layout }))
			));
			slots.inject("shell.overlay", () => slots.register(
				{ name: "shell.overlay", id: "srv-fs-float", order: 20, priority: -1 },
				() => React.createElement(ErrorBoundary, null, React.createElement(FloatPanel, { layout: layout }))
			));
		}

		const inject = ["slots", "layout", "connection"];
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
