# 分镜编辑器 · Storyboard Editor

> 面向短视频 / 宣传片前期策划的分镜工具：镜头表、看板、拍摄计划、通告单四视图联动，图片素材本地存储。
> A Vue 3 storyboard editor with shot list, board, plan and call-sheet views — local-first, no backend.

## 功能

| 视图 | 说明 |
| --- | --- |
| 镜头表 | 镜号、景别、运镜、时长、台词、备注，单元格支持富文本（`ShotRow` / `RichCell`） |
| 看板视图 | 按场次拖拽排布镜头卡片（`BoardView`） |
| 拍摄计划 | 由分镜数据自动汇总场次与时长（`PlanView`） |
| 通告单 | 一键生成当日拍摄通告（`CallSheetView`） |

辅助能力：批量操作（`BatchBar`）、列显隐配置（`ColumnConfig`）、图片单元格（`ImageCell`）、新建镜号菜单（`NewShotMenu`）、撤销/重做与自动保存。

图片素材存 **IndexedDB**，绕开 localStorage 5MB 容量上限，切换项目不丢图。

## 技术栈

Vue 3.5 + TypeScript + Vite + Pinia，纯前端，无后端依赖。

## 本地运行

```bash
npm install
npm run dev      # 开发预览
npm run build    # 构建产物输出到 dist/
```

## 目录

```
src/
├── components/   AppHeader BatchBar BoardView CallSheetView ColumnConfig
│                 ImageCell NewShotMenu PlanView RichCell ShotRow
├── stores/       项目与分镜状态（Pinia）
├── composables/  复用逻辑
├── types.ts      镜头 / 场次数据模型
└── App.vue
```
