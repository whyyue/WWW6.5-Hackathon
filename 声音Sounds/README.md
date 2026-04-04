# 声音

一个声音/音频分享 demo：上传音频到 IPFS，在 Avalanche Fuji 测试网上把内容地址登记到合约里，再用一个黑白单页界面浏览和播放。

## 项目结构

- `ui/`：React + Vite 前端，负责上传、索引、详情卡、播放和钱包发起上链
- `backend/`：Express 上传服务，接收音频并转发到 Pinata/IPFS
- `contracts/`：Hardhat 合约工程，负责部署和测试 `SoundRegistry`
- `docs/`：设计与实施文档
- `font/`：设计参考字体来源
- `参考/`：视觉参考材料

## 当前功能

- 单页声音索引，按 A-Z 展示声音条目
- 上传音频文件并写入名称、地点、日期、链接、注解
- 上传成功后立即进入详情卡
- 详情卡支持播放和拖动进度条
- 调起钱包，把 `ipfs://...` 内容地址登记到 Avalanche Fuji
- 登记成功后显示 `登记成功！`
- 链接过长时省略显示，并提供复制图标

## 技术栈

### 前端
- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- ethers v6
- pinyin-pro

### 后端
- Express
- multer
- axios

### 合约
- Solidity 0.8.24
- Hardhat
- Avalanche Fuji

## 环境变量

### `ui/.env.local`

```env
VITE_SOUND_REGISTRY_ADDRESS=你的合约地址
```

### `backend/.env`

```env
PINATA_JWT=你的 Pinata JWT
PORT=3001
```

### `contracts/.env`

```env
DEPLOYER_PRIVATE_KEY=你的部署钱包私钥
```

## 本地启动

先分别安装依赖：

```bash
cd contracts && npm install
cd ../backend && npm install
cd ../ui && npm install
```

启动后端：

```bash
cd backend
npm run dev
```

启动前端：

```bash
cd ui
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:5173
```

## 合约部署

先配置 `contracts/.env`，再执行：

```bash
cd contracts
npm run compile
npm run deploy:fuji
```

部署后，把输出的合约地址写到 `ui/.env.local` 的 `VITE_SOUND_REGISTRY_ADDRESS`。

## 测试与构建

前端测试：

```bash
cd ui
npm test
```

前端构建：

```bash
cd ui
npm run build
```

后端构建：

```bash
cd backend
npm run build
```

合约测试：

```bash
cd contracts
npm test
```

## MetaMask 如何确认登记成功

上链登记成功后，可以用这几种方式确认：

1. MetaMask 弹窗确认交易已发送并完成
2. MetaMask `活动 / Activity` 里看到这笔 Fuji 测试网交易
3. 区块浏览器里按交易哈希查看状态（如果你保留或复制了交易哈希）
4. 再次打开这个声音详情卡，看到 `登记成功！`，且 `上链登记` 按钮消失

MetaMask 本身不会像 ERC-20 那样自动把这个合约作为一个可见资产展示出来，因为这里登记的是你调用过的合约记录，不是自动展示在钱包资产页里的代币列表。最直接的确认方式还是交易记录和区块浏览器。

## 推送到 GitHub 时建议提交什么

建议提交：

- `ui/src`
- `ui/package.json`
- `ui/package-lock.json`
- `ui/vite.config.ts`
- `ui/tsconfig*.json`
- `ui/index.html`
- `ui/eslint.config.js`
- `ui/vitest.config.ts`
- `ui/.env.example`
- `backend/src`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `backend/.env.example`
- `contracts/contracts`
- `contracts/scripts`
- `contracts/test`（如果后续补充了测试）
- `contracts/package.json`
- `contracts/package-lock.json`
- `contracts/hardhat.config.ts`
- `contracts/tsconfig.json`
- `contracts/.env.example`
- `docs/`
- `font/`（如果你确认字体授权允许随仓库分发）
- `参考/`（如果你想保留设计过程）
- `.gitignore`
- `CLAUDE.md`
- `README.md`
- `项目概述.md`

不要提交：

- `ui/node_modules`
- `ui/dist`
- `ui/.env.local`
- `backend/node_modules`
- `backend/dist`
- `backend/.env`
- `contracts/node_modules`
- `contracts/artifacts`
- `contracts/cache`
- `contracts/.env`

## 推送到 GitHub 命令

仓库首次推送常用流程：

```bash
git init
git add .
git status
git commit -m "Initial sound demo"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

如果仓库已经初始化过，只需要：

```bash
git add .
git status
git commit -m "Update sound demo"
git push
```

## Demo 检查顺序

1. 打开首页，确认单页索引正常
2. 点击 `上传`
3. 填 `名称*` 并选择音频文件
4. 确认新声音进入对应字母分组
5. 打开详情卡并播放音频
6. 点击 `上链登记`
7. 在 MetaMask 确认交易
8. 返回页面确认出现 `登记成功！`
