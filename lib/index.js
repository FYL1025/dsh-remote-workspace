/**
 * dsh-remote-workspace — host half.
 *
 * 通过本机 ssh（默认使用 ~/.ssh/config 别名或 host/port/user）连接多台服务器，
 * 提供 列目录 / 读文件 / 写文件 / 执行命令 四个远程方法。
 *
 * 暴露方式：注册一个 TypertRemoteService（服务名 `srvfs`），方法用 @Remote
 * 标记，浏览器端通过 Typert Gateway 调用（endpoint `srvfs/<method>`）。
 * 装饰器采用手写转译形式（esbuild 运行时辅助），因此本文件无需构建步骤即可
 * 被 cordis Loader 直接加载。
 *
 * 安全说明：ssh 命令以 danger-full-access（全访问）策略执行，等价于用户自己
 * 在终端里运行 ssh；仅限本插件发起的命令。
 */
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

/* eslint-disable */
var __runInitializers = function (thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function (f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/* eslint-enable */

/** 严格的连接参数校验（防 shell 注入） */
function sshTarget(conn) {
	if (conn && typeof conn.alias === "string" && /^[A-Za-z0-9._-]+$/.test(conn.alias)) return conn.alias;
	if (conn && typeof conn.host === "string" && /^[A-Za-z0-9._-]+$/.test(conn.host)) {
		const port = /^\d+$/.test(String(conn.port || 22)) ? Number(conn.port) : 22;
		const user = typeof conn.user === "string" && /^[A-Za-z0-9._-]+$/.test(conn.user) ? conn.user : "ubuntu";
		return "-p " + port + " " + user + "@" + conn.host;
	}
	return "25003";
}

/** bash 单引号转义，保证远程路径安全 */
function q(path) {
	return "'" + String(path).replace(/'/g, "'\\''") + "'";
}

function bad(msg) {
	return { error: msg };
}

function connOf(args) {
	return args && args.conn ? args.conn : null;
}

/** 远程服务：srvfs */
let SrvfsService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _hello_decorators;
	let _listDir_decorators;
	let _readFile_decorators;
	let _writeFile_decorators;
	let _exec_decorators;
	return class SrvfsService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_hello_decorators = [Remote("hello")];
			_listDir_decorators = [Remote("listDir")];
			_readFile_decorators = [Remote("readFile")];
			_writeFile_decorators = [Remote("writeFile")];
			_exec_decorators = [Remote("exec")];
			__esDecorate(this, null, _hello_decorators, { kind: "method", name: "hello", static: false, private: false, access: { has: (obj) => "hello" in obj, get: (obj) => obj.hello }, metadata: _metadata }, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listDir_decorators, { kind: "method", name: "listDir", static: false, private: false, access: { has: (obj) => "listDir" in obj, get: (obj) => obj.listDir }, metadata: _metadata }, null, _instanceExtraInitializers);
			__esDecorate(this, null, _readFile_decorators, { kind: "method", name: "readFile", static: false, private: false, access: { has: (obj) => "readFile" in obj, get: (obj) => obj.readFile }, metadata: _metadata }, null, _instanceExtraInitializers);
			__esDecorate(this, null, _writeFile_decorators, { kind: "method", name: "writeFile", static: false, private: false, access: { has: (obj) => "writeFile" in obj, get: (obj) => obj.writeFile }, metadata: _metadata }, null, _instanceExtraInitializers);
			__esDecorate(this, null, _exec_decorators, { kind: "method", name: "exec", static: false, private: false, access: { has: (obj) => "exec" in obj, get: (obj) => obj.exec }, metadata: _metadata }, null, _instanceExtraInitializers);
		}
		// 实例字段中运行装饰器 initializers（this = 实例，标记才能落在类原型上，
		// 与官方 typert 编译产物的 rootCtx = __runInitializers(...) 一致）
		__init = __runInitializers(this, _instanceExtraInitializers);
		constructor(ctx) {
			super(ctx, "srvfs");
		}
		/** 远程脚本整体 base64 传输，避免本地 shell 转义问题 */
		_runRemote(script, opts, conn) {
			const shell = this.ctx.get("shell");
			if (shell === undefined) return Promise.resolve({ exitCode: 1, stdout: { text: "", truncated: false }, stderr: { text: "shell 服务不可用", truncated: false }, timedOut: false });
			const sp = this.ctx.get("sandboxPolicy");
			const workspaceRoot = sp && sp.workspaceRoot ? sp.workspaceRoot : "C:\\";
			const FULL_ACCESS = { mode: "danger-full-access", workspaceRoot: workspaceRoot };
			const SSH_OPTS = "-o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null";
			const b64 = Buffer.from(script, "utf8").toString("base64");
			const command = "ssh " + sshTarget(conn) + " " + SSH_OPTS + " \"echo " + b64 + " | base64 -d | bash\"";
			const spec = shell.resolve({
				command: command,
				timeoutMs: (opts && opts.timeoutMs) || 25000,
				stdoutMaxBytes: (opts && opts.stdoutMaxBytes) || (4 * 1024 * 1024),
				sandboxPolicy: FULL_ACCESS
			});
			return shell.run(spec);
		}
		hello(args) {
			return this._runRemote("echo CONNECTED; hostname; whoami", null, connOf(args)).then((r) => {
				const out = (r.stdout.text || "").trim();
				const lines = out.split("\n");
				return {
					ok: r.exitCode === 0 && lines[0] === "CONNECTED",
					host: lines[1] || "",
					user: lines[2] || "",
					detail: (r.stderr.text || "").slice(0, 200)
				};
			});
		}
		listDir(args) {
			const path = args && typeof args.path === "string" ? args.path : "";
			if (!path || path.length > 4096) return Promise.resolve(bad("无效路径"));
			const script = [
				"p=" + q(path),
				"[ -e \"$p\" ] || { echo ERR_NOT_FOUND; exit 3; }",
				"find \"$p\" -maxdepth 1 -printf \"%y\\t%f\\t%s\\n\" 2>/dev/null"
			].join("\n");
			return this._runRemote(script, null, connOf(args)).then((r) => {
				const out = r.stdout.text || "";
				if (r.exitCode === 3) return bad("目录不存在: " + path);
				const base = path.replace(/\/+$/, "").split("/").pop() || "";
				const entries = [];
				for (const line of out.split("\n")) {
					if (!line) continue;
					const t = line.indexOf("\t");
					if (t < 0) continue;
					const type = line.slice(0, t);
					const rest = line.slice(t + 1);
					const t2 = rest.lastIndexOf("\t");
					if (t2 < 0) continue;
					const name = rest.slice(0, t2);
					const size = Number(rest.slice(t2 + 1)) || 0;
					if (name === base) continue;
					entries.push({ name: name, type: type === "d" ? "dir" : type === "l" ? "link" : "file", size: size });
				}
				entries.sort((a, b) => {
					const da = a.type === "dir" ? 0 : 1;
					const db = b.type === "dir" ? 0 : 1;
					if (da !== db) return da - db;
					return a.name.localeCompare(b.name);
				});
				return { path: path, entries: entries, truncated: !!r.stdout.truncated };
			});
		}
		readFile(args) {
			const path = args && typeof args.path === "string" ? args.path : "";
			if (!path) return Promise.resolve(bad("无效路径"));
			const script = [
				"p=" + q(path),
				"[ -f \"$p\" ] || { echo ERR_NOT_FOUND; exit 3; }",
				"s=$(stat -c %s \"$p\")",
				"[ \"$s\" -le 2097152 ] || { echo ERR_TOO_LARGE; exit 4; }",
				"printf \"SIZE\\t%s\\n\" \"$s\"",
				"cat \"$p\""
			].join("\n");
			return this._runRemote(script, null, connOf(args)).then((r) => {
				const out = r.stdout.text || "";
				if (r.exitCode === 3) return bad("文件不存在: " + path);
				if (r.exitCode === 4) return bad("文件超过 2MB，请在对话中让智能体处理");
				const nl = out.indexOf("\n");
				const head = nl >= 0 ? out.slice(0, nl) : out;
				const size = head.indexOf("SIZE\t") === 0 ? Number(head.slice(5)) || 0 : 0;
				const content = nl >= 0 ? out.slice(nl + 1) : "";
				return {
					path: path,
					size: size,
					content: content,
					binary: content.indexOf("\u0000") >= 0,
					outputTruncated: !!r.stdout.truncated
				};
			});
		}
		writeFile(args) {
			const path = args && typeof args.path === "string" ? args.path : "";
			const content = args && typeof args.content === "string" ? args.content : "";
			if (!path || content.length > 4 * 1024 * 1024) return Promise.resolve(bad("参数无效"));
			const b64 = Buffer.from(content, "utf8").toString("base64");
			const script = [
				"p=" + q(path),
				"d=$(dirname \"$p\")",
				"[ -d \"$d\" ] || { echo ERR_NO_DIR; exit 5; }",
				"printf '%s' '" + b64 + "' | base64 -d > \"$p\"",
				"echo WROTE_OK"
			].join("\n");
			return this._runRemote(script, null, connOf(args)).then((r) => {
				if (r.exitCode === 5) return bad("目标目录不存在");
				if (r.exitCode !== 0) return bad("写入失败: " + (r.stderr.text || "未知错误").slice(0, 300));
				return { ok: true };
			});
		}
		exec(args) {
			const command = args && typeof args.command === "string" ? args.command.trim() : "";
			const cwd = args && typeof args.cwd === "string" ? args.cwd : "/home/ubuntu";
			if (!command || command.length > 4000) return Promise.resolve(bad("命令无效"));
			const script = [
				"cd " + q(cwd) + " 2>/dev/null || cd \"$HOME\"",
				command
			].join("\n");
			return this._runRemote(script, { timeoutMs: 120000, stdoutMaxBytes: 2 * 1024 * 1024 }, connOf(args)).then((r) => {
				return {
					exitCode: r.exitCode,
					timedOut: !!r.timedOut,
					stdout: r.stdout.text || "",
					stderr: r.stderr.text || ""
				};
			});
		}
	};
})();

/** Host loader entry：注册 `srvfs` 远程服务（Service 构造器自动在 ctx 中注册并随 fiber 卸载） */
export function apply(ctx) {
	new SrvfsService(ctx);
}

/** 硬依赖服务 */
export const inject = ["shell", "sandboxPolicy"];
