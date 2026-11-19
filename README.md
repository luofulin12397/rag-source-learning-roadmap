# RAG Source 源码学习地图

一个用于跟进四周源码学习计划的本地优先网页：以 FastGPT `v4.17.4` 为主线，以 RAGFlow `v1.0.0` 为对照。

## 功能

- 四周学习路线与 24 项可勾选任务
- 双项目架构对照与固定版本源码目录链接
- 每周实验协议、通关标准与自动保存笔记
- 学习进度和笔记保存在当前浏览器的 `localStorage`
- 一键导出 Markdown 学习记录
- 响应式桌面与移动端布局

## 本地运行

```bash
npm install
npm run dev
```

向开发服务器转发地址和端口：

```bash
npm run dev -- --host 0.0.0.0 --port 7100
```

## 构建

```bash
npm run build
npm run preview
```

生产文件输出到 `dist/`。

## 技术

React 19、TypeScript、Vite、Tailwind CSS、Radix UI、Lucide Icons。无后端、无账号体系；清理浏览器数据前请先导出学习记录。
