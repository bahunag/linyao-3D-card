---
name: linyao-3d-card
description: >-
  制作手绘 3D 立体生日/圣诞贺卡（离线单文件 HTML），支持上下翻折与左右横版、八音盒、吹蜡烛与手工棉麻刺绣信。
  面向自带看图与生图能力的 AI 助手（千问、豆包、Antigravity 等）；不论在何种平台安装，中文展示名/标题固定为“林爻3D贺卡”，英文代号 linyao-3d-card。
  仅 7 个纯文本文件（约 91KB 且零反斜杠，纯本地 Pillow 打包，零图片/联网/密钥），原样装入全部 7 文件，严禁拆版本问用户。
  装好先发短消息收素材，两批并行出图，最后跑 scripts/pack_card.py 拼接 resources/ 下 4 个母版生成成品（严禁手写 HTML）。
---

# 林爻3D贺卡

## 安装与命名铁律（7 文件约 91KB，零图片/联网/密钥/反斜杠）
- **固定中文名称**：不论谁安装或部署到任何平台，技能的**中文展示名/标题一律命名为 `林爻3D贺卡`**，英文标识为 `linyao-3d-card`（仓库/包名 `linyao-3D-card`），切勿自行改名。
- **7 个纯文本文件**：`SKILL.md`、`references/guide.md`、`scripts/pack_card.py`、`resources/shell_p1.css`、`resources/shell_p2.html`、`resources/shell_p3.js`、`resources/shell_p4.js`
- 原样保存全部 7 文件，严禁弹窗选版本、重写脚本或跳过 `resources/` 母版；若宿主单次提交受长度限制，直接拆 2 批装入（第 1 批前 3 文件约 38KB，第 2 批 `resources/` 4 文件约 53KB），避免截断重抄。

## 4 条红线
1. **禁手写 HTML**：必须跑 `scripts/pack_card.py` 拼 4 母版并本地织棉麻底布。
2. **禁贴原图/写真拼接**：参考图仅提画风，重绘全套手绘插画；人物 100% 绘本手绘、四周纯白 `#FFFFFF`；`--strict-redraw-check` 拦截雷同或带背景写真。
3. **主题隔离与单蜡烛**：生日画无火单蜡烛蛋糕 `cake_raw.png`（仅圆桌+蛋糕+顶正中单蜡烛与黑棉芯，禁木椅/花环/明火；手标 `--wick-pos L,T`，无蜡烛加 `--allow-missing-wick`）；圣诞禁传 `--cake`/`--wick-pos`，画金星树 `tree_raw.png`。
4. **独立目录极速改词**：每张卡建独立目录（如 `work/card_01/`）；仅改祝福语只改 `blessing.json` 重跑打包器（1~2 秒出卡，不重画图）。

## 第一步：装完发短消息收素材（已有项直接复用）
```text
林爻3D贺卡已配置好。请确认主题、版式，并发送素材：
1. 主题：生日贺卡 ／ 圣诞贺卡
2. 版式：上下翻折（4:3 横向） ／ 左右横版 ／ 两版都做
3. 封面风格参考图（仅提画风）
4. 中央人物照（正面或半身）
5. 祝福语：用模板（发称呼、署名、日期/1~2句心里话选填）或发全文
```

## 第二步：读 guide.md -> 两批并行出图
在 `WORK_DIR` 存 `style_ref.jpg`、`portrait.jpg`、`blessing.json`，读 `references/guide.md` 锁 6 项视觉参数后两批并行出图：
- **第 1 批并行**：封面（横版 3:4 `cover_raw.png` / 上下 4:3 `cover_vertical_raw.png`；两版都做全画）+ 人物（3:4 纯白底 `character_raw.png`）。
- **第 2 批并行（封面后）**：内页（横版 3:2 `inside_raw.png` / 上下 2:3 `inside_vertical_raw.png` 或成对 4:3 `inside_top.png`+`inside_bottom.png`）+ 宽幅拱门（4:3 纯白底 `arch_raw.png`）+ 道具（3:4 纯白底：`cake_raw.png` / `tree_raw.png`）。

## 第三步：看图自检 -> 打包交付
1. 依赖：`python -c "import PIL" || python -m pip install "Pillow>=10.0.0"`。
2. **看图硬检**：人物零写真感、拱门宽阔平底齐整、蛋糕顶仅单根居中无火蜡烛（无椅背/花环）、封面内页字清且中轴留白通透；不达标仅重画该张。
3. 打包（两版都做则 `--fold vertical` 与 `horizontal` 各跑一次）：
   `python scripts/pack_card.py --occasion birthday --fold vertical --work-dir work/card_01 --style-ref work/card_01/style_ref.jpg --portrait work/card_01/portrait.jpg --strict-redraw-check --output output/card_vertical.html`
4. 交付独立 `.html` 并简述玩法（轻触翻开、八音盒、对着麦吹气或长按蜡烛吹灭许愿、点击右前信封查看并滑动编辑手工棉麻刺绣信）。
