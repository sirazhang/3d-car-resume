# Spiral Town · Zhihui Zhang 3D Portfolio

开一辆玫红色 Q 版越野车，绕 6 层螺旋塔行驶的个人作品集。

- School → Education
- Library → Publications（封面点开 poster）
- Tech Company → Projects
- Movie → Contact

## 本地运行

```bash
npm install
npm run dev
```

## 操作

| 键 | 效果 |
| --- | --- |
| W / ↑ | 加速 ×1.5；弹窗打开时关闭并继续 |
| S / ↓ | 减速 ÷1.5 |
| A / D | 左右偏移 0.5 |
| Space | 暂停 / 继续；也可关弹窗 |
| 滚轮 | 未开车时放大查看整座塔 |

右上角切换主题：清晨 / 夕阳 / 夜晚 / 雪 / 雨 / 按摩室。

## 部署

Vercel：连接仓库后直接 Build。静态资源在 `public/`（塔 `models/tower.glb`、车 `models/car.glb`）。
