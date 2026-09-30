/* ============================================
   站点配置 —— 你只管改这个文件
   ============================================ */

const SITE = {

  /* 社交账号
     icon 填图片文件名（放在 icons/ 文件夹），留空则退回到显示名字的第一个字。
     图标已经放好四个：
       xiaohongshu.svg 小红书 · douyin.svg 抖音 · person.svg 小人

     两个字段：
       url  完整网址（https:// 开头）。留空或写 "#" 就只显示图标、点了不跳转。
       tip  可选。鼠标停在图标上时弹出的那行小提示。
            不填就自动显示这个图标的名字（比如"小红书"、"抖音"）。

     ★★ 点击行为怎么判定（全自动，不用你操心）★★
       填了 url              → 点击跳转        （例：小红书）
       没填 url、但有 tip    → 点击复制 tip 里冒号后面的内容
                              （例：抖音复制抖音号）
       两样都没填            → 点击无反应，光标也不变手型

     ★★ 抖音：以后想直接跳主页的话 ★★
       url 填分享短链 https://v.douyin.com/xxxxxxx/
       （手机点开会直接唤起 App，比网页版体验好）
       ⚠️ 不要填 https://www.douyin.com/user/self —— 那是"我自己的主页"，
          只有你本人登录时才打得开，别人点了看到的是他自己的主页。

     ★ 想加朋友的链接：把「朋友们」那行复制几份，改 name / url 就行。
     ★ 想换成彩色图标：把 icons/ 里的同名文件覆盖掉即可，代码不用动。
     ★ url 可以是**站内页面**（比如 "friends.html"）→ 就当前窗口跳过去；
       填 http(s) 开头的才算外链，才会新开标签页。 */
  social: [
    { name: "小红书", url: "https://www.xiaohongshu.com/user/profile/61d2d0b5000000001000b021",
      icon: "xiaohongshu.svg" },
    { name: "抖音",   url: "", icon: "douyin.svg",
      tip: "抖音号：79674943" },
    /* ★ 2026-09-30：这个图标就是「朋友们」的入口 →
       站内页面 friends.html（朋友们的 5 套作品独立成一层，不再混在自己的片柜里） */
    { name: "朋友们", url: "friends.html", icon: "person.svg" },
  ],

  /* ────────────────────────────────────────────
     ★ 照片规格（不用你自己压 —— 用 tools/prep_photos.py 自动处理）

     每个系列存两档，同一张照片两个文件：

       大图   photos/分区/系列/NN.jpg      长边 2560 · 约 1MB   ← 点开放大看
       缩略   photos/分区/系列/th/NN.jpg   长边  900 · 约 100KB ← 图墙/卡片/预览

     （代码按「同目录下的 th/ 子文件夹、同名」自动找缩略图；
       找不到就自动退回用大图，不会报错。）

     首页大图单独一档（photos/首页/）：长边 3200 · 约 2MB，全屏显示用。

     ★ 单张硬上限 3MB。
     ★ 网页上放的都是降质版：母版（原片 / 扫描件）只留在你自己硬盘上 ——
       别人就算存走，也拿不到你的原图。右键/拖拽也已屏蔽（只是门槛）。

     新照片怎么进来（三步）：
       1. 原片放一个文件夹，不用改名、不用手动压缩
       2. 跑一下：
          python tools/prep_photos.py "原片文件夹" "photos/分区名/系列名"
          —— 自动裁掉黑边、生成大图 + 缩略图两套
       3. 把这个系列写进下面的 series（或者喊我来写）
     ──────────────────────────────────────────── */

  /* 首页大图轮播：挑好的图路径填进来，建议 3–5 张。
     空着 = 首页显示「照片整理中」占位，不报错。
     ★ 出场顺序 = 这里的顺序（第一张最重要：它决定首屏第一眼的观感，也最该选白字好读的） */
  heroSlides: [
    "photos/首页/01.jpg",
    "photos/首页/02.jpg",
    "photos/首页/03.jpg",     /* 杭州的慢生活 09（2026-09-29 加 · 用户指定加入） */
  ],

  /* 三个分区：name 会显示在首页索引和筛选标签里 */
  /* 首页第二区域：**默认状态**（鼠标没停在任何一个分区上时）显示什么。
   · 留空 [ ]  → 默认什么都不显示，右侧就是一个空的浅色框  ← 现在是这样
   · 填几张    → 默认在那里轮播这几张（每 4.5 秒交叉淡入换下一张）
   鼠标停在某个分区上时，轮播暂停、临时换成那个分区的 `preview` 图；移开回到这里。

   想让它默认轮播时，把图路径按顺序写进下面，例如：
     indexPreview: [
       "photos/首页/02.jpg",
       "photos/.../07.jpg",
       "photos/.../03.jpg",
     ], */
  indexPreview: [
    /* 鼠标不在第二区域上时框里放的那张。留空 = 空框；放 1 张 = 就固定显示它（不轮播）；
       放 2 张以上才会每 4.5 秒交叉淡入轮换。
       2026-09-29 用户先试了「树琴 + 闲暇小记 08」，随后**去掉闲暇小记 08、只留树琴**
       （那张是竖图，在 692×420 的框里被裁掉一大半）。
       ⚠️ 展示框 692×420（1.648:1）cover 居中裁，挑图先按这个比例看。 */
    "photos/像素·数码/星河落人间/04.jpg",
  ],

  /* 三个分区（首页第二区域那三段文字就是这里来的）

     preview  这个分区自己的展示图。鼠标停在它上面时显示它（并暂停上面的轮播）；
              不填 = 停上去把框清空。
     cabinet  点这一项跳去的「专属片柜」页。不填 = 点了没反应。
              cabinet.html?sec=film 只列银盐·胶片的成套系列，其它分区同理。
     empty    这个分区一套系列都还没有时，片柜里那行占位文字（不填 = 「照片整理中」）。
              动态·影像是视频，所以写「视频整理中」。 */
  sections: [
    { key: "film", name: "银盐 · 胶片", desc: "慢速的时间",
      preview: "photos/银盐·胶片/浪漫之城大连/04.jpg",
      cabinet: "cabinet.html?sec=film" },
    { key: "digital", name: "像素 · 数码", desc: "日常的即时切片",
      /* ★ 2026-09-29：照「银盐·胶片」的样子接上专属片柜。
         展示图 = 灯火与天光/05「北高峰的绿光」（用户挑的）。
         展示框实测 692×420 = 1.648:1、cover 居中裁，这张 1.50 只裁上下约 9%，基本无损。 */
      preview: "photos/像素·数码/灯火与天光/05.jpg",
      cabinet: "cabinet.html?sec=digital" },
    { key: "motion", name: "动态 · 影像", desc: "会动的瞬间",
      empty: "视频整理中",     /* 视频区，空的时候别说「照片整理中」 */
      /* ★ 这一区还没有视频。2026-09-30 用户看了一组两张（漫长 05 / 大连 12）后
         **定「漫长 05」**，所以改回一条字符串 → 悬停不再轮换，固定显示它。
         （这是一张静帧占位，等有真视频了自然替掉。） */
      preview: "photos/银盐·胶片/漫长的时光/05.jpg" },
  ],

  /* ────────────────────────────────────────────
     系列片区（首页最下面的片区，每张卡 = 一个系列）

     ★ 新增一个系列，三步：
       1. 在 photos/分区名/ 下建系列文件夹，把照片丢进去
       2. 复制下面「模板」那段，填空后粘到 series: [] 里
       3. 刷新首页卡片就出来了；想要独立分享页（xxx.html）
          就跑一次 tools/build_series.py

     每张照片的字段：
       src   图片路径（必需）
       gear  器材信息（必需）—— 点开放大时显示，如实填，如
             "Leica M6 · 35mm · Kodak Portra 400" 或 "Sony A7M3 · 85mm f/1.8"
       link  网盘链接（可选）—— 访客下载原图用，没有就 ""
       code  网盘提取码（可选）—— 没有就 ""
       tone  影调倾向（可选），如 "低调 / 冷"，显示在搜索页照片角上
       tags  关键词数组 —— 搜索的燃料，空 [] 也行（照片照样显示，只是搜不到）
       note  一句展签（可选）

     ★★ tags 怎么写（决定"找照片"好不好用）★★
       少写题材词（"海""星空"这种，系列名已经说明了），
       多写**感受、光线、天气、构图**这类跨题材的词：
         光线：逆光 平光 高调 低调 侧光 硬光 柔和
         天气：雾 晴 阴 雪 雨后
         情绪：安静 孤独 温柔 亲切 沉静
         构图：对称 剪影 俯拍 纵深 居中
         体量：空旷 密集 满 近
       —— 这样访客才能搜"安静的、水边的"这种话。
          题材词传统分类就能做，感受词才是搜不出来的那部分。

     ★ 没填 tags 的照片，仍然会出现在系列页里，只是不参与搜索。
       200–400 张不用一次做完，一批一批补，补多少就能搜多少。
       （照片放进文件夹后喊我一声，我读图帮你把 tone / tags / note 写好。）

     ── ★ 模板（整段复制 → 填空 → 粘进下面 series: [] 里）──
     {
       slug: "english-name",
       title: "系列中文名",
       section: "film",
       cover: "photos/银盐·胶片/系列中文名/01.jpg",
       video: "",
       searchable: true,        // false = 不进「找照片」搜索
       credit: "",              // 署名（只有投稿作品才填）
       meta: "",                // 系列页标题下那行小字；填了就显示这句
       photos: [
         {
           src: "photos/银盐·胶片/系列中文名/01.jpg",
           gear: "相机 · 镜头 · 胶卷或参数",
           link: "",
           code: "",
           tone: "",
           tags: [],
           note: "",
         },
       ],
     },
     （section 三选一：film = 银盐·胶片 / digital = 像素·数码 / motion = 动态·影像；
       slug 用英文小写字母和短横线，不能跟别的系列重复）

     ★★ 三个"投稿专用"字段（自己拍的留空就行）★★
       searchable: false  整块系列不进「找照片」搜索 —— 访客搜什么都搜不到它
       credit             署名。填了之后：
                             · 系列页缩略图的右下角（半透明，压不挡看图）
                             · 点开放大的灯箱里，**接在器材后面同一行**：
                               「Nikon Z6 · 天津 · © 玉尘阳屿」
                             · 片柜卡片封面右下角也会带
                          自己拍的作品保持 "" → 不显示任何署名
       meta               系列页标题下那行小字。填了就用这句（投稿作品也能有小字）；
                          不填的话：自己的作品显示「分区 · 主题」，投稿作品不显示这行

     ★ 单张照片也能标记（写在某张照片那一行里，非投稿作品也适用）
       searchable: false  这一张不进「找照片」搜索（页面上照常显示）。
                          例：整套里只有两三张有人物 → 只把那两张标上

     ★ 作品名（写在那张照片那一行里）
       work               点开这张照片时，灯箱里在最上面显示的作品题目。
                          例：work: "云海之上"。不填就只显示器材那行。
     ──────────────────────────────────────────── */
  series: [

    /* ══════ 杭州的慢生活（自己的 · 胶片 Contax TVS · Kodak cp200）══════
       片库/3，9 张（BMP 扫描件，其中 5 张需逆时针转正；000037 裁过上下黑边）
       封面 = 09（000037）。片柜里名字下面显示胶片型号 Kodak cp200。
       ══════ */
    {
      slug: "hangzhou-slow",
      title: "杭州的慢生活", section: "film",
      cover: "photos/银盐·胶片/杭州的慢生活/09.jpg",
      video: "",
      searchable: true,        /* 数字文件夹 = 自己的 → 进搜索 */
      credit: "",              /* 不用署名 */
      film: "Kodak cp200",              /* 显示在片柜名字下面 */
      meta: "我的第一卷",   /* 系列页标题下的小字 */
      photos: [
        { src: "photos/银盐·胶片/杭州的慢生活/01.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 暖金", tags: ["湖", "日出", "船", "晨雾", "远山", "安静", "水边", "金色"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/02.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 暖", tags: ["汀步", "石头", "水边", "倒影", "冬日", "安静"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/03.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["石墙", "小径", "草坡", "水边", "绿", "幽静", "倒影"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/04.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 青", tags: ["树", "驳岸", "木牌", "苔", "浓荫", "纵深", "树影"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/05.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 暖", tags: ["庭院", "茶", "灯笼", "招牌", "石桌", "生活", "暖", "日常"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/06.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "高调 / 多色", tags: ["花", "花坛", "黄", "粉紫", "繁盛", "夏日", "特写"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/07.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["林荫道", "围墙", "门", "树", "路", "日常", "安静"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/08.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 淡", tags: ["白栅栏", "老屋", "自行车", "花盆", "斑驳", "生活", "日常"], note: "" },
        { src: "photos/银盐·胶片/杭州的慢生活/09.jpg",
          gear: "Contax TVS · Kodak cp200", link: "", code: "",
          tone: "中间调 / 冷灰", tags: ["庭院", "路", "自行车", "石墙", "树", "生活", "安静"], note: "" },
      ],
    },

    /* ══════ 夏日的蓝（自己的 · 胶片 Contax TVS · Kodak 5285 · PRINZ 81B）══════
       片库/4，12 张。000067770015 裁过上下黑边（其余不动）。
       ══════ */
    {
      slug: "summer-blue",
      title: "夏日的蓝", section: "film",
      cover: "photos/银盐·胶片/夏日的蓝/11.jpg",
      video: "",
      searchable: true,        /* 数字文件夹 = 自己的 → 进搜索 */
      credit: "",              /* 不用署名 */
      film: "Kodak 5285",              /* 显示在片柜名字下面 */
      meta: "过期很多年的反转胶片，效果不错",   /* 系列页标题下的小字 */
      photos: [
        { src: "photos/银盐·胶片/夏日的蓝/01.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 蓝", tags: ["老街", "旧楼", "树", "街道", "日常", "城市"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/02.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 暖", tags: ["玩偶", "手", "特写", "可爱", "日常", "蓝"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/03.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "高调 / 粉", tags: ["商店", "人", "货架", "粉", "逛街", "日常", "明亮"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/04.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 蓝绿", tags: ["湖", "摩天轮", "装置", "倒影", "度假", "蓝绿", "夏日"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/05.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 绿", tags: ["绿荫", "拱廊", "藤", "人", "纵深", "清凉"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/06.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 红绿", tags: ["街道", "灯笼", "树", "行人", "节庆", "绿", "热闹"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/07.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 灰蓝", tags: ["阳台", "人", "背影", "城市", "远景", "日常", "冷"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/08.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 秋色", tags: ["秋叶", "石墙", "爬藤", "橙红", "绿", "特写", "斑斓"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/09.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 绿", tags: ["湖", "睡莲", "树林", "倒影", "安静", "绿"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/10.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 青", tags: ["湖", "小船", "礁石", "水面", "安静", "倒影"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/11.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "高调 / 白蓝", tags: ["花", "白花", "爬藤", "特写", "繁盛", "蓝", "柔"], note: "" },
        { src: "photos/银盐·胶片/夏日的蓝/12.jpg",
          gear: "Contax TVS · Kodak 5285 · PRINZ 81B 滤镜", link: "", code: "",
          tone: "中间调 / 绿灰", tags: ["商场", "建筑", "绿植", "弧形", "结构", "室内"], note: "" },
      ],
    },
    /* ══════ 漫长的时光（自己的 · 胶片 Canon TELE6 · Kodak Gold 400）
       ⚠️ 这套仍在「投稿」组**前面**
       33 张 = 用户指定的「先按数字排」12 张 + 我分析排序的 21 张
       封面 = 27（松林木栈道通向海）
       ══════ */
    {
      slug: "long-hours",
      title: "漫长的时光", section: "film",
      cover: "photos/银盐·胶片/漫长的时光/27.jpg",
      video: "",
      film: "Kodak Gold 400",
      searchable: true,        /* 这套要进搜索引擎 */
      credit: "",              /* 不用署名 */
      photos: [
        { src: "photos/银盐·胶片/漫长的时光/01.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 蓝", tags: ["天空",  "云",  "公路",  "空旷",  "夏日",  "日常",  "风车",  "旅行", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/02.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝", tags: ["居民楼", "建筑", "云", "仰拍", "日常", "城市"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/03.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝", tags: ["街道",  "车流",  "汽车",  "路灯",  "行道树",  "城市",  "日常", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/04.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["公园", "小径", "草地", "树", "绿", "安静", "夏日"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/05.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["溪流",  "水边",  "栈道",  "绿",  "石墙",  "灯笼",  "荫", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/06.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 暖", tags: ["木牌",  "书法",  "無憂",  "树影",  "门",  "光斑",  "静", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/07.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 紫", tags: ["花", "千日红", "粉紫", "池塘", "草地", "夏日", "繁盛"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/08.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["垂柳",  "倒影",  "水塘",  "栈道",  "绿",  "安静", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/09.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 蓝", tags: ["彩虹", "云", "建筑", "雨后天晴", "天空", "惊喜"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/10.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 暖", tags: ["晚霞", "老建筑", "金调", "黄昏", "城市", "暖"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/11.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["车窗",  "旅途",  "动态模糊",  "树",  "远山",  "在路上", "树林"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/12.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝", tags: ["高楼", "街道", "车流", "都市", "广告牌", "日常"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/13.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝", tags: ["老街", "欧式建筑", "行人", "蓝调", "街景", "橱窗"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/14.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 黄", tags: ["涂鸦",  "黄墙",  "树影",  "墙面",  "俏皮",  "光斑", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/15.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝黄", tags: ["结构", "玻璃", "钢架", "仰拍", "几何", "线条"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/16.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 灰", tags: ["反光", "玻璃", "人影", "叠加", "都市", "朦胧"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/17.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "低调 / 蓝", tags: ["清晨", "空旷", "海边", "栈道", "蓝调", "天际线"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/18.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 蓝", tags: ["帐篷", "海岸", "蓝天", "度假", "整齐", "明亮"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/19.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝绿", tags: ["露台", "遮阳伞", "海边", "绿", "度假", "夏日"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/20.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 青绿", tags: ["海水", "清透", "礁石", "俯瞰", "蓝绿", "抽象"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/21.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 青绿", tags: ["沙滩", "礁石", "俯瞰", "绿苔", "人", "海岸"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/22.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 青", tags: ["悬崖", "白屋", "凉亭", "海岸", "俯瞰", "险峻"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/23.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["礁石", "野草", "浪花", "海风", "绿", "海边"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/24.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝绿", tags: ["海浪", "礁石", "白沫", "蓝绿", "动感", "水"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/25.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝绿", tags: ["松枝",  "框景",  "海",  "小船",  "蓝",  "清凉", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/26.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 蓝", tags: ["松枝",  "海",  "小岛",  "蓝",  "开阔",  "清凉", "树"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/27.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["松林",  "木栈道",  "海",  "纵深",  "绿荫",  "静谧", "树", "森林"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/28.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 暖", tags: ["花", "逆光", "虚化", "白色", "光斑", "温柔", "微距"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/29.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 蓝", tags: ["海面", "礁石", "小船", "蓝", "平静", "开阔"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/30.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "高调 / 银灰", tags: ["海面", "波光", "逆光", "银白", "抽象", "高调"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/31.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 暖", tags: ["海鸥", "黄昏", "人群", "剪影", "晚霞", "飞舞"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/32.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "中间调 / 暖", tags: ["海鸥", "黄昏", "广场", "人群", "暮色", "热闹"], note: "" },
        { src: "photos/银盐·胶片/漫长的时光/33.jpg",
          gear: "Canon TELE6 · Kodak Gold 400", link: "", code: "",
          tone: "低调 / 暖", tags: ["海鸥", "暮色", "人群", "木架", "黄昏", "收束"], note: "" },
      ],
    },
    {
      slug: "dalian",
      title: "浪漫之城大连", section: "film",
      cover: "photos/银盐·胶片/浪漫之城大连/03.jpg",
      video: "",
      film: "Kodak Portra 400",
      searchable: true,     /* false = 整块不进「找照片」搜索（朋友的投稿作品用） */
      credit: "",           /* 署名：只有投稿作品才填；填了缩略图右下角 + 灯箱里会显示 */
      photos: [
        { src: "photos/银盐·胶片/浪漫之城大连/01.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 青绿",
          tags: ["海水", "清透", "礁石", "抽象", "蓝绿"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/02.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "中间调 / 青绿",
          tags: ["水清", "礁石", "抽象", "绿松石", "满", "蓝绿"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/03.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 青",
          tags: ["海岸", "悬崖", "栈道", "碧绿", "明亮", "干净"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/04.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 青",
          tags: ["海岸", "悬崖", "沙滩", "俯拍", "干净"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/05.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 蓝绿",
          tags: ["松", "海", "礁石", "清新", "蓝绿", "前景"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/06.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 青",
          tags: ["礁石", "安静", "海", "空旷"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/07.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 淡蓝",
          tags: ["海湾", "波光", "明亮", "海平线", "安静"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/08.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 青",
          tags: ["沙滩", "人", "夏日", "水边", "明快", "俯拍"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/09.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "高调 / 淡蓝",
          tags: ["广场", "海鸥", "日常", "明亮", "人"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/10.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "中间调 / 绿",
          tags: ["小屋", "林间", "树影", "日常", "安静", "暖"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/11.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "中间调 / 绿",
          tags: ["小径", "石阶", "藤蔓", "绿", "纵深", "幽静"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/12.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "中间调 / 淡蓝",
          tags: ["防波堤", "海鸥", "城市", "平静", "几何", "淡"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/13.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "暖调 / 粉橙",
          tags: ["海上", "日落", "海平线", "安静", "波光", "航行"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/14.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "冷调 / 暮色",
          tags: ["船", "暮色", "剪影", "灯", "孤独", "蓝紫", "沉静"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/15.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "中间调 / 粉",
          tags: ["船栏", "海面", "黄昏", "柔和", "安静", "航行"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/16.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "暖调 / 逆光",
          tags: ["甲板", "人群", "黄昏", "逆光", "剪影", "海上", "温柔"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/17.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "低调 / 剪影",
          tags: ["剪影", "黄昏", "海鸥", "街头", "生活", "逆光", "广场"], note: "" },
        { src: "photos/银盐·胶片/浪漫之城大连/18.jpg",
          gear: "Contax TVS · Kodak Portra 400", link: "", code: "",
          tone: "低调 / 黄昏",
          tags: ["人群", "海鸥", "黄昏", "剪影", "广场", "热闹", "粉"], note: "" },
      ],
    },

    {
      slug: "city-tone",
      title: "一个城市的主色调", section: "film",
      cover: "photos/银盐·胶片/一个城市的主色调/08.jpg",
      video: "",
      searchable: true,        /* 数字文件夹 = 自己的 → 进搜索 */
      credit: "",              /* 不用署名 */
      film: "Fujicolor Superia X-TRA 400",              /* 显示在片柜名字下面 */
      meta: "杭州的主色调太绿了所以用了这卷，美之",   /* 系列页标题下的小字 */
      photos: [
        { src: "photos/银盐·胶片/一个城市的主色调/11.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "低调 / 墨绿", tags: ["树", "林", "暗", "低调", "密", "树干", "剪影", "幽静"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/12.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 褐绿", tags: ["树", "落叶", "林", "地", "绿", "秋", "安静", "日常"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/13.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 深绿", tags: ["树", "木屋", "林", "绿", "小屋", "安静", "日常", "幽静"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/01.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 灰绿", tags: ["水边", "河", "柳", "树", "城市", "阴天", "安静", "日常"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/02.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 灰绿", tags: ["水边", "河", "柳", "城市", "步道", "阴天", "日常", "绿"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/03.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["建筑", "红砖", "草坪", "对称", "树", "绿", "安静", "日常"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/04.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 暖红", tags: ["建筑", "红砖", "路", "树", "石板", "纵深", "绿", "日常"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/05.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "低调 / 暖", tags: ["室内", "椅子", "木", "暖", "朦胧", "虚焦", "安静", "日常"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/06.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 绿", tags: ["石阶", "陶罐", "绿", "藤", "花", "红", "安静", "密"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/07.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "高调 / 灰白", tags: ["树", "枝", "叶", "白", "高调", "天空", "剪影", "冬"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/08.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 粉", tags: ["水边", "樱花", "枝", "亭", "山", "倒影", "粉", "安静"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/09.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "高调 / 粉白", tags: ["枝", "花", "粉", "白", "高调", "枝影", "柔", "春"], note: "" },
        { src: "photos/银盐·胶片/一个城市的主色调/10.jpg",
          gear: "Contax TVS · Fujicolor Superia X-TRA 400", link: "", code: "",
          tone: "中间调 / 灰", tags: ["水边", "湖", "山", "岛", "树", "倒影", "灰", "安静"], note: "" },
      ],
    },

    {
      slug: "leisure-notes",
      title: "闲暇小记", section: "film",
      cover: "photos/银盐·胶片/闲暇小记/08.jpg",
      video: "",
      searchable: true,        /* 数字文件夹 = 自己的 → 进搜索 */
      credit: "",              /* 不用署名 */
      film: "Kodak Gold 200",              /* 显示在片柜名字下面 */
      meta: "",                /* 空串 = 标题下不要那行小字（整个字段不写才会显示「分区 · 主题」） */
      photos: [
        { src: "photos/银盐·胶片/闲暇小记/01.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["树", "林荫道", "路", "栏杆", "绿", "安静", "日常", "夏日"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/02.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 暗红", tags: ["墙", "红墙", "路", "巷", "纵深", "对称", "灰", "日常"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/03.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 红绿", tags: ["庭院", "红墙", "树", "绿", "方正", "日常", "安静"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/04.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "高调 / 灰白", tags: ["建筑", "结构", "水泥", "白", "仰拍", "几何", "高调", "线条"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/05.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "低调 / 冷绿", tags: ["窗", "室内", "绿", "树", "框", "暗", "安静", "日常"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/06.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["老屋", "栏杆", "木", "树", "绿", "日常", "安静"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/07.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["树", "林", "绿", "小径", "藤", "幽静", "密", "安静"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/08.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["树", "栏杆", "绿", "路", "日常", "夏日", "安静", "幽静"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/09.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 青绿", tags: ["树根", "榕", "溪", "水边", "石头", "人", "绿", "幽静"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/10.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 红绿", tags: ["红枫", "池塘", "水边", "红", "绿", "倒影", "安静", "秋"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/11.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 绿", tags: ["草坪", "绿", "雕塑", "树", "日常", "安静", "几何"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/12.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "偏高调 / 粉", tags: ["花", "粉", "盛", "特写", "绿", "繁盛", "柔", "夏日"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/13.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 金", tags: ["水面", "波光", "金", "水边", "特写", "安静", "日常"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/14.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 灰绿", tags: ["山", "植被", "树", "城市", "塔", "雾", "绿", "安静"], note: "" },
        { src: "photos/银盐·胶片/闲暇小记/15.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 暖", tags: ["教室", "黑板", "学生", "人", "室内", "日常", "青春"], searchable: false, note: "" },   /* 有人物 → 不进搜索 */
        { src: "photos/银盐·胶片/闲暇小记/16.jpg",
          gear: "Nikon F2 · Kodak Gold 200", link: "", code: "",
          tone: "中间调 / 暖", tags: ["教室", "学生", "人", "室内", "日常", "青春", "海报"], searchable: false, note: "" },   /* 有人物 → 不进搜索 */
      ],
    },

    /* ══════ 以下三套是 **数码**（自己的 · 2026-09-29 入库，来源 片库\7）══════
       ★ 用户原话：「这套开始都是数码了请注意」
       ★ 器材名口径（用户 22:34 定的）：Z5 II / Z6 II，焦距要带 mm
       ★ ① ~ ③ 都进「像素 · 数码」分区 → 首页第二区域「像素·数码」点进去就是它们 */

    /* ══════ ① 绿（自己的 · 数码 Nikon D800E）══════
       片库\7\1，6 张：4 张水面波纹 + 2 张枫叶。封面 05 = AHN_0314（横构图枫叶，用户认可）
       小字是用户原话（他特意写了「增加小字」） */
    {
      slug: "green",
      title: "绿", section: "digital",
      cover: "photos/像素·数码/绿/05.jpg",
      video: "",
      searchable: true,        /* 数字文件夹 = 自己的 → 进搜索 */
      credit: "",              /* 不用署名 */
      meta: "真的没加饱和度，肉眼也这样",
      photos: [
        { src: "photos/像素·数码/绿/01.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          tone: "中间调 / 绿", tags: ["水边", "溪", "石头", "叶", "绿", "苔", "树", "幽静"], note: "" },
        { src: "photos/像素·数码/绿/02.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          tone: "低调 / 墨绿", tags: ["水边", "水面", "波纹", "倒影", "绿", "安静", "抽象", "低调"], note: "" },
        { src: "photos/像素·数码/绿/03.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          tone: "低调 / 青绿", tags: ["水边", "水面", "波纹", "倒影", "绿", "安静", "抽象"], note: "" },
        { src: "photos/像素·数码/绿/04.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          tone: "中间调 / 青", tags: ["水边", "水面", "波纹", "绿", "安静", "抽象", "微距"], note: "" },
        { src: "photos/像素·数码/绿/05.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          tone: "低调 / 绿红", tags: ["叶", "枫叶", "枝", "绿", "虚焦", "暗", "秋", "微距"], note: "" },
        { src: "photos/像素·数码/绿/06.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          tone: "中间调 / 绿", tags: ["叶", "枫叶", "枝", "绿", "密", "秋", "树", "安静"], note: "" },
      ],
    },

    /* ══════ ② 星河落人间（自己的 · 数码，9 张）══════
       片库\7\2，夜空 / 星轨 / 流星。封面 04 = 树琴（用户指定「封面用树琴吧」）
       器材按用户 txt：Z5 II+50mm f1.4（山茶星/深夜来得正好/树琴）·
       Z6 II+20mm f2.8（云海之上）· D800E+24-70mm f2.8（其余）
       ★ work = 点开照片时灯箱里显示的作品名（用户要求「按照文件名写上作品名」） */
    {
      slug: "star-river",
      title: "星河落人间", section: "digital",
      cover: "photos/像素·数码/星河落人间/04.jpg",
      video: "",
      searchable: true,
      credit: "",
      photos: [
        { src: "photos/像素·数码/星河落人间/01.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "万家灯火化繁星",
          tone: "低调 / 蓝橙", tags: ["夜", "星空", "城市", "灯火", "远眺", "蓝", "开阔", "安静"], note: "" },
        { src: "photos/像素·数码/星河落人间/02.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "流星划过城市",
          tone: "低调 / 蓝", tags: ["夜", "星空", "流星", "城市", "天际线", "蓝", "剪影", "安静"], note: "" },
        { src: "photos/像素·数码/星河落人间/03.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "城市上空的星轨",
          tone: "低调 / 蓝", tags: ["夜", "星轨", "城市", "灯火", "天际线", "蓝", "长时间曝光", "安静"], note: "" },
        { src: "photos/像素·数码/星河落人间/04.jpg",
          gear: "Nikon Z5 II · 50mm f1.4", link: "", code: "",
          work: "树琴",
          tone: "低调 / 蓝", tags: ["夜", "星空", "银河", "树", "山", "蓝", "安静", "开阔"], note: "" },
        { src: "photos/像素·数码/星河落人间/05.jpg",
          gear: "Nikon Z6 II · 20mm f2.8", link: "", code: "",
          work: "云海之上",
          tone: "低调 / 蓝", tags: ["夜", "星轨", "云海", "山", "雾", "蓝", "开阔", "安静"], note: "" },
        { src: "photos/像素·数码/星河落人间/06.jpg",
          gear: "Nikon Z5 II · 50mm f1.4", link: "", code: "",
          work: "深夜来得正好",
          tone: "低调 / 蓝", tags: ["夜", "星轨", "山", "剪影", "蓝", "长时间曝光", "安静", "低调"], note: "" },
        { src: "photos/像素·数码/星河落人间/07.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "风向星处",
          tone: "低调 / 蓝", tags: ["夜", "星轨", "风车", "剪影", "蓝", "长时间曝光", "孤独", "低调"], note: "" },
        { src: "photos/像素·数码/星河落人间/08.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "流星落进猎户",
          tone: "低调 / 蓝", tags: ["夜", "星空", "流星", "星座", "猎户座", "蓝", "安静", "低调"], note: "" },
        { src: "photos/像素·数码/星河落人间/09.jpg",
          gear: "Nikon Z5 II · 50mm f1.4", link: "", code: "",
          work: "山茶星",
          tone: "低调 / 蓝", tags: ["夜", "星空", "山茶", "树", "枝", "蓝", "安静", "幽静"], note: "" },
      ],
    },

    /* ══════ ③ 灯火与天光（自己的 · 数码，5 张）══════
       片库\7\3，杭州城市暮色与夜色。封面 02 = 小巴黎
       器材：城市金光 = D800E + 300mm（★ 别漏），其余 D800E + 24-70mm f2.8 */
    {
      slug: "lamplight-sky",
      title: "灯火与天光", section: "digital",
      cover: "photos/像素·数码/灯火与天光/02.jpg",
      video: "",
      searchable: true,
      credit: "",
      photos: [
        { src: "photos/像素·数码/灯火与天光/01.jpg",
          gear: "Nikon D800E · 300mm", link: "", code: "",
          work: "城市金光",
          tone: "高调 / 金", tags: ["黄昏", "金光", "太阳", "城市", "远眺", "暖", "开阔", "高楼"], note: "" },
        { src: "photos/像素·数码/灯火与天光/02.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "小巴黎",
          tone: "中间调 / 粉紫", tags: ["黄昏", "桥", "江", "城市", "粉", "倒影", "开阔", "安静"], note: "" },
        { src: "photos/像素·数码/灯火与天光/03.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "天光未尽",
          tone: "低调 / 橙蓝", tags: ["夜", "黄昏", "车流", "路", "城市", "长时间曝光", "蓝", "剪影"], note: "" },
        { src: "photos/像素·数码/灯火与天光/04.jpg",
          gear: "Nikon D800E · 70-200mm f2.8", link: "", code: "",
          work: "一桥灯火",
          tone: "低调 / 暖", tags: ["夜", "桥", "车流", "城市", "灯火", "长时间曝光", "暖", "倒影"], note: "" },
        { src: "photos/像素·数码/灯火与天光/05.jpg",
          gear: "Nikon D800E · 24-70mm f2.8", link: "", code: "",
          work: "北高峰的绿光",
          tone: "低调 / 青绿", tags: ["夜", "绿", "雾", "通道", "人", "剪影", "灯光", "低调"], note: "" },
      ],
    },

    /* ══════ 朋友的投稿作品（searchable:false → 不进搜索）══════ */
    {
      slug: "tuscany",
      title: "托斯卡纳", section: "digital",
      cover: "photos/像素·数码/托斯卡纳/01.jpg",
      video: "",
      searchable: false,
      credit: "© 没脾气的莫奈",
      photos: [
        { src: "photos/像素·数码/托斯卡纳/01.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/托斯卡纳/02.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/托斯卡纳/03.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/托斯卡纳/04.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
      ],
    },
    {
      slug: "vienna",
      title: "维也纳", section: "digital",
      cover: "photos/像素·数码/维也纳/01.jpg",
      video: "",
      searchable: false,
      credit: "© 没脾气的莫奈",
      photos: [
        { src: "photos/像素·数码/维也纳/01.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/维也纳/02.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/维也纳/03.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/维也纳/04.jpg",
          gear: "Fujifilm GFX100", link: "", code: "",
          tone: "", tags: [], note: "" },
      ],
    },

    /* ── 投稿：土狗 ─────────────────────────────── */
    {
      slug: "old-man-and-sea",
      title: "老人与海", section: "digital",
      cover: "photos/像素·数码/老人与海/01.jpg",
      video: "",
      searchable: false,
      credit: "© 土狗",
      photos: [
        { src: "photos/像素·数码/老人与海/01.jpg",
          gear: "Sony a7r2", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/老人与海/02.jpg",
          gear: "Sony a7r2", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/老人与海/03.jpg",
          gear: "Sony a7r2", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/老人与海/04.jpg",
          gear: "Sony a7r2", link: "", code: "",
          tone: "", tags: [], note: "" },
      ],
    },
    {
      slug: "deep-space-letters",
      title: "五帧深空信筏", section: "digital",
      cover: "photos/像素·数码/五帧深空信筏/05.jpg",
      video: "",
      searchable: false,
      credit: "© 土狗",
      photos: [
        { src: "photos/像素·数码/五帧深空信筏/01.jpg",
          gear: "Sony a7r1", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/五帧深空信筏/02.jpg",
          gear: "Sony a7r1", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/五帧深空信筏/03.jpg",
          gear: "Sony a7r1", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/五帧深空信筏/04.jpg",
          gear: "Sony a7r1", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/五帧深空信筏/05.jpg",
          gear: "Sony a7r1", link: "", code: "",
          tone: "", tags: [], note: "" },
      ],
    },

    /* ── 投稿：玉尘阳屿 ─────────────────────────── */
    {
      slug: "tianjin-night",
      title: "津门夜未阑", section: "digital",
      cover: "photos/像素·数码/津门夜未阑/09.jpg",
      video: "",
      searchable: false,
      credit: "© 玉尘阳屿",
      meta: "天津好美，你好，天津",
      photos: [
        { src: "photos/像素·数码/津门夜未阑/01.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/02.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/03.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/04.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/05.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/06.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/07.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/08.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
        { src: "photos/像素·数码/津门夜未阑/09.jpg",
          gear: "Nikon Z6 · 天津", link: "", code: "",
          tone: "", tags: [], note: "" },
      ],
    },
  ],
};
