# 林爻3D贺卡 · 视觉拆解、英文 Prompt 与祝福模板（V8.6）

> 铁律：参考图仅提画风、纸纹与配色，严禁贴原图或写真感。全套同师手绘、哑光 300g 水彩纸本、60-30-10 自然配色。

## 一、6 项视觉参数（出图前锁定）
- `art_medium_en`：媒介笔触（水彩晕染/细棕墨线/水粉；禁 CGI/塑料反光）
- `paper_texture_en`：纸底肌理（米白 300g 冷压水彩纸 `#faf6ec`）
- `decorative_motifs_en`：花草/节日元素（滤除原图文字商标或他人）
- `cover_scene_idea_en`：全新封面构图（四周花草 + 中上 35% 留白放题字）
- `portrait_identity_en`：真人五官微笑、发型发饰、穿搭手势（全转手绘笔触）
- `styleTheme`：5 低饱和 HEX（`tableInner`/`tableOuter`/`primaryAccent`/`secondaryAccent`/`waxSealColor`）

## 二、看图自检（不达标只重画该张）
1. **封面**：四周丰满中上通透；`Happy Birthday`/`Merry Christmas` 拼写准且高对比。
2. **人物**：脸与衣服零写真纹理/剪切感，100% 同画风手绘；腰收紧凑半月花环；四周纯 `#FFFFFF`。
3. **内页**：外缘茂密、中轴留 50%+ 淡景小径；无人物/蛋糕/树/字。
4. **拱门**：双脚平底同线，外周及拱洞纯 `#FFFFFF`，字清无错拼。
5. **道具**：生日蛋糕**仅低矮圆桌+居中双层蛋糕+顶正中一根高耸单蜡烛与黑棉芯**，禁木椅/花环/明火；圣诞树顶亮金五星、木盆平底、无散雪点。

## 三、英文 Prompt（每条末尾加统一护栏）
> **护栏**：`Warm matte 300g watercolor paper (#faf6ec), 60-30-10 natural palette, delicate hand-drawn outlines; NO 3D CGI, NO photo textures, NO neon, NO extra text/watermarks.`

1. **封面**（横 3:4 `cover_raw.png`；上下 4:3 `cover_vertical_raw.png`）
   - 生日：`BRAND-NEW {3:4 portrait / 4:3 landscape} birthday card cover in {art_medium_en} on {paper_texture_en}. Scene: {cover_scene_idea_en}. Layered {decorative_motifs_en} border, 35% quiet cream upper-center space for crisp hand-lettered "Happy Birthday". Do NOT copy reference layout. Flat 2D full-bleed.`
   - 圣诞：换 `Christmas`/`Merry Christmas`，加冬青松果星灯。
2. **人物**（3:4 纯白底 `character_raw.png`）
   - `Waist-up pop-up standee. IDENTITY LOCK: exact face, smile, hair, headwear, outfit and pose of {portrait_identity_en}. STYLE LOCK: 100% re-illustrated in {art_medium_en} matching cover; NO photo skin/hair/fabric, NO collage feel. Tuck waist into compact half-moon {decorative_motifs_en}. Pure flat #FFFFFF margins all around, zero shadows/specks.`
3. **内页**
   - 横 3:2（`inside_raw.png`）：`Wide 3:2 flat inside spread in {art_medium_en} matching cover. Lush {decorative_motifs_en} outer borders, middle 55% soft pale distant scenery and path on {paper_texture_en}. Flat 2D full-bleed; NO people/cake/tree/text.`
   - 上下 2:3（`inside_vertical_raw.png`）：`Vertical 2:3 continuous flat spread (folds across middle into upper/lower 4:3 halves) in {art_medium_en} matching cover. Lush {decorative_motifs_en} outer edges, central 55% misty sky above flowing smoothly into pale path below. Flat 2D full-bleed; NO people/cake/tree/text.`
   - 上下拆页备选：`inside_top.png`（4:3 上页底边柔和）+ `inside_bottom.png`（4:3 下页顶边顺接上页）。
4. **拱门**（4:3 宽幅纯白底 `arch_raw.png`）
   - `WIDE broad 4:3 landscape semicircular botanical pop-up archway (clearly wider than tall, spanning edge-to-edge horizontally) in {art_medium_en} woven with {decorative_motifs_en}. Crisp hand-lettered "HAPPY BIRTHDAY" (or "MERRY CHRISTMAS") along top arc with two subtle balloons (or baubles) top-right. Broad flat feet on ONE horizontal baseline. Pure #FFFFFF outside AND inside open arch hole, zero shadows/specks.`
5. **道具**（3:4 纯白底）
   - 生日蛋糕（`cake_raw.png`）：`Upright hand-painted {art_medium_en} standee of ONLY a low rustic round wooden table centered under a two-tier frosted birthday cake with subtle fruit matching cover palette. ONE tall straight vertical colorful striped candle centered on very top tier ending in a short unlit dark cotton wick. STRICTLY NO chair, NO stool, NO floral arch/wreath/canopy, NO fire/flame; single candle tip MUST be the solitary highest peak. Flat legs on one baseline. Pure #FFFFFF background, zero shadows/specks.`
   - 圣诞树（`tree_raw.png`）：`Upright hand-painted {art_medium_en} standee of a conical miniature Christmas tree in a flat wooden pot with vintage red/gold baubles, berries, ribbons, pinecones, bright golden 5-point star at top peak, two tiny gifts at flat pot base. Pure #FFFFFF background, zero snow dots, NO cake/candles.`

## 四、祝福语 `blessing.json`
- `{"recipient":"称呼：","lines":["句1","句2"],"closing":"结语","signature":"署名","subSignature":"日期(选填)"}`（3~7 行/100 字内最佳，超长自动滑动）。
- 生日默认：`亲爱的[称呼]：` / `["又长大一岁啦，愿新岁的每一天","都有温暖的风吹散烦恼","愿你永远被爱包围","平安顺遂，自在闪耀"]` / `生日快乐，万事胜意！`
- 圣诞默认：`亲爱的[称呼]：` / `["雪花轻落窗台，圣诞灯火正暖","愿今年所有的温柔与期盼","都化作冬日里的星光与好运","平安顺遂，温暖常伴左右"]` / `圣诞快乐，冬日安暖！`
