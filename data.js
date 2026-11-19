/* ============================================================
   落雁镇 · 数据层
   静态页面、聊天定义、结局文本、谜题答案
   ============================================================ */

const CFG = {
  room: "203",
  wifiPass: "660203",
  bazi: { year: "丁丑", month: "三月", day: "初六", hour: "辰时" },
  storagePass: "881703",
  routerUser: "admin",
  routerPass: "123456",
  cloudAnswer: "19860707",
  albumPass: "20221203",
  cctvTime: 213,       // 03:33
  cctvEnd: 240
};

const CHAT_DEFS = {
  zhiyao: { name: "知遥", avatar: "遥", color: "#3aa0a4" },
  he:     { name: "何婶", avatar: "何", color: "#8a6a3a" },
  zhao:   { name: "赵鹤年", avatar: "赵", color: "#7a2a2a" },
  zhou:   { name: "周叔", avatar: "周", color: "#4a6a7a" },
  net:    { name: "夜航船", avatar: "夜", color: "#5a5a6a" }
};

/* ---------- 静态页面 ---------- */
const PAGES = {

  /* 民宿 Wi-Fi 门户 */
  portal: {
    url: "http://192.168.4.1/",
    title: "枕河居 · 住客网络",
    html: `
      <div style="background:#0f1512;color:#cfe3d6;min-height:100%;padding:34px 22px;font-family:var(--sans)">
        <div style="text-align:center">
          <div style="font-size:10px;letter-spacing:8px;color:#6f9a83">枕 河 居</div>
          <h3 style="font-family:var(--serif);font-size:23px;letter-spacing:5px;color:#dceade;margin:12px 0 4px">住客网络</h3>
          <p class="tiny" style="color:#6f8a7d;letter-spacing:2px">落雁镇 · 免费 Wi-Fi</p>
        </div>
        <div style="margin-top:34px">
          <label class="tiny" style="color:#8fb3a1">房号</label>
          <input id="w-room" inputmode="numeric" maxlength="4" placeholder="例如 203"
            style="width:100%;margin-top:6px;padding:11px;border-radius:8px;border:1px solid #2a4438;background:#0a120e;color:#dceade;font-size:14px;outline:0">
          <label class="tiny" style="color:#8fb3a1;display:block;margin-top:14px">房卡密码</label>
          <input id="w-pass" inputmode="numeric" maxlength="6" placeholder="六位数字"
            style="width:100%;margin-top:6px;padding:11px;border-radius:8px;border:1px solid #2a4438;background:#0a120e;color:#dceade;font-size:14px;outline:0">
          <button class="btn w100" data-act="wifi-login" style="margin-top:18px;background:#2f6f5e;border:0">连接</button>
          <p class="tiny" style="color:#5f7a6c;margin-top:14px">密码印在房卡背面。<a data-act="show-card" style="color:#8fbfa8;text-decoration:underline">查看房卡</a>。若遗失，请到前台找何婶。</p>
        </div>
      </div>`
  },

  /* 小程序首页 */
  mini: {
    url: "app://落雁镇智慧旅游",
    title: "落雁镇智慧旅游",
    html: `
      <div class="mini">
        <div class="mhead">
          <h1>落雁镇</h1>
          <p>千年水乡 · 阴婚民俗之乡 · 国家 3A 级景区</p>
        </div>
        <div class="mcard" data-go="form">
          <div class="ic2">囍</div>
          <div><b>新人祈福登记</b><div class="d">免费 · 凭房号登记 · 赠姻缘符</div></div>
        </div>
        <div class="mcard" data-go="shrine">
          <div class="ic2">音</div>
          <div><b>语音导览</b><div class="d">赵氏宗祠 · 冥婚民俗馆 · 落雁滩</div></div>
        </div>
        <div class="mcard" data-go="paper">
          <div class="ic2">纸</div>
          <div><b>镇上的店</b><div class="d">阴宅纸扎 · 河鲜 · 老酒</div></div>
        </div>
        <div class="notice2">本镇习俗：入夜之后，若有人唤你的名字，请勿应答。<br>——落雁镇旅游管理处</div>
        <p class="tiny" style="text-align:center;color:#4f6a5c;margin-top:22px">技术支持 · 赵氏民俗文化有限公司</p>
      </div>`
  },

  /* 万年历 */
  cal: {
    url: "app://落雁镇智慧旅游/万年历",
    title: "万年历",
    html: `
      <div class="doc" style="font-size:13px">
        <h2>万年历</h2>
        <div class="dsub">公历 一九九七年四月十二日</div>
        <p><b>农历：</b>丁丑年 三月初六</p>
        <p><b>干支：</b>丁丑年 · 甲辰月 · 甲申日</p>
        <p><b>时辰：</b>辰时（07:00–09:00）</p>
        <div class="entry">
          <p class="tiny" style="color:#7a6a4a">查询提示：本工具仅供民俗活动填写使用，不构成命理建议。</p>
        </div>
        <p style="margin-top:18px"><span class="btn" data-go="form">返回登记表</span></p>
      </div>`
  },

  /* 七闻论坛 */
  forum: {
    url: "bbs.7wen.net/board/lishi",
    title: "七闻论坛 · 城市传说",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop">
          <b>七闻论坛</b>
          <span class="sub">城市传说 · 第 7 版</span>
        </div>
        <div class="fnav"><span>首页</span><span>天涯</span><span>城市传说</span><span>灵异</span><span>登录</span><span>注册</span></div>
        <div class="fbar">
          <input id="f-q" placeholder="搜索帖子 / 作者">
          <button data-act="forum-search">站内搜索</button>
        </div>
        <div class="notice">提示：本站部分帖子因「内容不实」被删除，仅保留快照。</div>
        <div class="post" data-go="post203">
          <div class="idx">01</div>
          <div>
            <div class="tt"><del>落雁镇的新娘子，千万别住 203</del></div>
            <div class="meta">楼主：夜航船 · 2019-09-14 · 回复 87 · 查看 12044 · <span style="color:#a03030">已删除</span></div>
          </div>
        </div>
        <div class="post" data-go="tMuseum">
          <div class="idx">02</div>
          <div>
            <div class="tt">落雁镇那个冥婚民俗馆，有人去过吗</div>
            <div class="meta">楼主：走夜路的人 · 2023-03-02 · 回复 31</div>
          </div>
        </div>
        <div class="post" data-go="tPool">
          <div class="idx">03</div>
          <div>
            <div class="tt">落雁滩的深潭到底有多深？我舅舅说下面有铁链</div>
            <div class="meta">楼主：钓不上鱼 · 2021-07-19 · 回复 12</div>
          </div>
        </div>
        <div class="post" data-go="tTemple">
          <div class="idx">04</div>
          <div>
            <div class="tt">赵氏宗祠在招义工，包吃住，只要外地人</div>
            <div class="meta">楼主：招工 · 2024-11-05 · 回复 6</div>
          </div>
        </div>
        <div class="post" data-go="tMissing">
          <div class="idx">05</div>
          <div>
            <div class="tt">【求助】表姐嫁到落雁镇之后，就联系不上了</div>
            <div class="meta">楼主：阿岚 · 2019-09-11 · 回复 44</div>
          </div>
        </div>
        <div class="post" data-go="tRules">
          <div class="idx">06</div>
          <div>
            <div class="tt">本地人说说镇上的规矩，外地人别乱问</div>
            <div class="meta">楼主：匿名 · 2020-08-08 · 回复 23</div>
          </div>
        </div>
        <div class="post" data-go="tSing">
          <div class="idx">07</div>
          <div>
            <div class="tt">半夜听到唱嫁歌，是我幻听吗</div>
            <div class="meta">楼主：一只耳朵 · 2022-04-04 · 回复 9</div>
          </div>
        </div>
        <p class="tiny" style="text-align:center;margin:16px;color:#8a7c5f">© 七闻论坛 2003–2026 · 服务器在境外</p>
      </div>`
  },

  post203: {
    url: "bbs.7wen.net/thread/2031044",
    title: "帖子已删除",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说</span></div>
        <div style="padding:40px 22px;text-align:center">
          <div style="font-size:44px;color:#c9bda3;margin-bottom:10px">404</div>
          <p style="color:#7a6f5c">该帖子因「内容不实」已被删除。</p>
          <p class="tiny" style="color:#8a7c5f">操作时间：2019-09-16 04:12 · 操作人：版主 赵</p>
          <p style="margin-top:26px"><span class="btn" data-go="cache203">查看网页快照（缓存于 2019-09-15）</span></p>
        </div>
      </div>`
  },

  cache203: {
    url: "webcache.7wen.net/20190915/thread2031044",
    title: "网页快照 · 2019-09-15",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>网页快照</b><span class="sub">缓存时间 2019-09-15 03:33</span></div>
        <div style="padding:14px">
          <h3 style="color:#1a4f9c">落雁镇的新娘子，千万别住 203</h3>
          <p class="tiny" style="color:#7a6f5c">楼主：夜航船 · 2019-09-14 23:41</p>
          <div class="reply" style="font-size:12.5px;line-height:2">
            <p>我表姐去年国庆嫁到落雁镇，男方姓赵，说是镇上开民俗馆的。</p>
            <p>回来跟我们说，婆家给订的民宿叫枕河居，只有 203 一间房，别的房间都锁着，说是没收拾。</p>
            <p>第一晚她听见有人敲门，三下，很慢。门外有个女人在唱嫁歌，唱一句，停一句。<br>她不敢开。老板娘第二天说：是猫。</p>
            <p>第二晚她偷偷录了音。我听过，那不是猫。</p>
            <p>第三天早上，人去楼空。行李还在，手机还在床头，人没了。<br>老板娘说她一早就退房走了，还退得挺高兴。</p>
            <p>我报警。警察来了，登记了一下，说成年女性自行离开，不予立案。</p>
            <p>我后来自己去了趟落雁镇。203 的镜子上有个手印，擦不掉。<br>谁擦，谁的手印就往上挪一点。</p>
            <p style="color:#8a2a2a">如果有人看到这个帖子——别住 203，别在夜里应名字。</p>
          </div>
          <div class="reply"><div class="rh"><b>匿名</b><span>12楼 · 2019-09-15 01:12</span></div><div class="rb">我住过 203。第一晚也听见了。第二天我换房，老板娘说没别的房。</div></div>
          <div class="reply"><div class="rh"><b>夜航船</b><span>13楼 · 2019-09-15 01:20</span></div><div class="rb">楼上后来没事吧？</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>14楼 · 2019-09-15 01:41</span></div><div class="rb">有事。我现在还在吃药。</div></div>
          <div class="reply del"><div class="rh"><b>——</b><span>15楼</span></div><div class="rb">该楼层已被删除。</div></div>
          <p class="tiny" style="margin-top:14px;color:#8a7c5f">［快照到此为止。原帖共 87 楼，其余内容未收录。］</p>
          <p class="tiny" style="margin-top:10px;color:#7a6f5c">［楼主签名］夜航船 · 微信 yhc_1987 · 只加问路的人</p>
        </div>
      </div>`
  },

  tMuseum: {
    url: "bbs.7wen.net/thread/1024",
    title: "冥婚民俗馆，有人去过吗",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说 · 帖子</span></div>
        <div class="fcrumb">七闻论坛 › 城市传说 › 正文</div>
        <div style="padding:12px 14px 30px">
          <h3 style="color:#1a4f9c;margin:0 0 4px">落雁镇那个冥婚民俗馆，有人去过吗</h3>
          <div class="tiny" style="color:#7a6f5c;margin-bottom:10px">楼主：走夜路的人 · 2023-03-02 · 回复 31</div>
          <div class="reply"><div class="rh"><b>走夜路的人</b><span>1楼 · 2023-03-02 21:10</span></div><div class="rb">上周去的，免费。讲解是馆长本人，姓赵，很客气。一号展厅最里面有个内室，门一直锁着，说在修缮。有人进去过吗？</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>2楼 · 2023-03-02 21:40</span></div><div class="rb">别问了。我去年去过，出来以后总觉得有人跟着。</div></div>
          <div class="reply"><div class="rh"><b>鱼骨头</b><span>3楼 · 2023-03-02 22:02</span></div><div class="rb">馆里那排牌位，你去数数，比墙上写的数字多。</div></div>
          <div class="reply"><div class="rh"><b>本地人</b><span>4楼 · 2023-03-02 22:31</span></div><div class="rb">赵伯人挺好的，还送过我一张符。就是别接他递的茶。</div></div>
          <div class="reply del"><div class="rh"><b>——</b><span>5楼</span></div><div class="rb">该楼层已被删除。</div></div>
          <div class="reply"><div class="rh"><b>夜航船</b><span>6楼 · 2023-03-03 01:07</span></div><div class="rb">内室的门在 360 全景里能看到。转到某个角度就出来了。</div></div>
          <div class="reply"><div class="rh"><b>走夜路的人</b><span>7楼 · 2023-03-03 01:20</span></div><div class="rb">全景？官网只有展厅的照片啊。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>8楼 · 2023-03-03 01:44</span></div><div class="rb">楼上别说了，那全景早下线了。</div></div>
          <div class="reply"><div class="rh"><b>夜航船</b><span>9楼 · 2023-03-03 02:10</span></div><div class="rb">官网 → 数字馆藏 → 一号展厅全景。转到西墙，有块门板跟别的不一样。</div></div>
          <p style="margin-top:14px"><span class="btn" data-go="museum">民俗馆官网（数字馆藏 → 全景）</span> <span class="btn" data-go="forum" style="margin-left:8px">返回论坛</span></p>
        </div>
      </div>`
  },

  tPool: {
    url: "bbs.7wen.net/thread/0912",
    title: "落雁滩的深潭有多深",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说 · 帖子</span></div>
        <div class="fcrumb">七闻论坛 › 城市传说 › 正文</div>
        <div style="padding:12px 14px 30px">
          <h3 style="color:#1a4f9c;margin:0 0 4px">落雁滩的深潭到底有多深？我舅舅说下面有铁链</h3>
          <div class="tiny" style="color:#7a6f5c;margin-bottom:10px">楼主：钓不上鱼 · 2021-07-19 · 回复 12</div>
          <div class="reply"><div class="rh"><b>钓不上鱼</b><span>1楼 · 2021-07-19 18:22</span></div><div class="rb">我舅舅以前在落雁滩打鱼，说第三湾底下有铁链，一头拴着磨盘大的石头。他从来不让我们下水。</div></div>
          <div class="reply"><div class="rh"><b>老河工</b><span>2楼 · 2021-07-19 19:05</span></div><div class="rb">本地人都不去第三湾。水看着平，底下是旋的。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>3楼 · 2021-07-19 20:11</span></div><div class="rb">前年有个钓友下水，上来以后烧了三天，说看见水底有人。</div></div>
          <div class="reply"><div class="rh"><b>科学派</b><span>4楼 · 2021-07-19 21:40</span></div><div class="rb">铁链就是以前沉船留下的，别自己吓自己。</div></div>
          <div class="reply"><div class="rh"><b>老河工</b><span>5楼 · 2021-07-19 22:03</span></div><div class="rb">沉船？我爷爷说那是压东西的。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>6楼 · 2021-07-20 00:17</span></div><div class="rb">八七年夏天，滩上捞上来一个穿红衣服的。那年我十岁。</div></div>
          <div class="reply"><div class="rh"><b>钓不上鱼</b><span>7楼 · 2021-07-20 07:45</span></div><div class="rb">……难怪我舅不让我去。</div></div>
          <p style="margin-top:14px"><span class="btn" data-go="boat">去渡口看看</span> <span class="btn" data-go="forum" style="margin-left:8px">返回论坛</span></p>
        </div>
      </div>`
  },

  tTemple: {
    url: "bbs.7wen.net/thread/1105",
    title: "赵氏宗祠招义工",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说 · 帖子</span></div>
        <div class="fcrumb">七闻论坛 › 城市传说 › 正文</div>
        <div style="padding:12px 14px 30px">
          <h3 style="color:#1a4f9c;margin:0 0 4px">赵氏宗祠在招义工，包吃住，只要外地人</h3>
          <div class="tiny" style="color:#7a6f5c;margin-bottom:10px">楼主：招工 · 2024-11-05 · 回复 6</div>
          <div class="reply"><div class="rh"><b>招工</b><span>1楼 · 2024-11-05 09:12</span></div><div class="rb">赵氏宗祠招义工，包吃住，一天两百，日结。只要外地人，本地人不要。活不重，整理族谱。</div></div>
          <div class="reply"><div class="rh"><b>打工仔</b><span>2楼 · 2024-11-05 10:30</span></div><div class="rb">只要外地人？这什么规矩。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>3楼 · 2024-11-05 11:02</span></div><div class="rb">别去。我表弟去过，回来以后不记得那三天干了什么。</div></div>
          <div class="reply"><div class="rh"><b>阿珍</b><span>4楼 · 2024-11-05 12:44</span></div><div class="rb">我婶婶去帮过厨，说祠堂后墙不能碰，碰了要出事。</div></div>
          <div class="reply"><div class="rh"><b>打工仔</b><span>5楼 · 2024-11-05 13:20</span></div><div class="rb">工资挺高的啊。</div></div>
          <div class="reply"><div class="rh"><b>招工</b><span>6楼 · 2024-11-05 14:01</span></div><div class="rb">有意私信，名额两个。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>7楼 · 2024-11-05 14:19</span></div><div class="rb">名额两个。上次也是两个。</div></div>
          <p style="margin-top:14px"><span class="btn" data-go="shrine">看看祠堂</span> <span class="btn" data-go="forum" style="margin-left:8px">返回论坛</span></p>
        </div>
      </div>`
  },

  tMissing: {
    url: "bbs.7wen.net/thread/0911",
    title: "表姐失联",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说 · 帖子</span></div>
        <div class="fcrumb">七闻论坛 › 城市传说 › 正文</div>
        <div style="padding:12px 14px 30px">
          <h3 style="color:#1a4f9c;margin:0 0 4px">【求助】表姐嫁到落雁镇之后，就联系不上了</h3>
          <div class="tiny" style="color:#7a6f5c;margin-bottom:10px">楼主：阿岚 · 2019-09-11 · 回复 44</div>
          <div class="reply"><div class="rh"><b>阿岚</b><span>1楼 · 2019-09-11 22:40</span></div><div class="rb">我表姐去年国庆嫁到落雁镇，男方姓赵，开民俗馆的。到现在联系不上，电话停机，微信不回。</div></div>
          <div class="reply"><div class="rh"><b>路人</b><span>2楼 · 2019-09-11 22:51</span></div><div class="rb">报警啊，还等什么。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>3楼 · 2019-09-11 23:06</span></div><div class="rb">落雁镇？那地方不太对。</div></div>
          <div class="reply"><div class="rh"><b>去过的</b><span>4楼 · 2019-09-12 00:12</span></div><div class="rb">我好像在镇上见过她，在 203 那家民宿门口站着。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>5楼 · 2019-09-12 08:30</span></div><div class="rb">别听楼上瞎说，人家可能就是不想联系你们。</div></div>
          <div class="reply"><div class="rh"><b>阿岚</b><span>6楼 · 2019-09-12 09:15</span></div><div class="rb">我去过镇上。老板娘说她退房走了。可她的行李还在房间里。</div></div>
          <div class="reply del"><div class="rh"><b>版主 赵</b><span>7楼 · 2019-09-12 09:20</span></div><div class="rb">本帖涉及个人隐私，锁定处理。</div></div>
          <p style="margin-top:14px"><span class="btn" data-go="cache203">查看 203 那个帖子的快照</span> <span class="btn" data-go="forum" style="margin-left:8px">返回论坛</span></p>
        </div>
      </div>`
  },

  tRules: {
    url: "bbs.7wen.net/thread/0808",
    title: "镇上的规矩",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说 · 帖子</span></div>
        <div class="fcrumb">七闻论坛 › 城市传说 › 正文</div>
        <div style="padding:12px 14px 30px">
          <h3 style="color:#1a4f9c;margin:0 0 4px">本地人说说镇上的规矩，外地人别乱问</h3>
          <div class="tiny" style="color:#7a6f5c;margin-bottom:10px">楼主：匿名 · 2020-08-08 · 回复 23</div>
          <div class="reply"><div class="rh"><b>匿名</b><span>1楼 · 2020-08-08 20:10</span></div><div class="rb">外地来的，记住几条：夜里有人叫名字别应；别回头看纸人；别踩纸钱；祠堂里别说「我愿意」。</div></div>
          <div class="reply"><div class="rh"><b>游客</b><span>2楼 · 2020-08-08 20:22</span></div><div class="rb">为什么？</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>3楼 · 2020-08-08 20:30</span></div><div class="rb">不为什么，照做就行。</div></div>
          <div class="reply"><div class="rh"><b>较真的人</b><span>4楼 · 2020-08-08 21:05</span></div><div class="rb">这些规矩是谁定的？</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>5楼 · 2020-08-08 21:07</span></div><div class="rb">赵伯。</div></div>
          <div class="reply"><div class="rh"><b>本地人</b><span>6楼 · 2020-08-08 22:41</span></div><div class="rb">我住了三十年，没应过名字，也没少块肉。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>7楼 · 2020-08-09 00:03</span></div><div class="rb">你守的规矩，是别人给你画的圈。</div></div>
          <div class="reply del"><div class="rh"><b>——</b><span>8楼</span></div><div class="rb">该楼层已被删除。</div></div>
          <p style="margin-top:14px"><span class="btn" data-go="forum">返回论坛</span></p>
        </div>
      </div>`
  },

  tSing: {
    url: "bbs.7wen.net/thread/0404",
    title: "半夜的嫁歌",
    html: `
      <div class="forum" style="min-height:100%">
        <div class="ftop"><b>七闻论坛</b><span class="sub">城市传说 · 帖子</span></div>
        <div class="fcrumb">七闻论坛 › 城市传说 › 正文</div>
        <div style="padding:12px 14px 30px">
          <h3 style="color:#1a4f9c;margin:0 0 4px">半夜听到唱嫁歌，是我幻听吗</h3>
          <div class="tiny" style="color:#7a6f5c;margin-bottom:10px">楼主：一只耳朵 · 2022-04-04 · 回复 9</div>
          <div class="reply"><div class="rh"><b>一只耳朵</b><span>1楼 · 2022-04-04 03:50</span></div><div class="rb">昨晚三点多，听见外面有女人唱嫁歌，一句一停。我住老街。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>2楼 · 2022-04-04 07:12</span></div><div class="rb">我也听见过，在 203 那家民宿附近。</div></div>
          <div class="reply"><div class="rh"><b>老板娘</b><span>3楼 · 2022-04-04 08:33</span></div><div class="rb">那是录音，吓唬游客的，别当真。</div></div>
          <div class="reply"><div class="rh"><b>一只耳朵</b><span>4楼 · 2022-04-04 09:01</span></div><div class="rb">录音？那声音会跟着人走。</div></div>
          <div class="reply"><div class="rh"><b>匿名</b><span>5楼 · 2022-04-04 11:40</span></div><div class="rb">楼主还在吗？</div></div>
          <div class="reply"><div class="rh"><b>一只耳朵</b><span>6楼 · 2022-04-04 13:22</span></div><div class="rb">……</div></div>
          <div class="reply del"><div class="rh"><b>——</b><span>7楼</span></div><div class="rb">该楼层已被删除。</div></div>
          <p style="margin-top:14px"><span class="btn" data-go="post203">看看那个 203 的帖子</span> <span class="btn" data-go="forum" style="margin-left:8px">返回论坛</span></p>
        </div>
      </div>`
  },

  museum: {
    url: "www.luoyan-museum.cn",
    title: "落雁镇冥婚民俗馆",
    html: `
      <div class="museum">
        <div class="mh">
          <h1>冥婚民俗馆</h1>
          <p>赵氏宗族 · 二〇〇八年建馆 · 免费开放</p>
        </div>
        <div class="mhero" data-go="pano">
          <img src="assets/museum_hall.jpg" alt="一号展厅">
          <div class="mhero-cap">一号展厅 · 点击进入 360° 全景</div>
        </div>
        <blockquote>「阴婚者，以死配死，以生者之名，续亡者之嗣。<br>礼成，则两家为亲，田宅有托。」<br><span style="font-size:10.5px;color:#6b5545">——《落雁镇志·风俗卷》</span></blockquote>
        <p class="mintro">本馆由赵氏宗族于二〇〇八年创办，共三个展厅。一号厅陈列冥婚礼制，二号厅藏族谱与地契，三号厅常年修缮，不对外开放。</p>
        <div class="mroute">
          <span>① 馆藏</span><span>② 数字馆藏</span><span>③ 一号展厅全景</span>
        </div>

        <div class="msec">馆藏 · 一号厅</div>

        <div class="mitem">
          <img src="assets/museum_hunshu.jpg" alt="龙凤婚书">
          <div class="mcap"><b>龙凤婚书</b><span>民国三十六年 · 赵氏藏</span>红纸黑字，双方生辰以朱笔填入。说明牌上写着：「合婚之后，两家田宅互通。」</div>
        </div>
        <div class="mitem">
          <img src="assets/museum_jiayi.jpg" alt="冥婚嫁衣">
          <div class="mcap"><b>冥婚嫁衣</b><span>清末 · 赵氏藏</span>据说每一件嫁衣只穿过一次。展柜内侧有一道很深的划痕，像是有人从里面抓过。</div>
        </div>
        <div class="mitem">
          <img src="assets/museum_ding.jpg" alt="镇魂钉">
          <div class="mcap"><b>镇魂钉</b><span>旧物 · 三枚一组</span>钉身缠红线，出土于落雁滩。说明牌只有四个字：「钉在，魂不出。」</div>
        </div>

        <div class="msec">数字馆藏</div>
        <div class="exh" data-go="pano">
          <div class="ph">点击进入 · 360° 展厅全景</div>
          <div class="cap"><b>一号展厅 · 全景</b><br><span class="tiny" style="color:#8d7a63">转一圈，找一找内室的门</span></div>
        </div>
        <div class="exh" data-go="gazetteer">
          <div class="ph">地方志 · 数字馆藏</div>
          <div class="cap"><b>《落雁镇志》卷七</b><br><span class="tiny" style="color:#8d7a63">一九八六年至一九九三年条目</span></div>
        </div>
        <div class="exh" data-go="news1987">
          <div class="ph">剪报 · 一九八七</div>
          <div class="cap"><b>县报 · 落雁滩无名女尸</b><br><span class="tiny" style="color:#8d7a63">扫描件 · 仅存一份</span></div>
        </div>

        <div class="mnotice">
          <b>参观须知</b><br>
          开放时间：09:00–17:00（周一闭馆）<br>
          讲解：馆长 赵鹤年（需提前预约）<br>
          三号厅修缮中，谢绝参观。
        </div>
        <p class="mnote">讲解员提示：数字馆藏里的全景可以转，别只站在门口看。西墙那块门板，平时是关着的。</p>
        <p class="tiny" style="padding:0 16px 20px;color:#6b5545">本馆由赵氏民俗文化有限公司运营。馆长：赵鹤年。</p>
      </div>`
  },

  innerhall: {
    url: "www.luoyan-museum.cn/inner",
    title: "未上线页面 · 内室",
    html: `
      <div class="museum" style="background:#0d0808">
        <div class="mh" style="background:#1a0c0c">
          <h1 style="font-size:16px">内室 · 未开放的展柜</h1>
          <p>此页面尚未发布。您通过了一个不存在的入口。</p>
        </div>
        <div style="margin:18px;border:1px solid #3a2727;padding:14px;background:#140a0a">
          <img src="assets/oldphoto.jpg" alt="一九八七年黑白合影" style="width:100%;display:block;border:1px solid #3a2727;filter:brightness(.92) contrast(1.05)">
          <p class="tiny" style="color:#8d7a63;margin-top:12px">
            照片里一共七个人。前排新娘的位置，脸被人用剪刀剪掉了，只留下一个圆形的白洞。<br>
            背面用蓝黑墨水写着一行字：<br>
            <span style="font-family:var(--serif);font-size:14px;color:#c9b08a">「赵鹤鸣 冥婚 一九八六 · 七月初七」</span><br>
            字的下方，还有一个被水洇开的字：<b style="color:#c96a5a">棠</b>。
          </p>
        </div>
        <p class="tiny" style="padding:0 18px;color:#5a4a3a">页面编号：EX-03 · 上传者：zhao1965 · 上传时间：2011-04-04</p>
      </div>`
  },

  paper: {
    url: "shop.阴宅纸扎.com",
    title: "阴宅纸扎 · 老赵家",
    html: `
      <div class="shop">
        <div class="stop"><span>阴宅纸扎 · 老赵家</span><span>我的订单</span></div>
        <div class="item">
          <div class="thumb">童女<br>纸人</div>
          <div style="flex:1">
            <b>童女纸人 · 手工扎制 · 双眼可动</b>
            <div class="s">月销 3 · 落雁镇发货</div>
            <div class="p">￥880.00</div>
          </div>
        </div>
        <div class="item">
          <div class="thumb">龙凤<br>婚书</div>
          <div style="flex:1">
            <b>手写龙凤婚书 · 可代填八字</b>
            <div class="s">月销 1 · 需提供双方生辰</div>
            <div class="p">￥1,200.00</div>
          </div>
        </div>
        <div class="item">
          <div class="thumb">镇魂<br>钉</div>
          <div style="flex:1">
            <b>镇魂钉 · 旧物 · 三枚一组</b>
            <div class="s">月销 0 · 非卖品</div>
            <div class="p">联系客服</div>
          </div>
        </div>
        <div class="order" data-go="paperOrder">
          <div style="border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:8px;font-size:12px;color:#666">最近一笔订单（商家后台未退出）</div>
          <div><span class="k">订单号</span><span class="v">881703</span></div>
          <div><span class="k">买家</span><span class="v">赵**（老客户）</span></div>
          <div><span class="k">收货</span><span class="v">落雁镇 · 赵家老宅 · 后进</span></div>
          <div><span class="k">备注</span><span class="v" style="color:#c0392b">照旧，眼要活的。</span></div>
        </div>
        <p class="tiny" style="padding:0 12px;color:#999">本店所有纸扎均为手工制品，售出概不退换。</p>
      </div>`
  },

  paperOrder: {
    url: "shop.阴宅纸扎.com/order/881703",
    title: "订单详情",
    html: `
      <div class="shop">
        <div class="stop"><span>订单详情</span><span>881703</span></div>
        <div class="order">
          <div><span class="k">订单号</span><span class="v">881703</span></div>
          <div><span class="k">下单时间</span><span class="v">2026-10-02 15:22</span></div>
          <div><span class="k">商品</span><span class="v">童女纸人 ×2</span></div>
          <div><span class="k">收货地址</span><span class="v">落雁镇 · 赵家老宅 · 后进</span></div>
          <div><span class="k">买家留言</span><span class="v">照旧，眼要活的。</span></div>
          <div><span class="k">物流</span><span class="v">商家自送</span></div>
        </div>
        <div class="order" style="background:#fffdf3;color:#6b5a2c;font-size:11.5px">
          商家备注：老宅后进的库房锁该换了，密码还是老样子，别又忘了。
        </div>
        <p class="tiny" style="padding:0 12px;color:#999">订单号后六位：881703</p>
      </div>`
  },

  gazetteer: {
    url: "www.luoyan-museum.cn/archive/v7",
    title: "《落雁镇志》卷七",
    html: `
      <div class="doc">
        <h2>落雁镇志</h2>
        <div class="dsub">卷七 · 风俗 · 一九八六—一九九三</div>
        <p>落雁镇，旧名落雁滩。滩有深潭三，水色如墨，相传为「归水」。镇人溺者，多投于此。</p>
        <div class="entry">
          <b>赵鹤鸣</b>
          <p>赵氏长子，一九八六年七月初七殁，年二十三。未婚。赵氏为配冥婚，娶陈氏女，礼成于当年七月。</p>
          <p class="tiny" style="color:#7a6a4a">按：冥婚之礼，女家须以庚帖、嫁衣、牌位三物为聘。</p>
        </div>
        <div class="entry">
          <b>陈氏</b>
          <p>陈氏女，佚名，年十九，一九八七年夏溺于落雁滩第三湾。殁后入赵氏祖坟，牌位书「赵门陈氏」，不录名。</p>
          <p class="tiny" id="gaz-redact-line" style="color:#7a6a4a">原文此处有墨污，似为后人涂改。<span class="btn" data-act="text-layer" style="font-size:10px;padding:3px 8px;margin-left:6px">查看文本层</span></p>
        </div>
        <div class="entry">
          <b>沈玉兰</b>
          <p>沈氏女，一九八七年春出走，去向不明。其家所欠赵氏钱粮，未清。</p>
        </div>
        <div class="entry">
          <b>赵小满</b>
          <p>赵鹤年之子，一九九三年溺于落雁滩，年六岁。葬于赵氏祖坟。</p>
        </div>
        <p class="tiny" style="margin-top:20px;color:#7a6a4a">本卷由赵氏宗祠于二〇一一年重修。付印：县地方志办公室。</p>
      </div>`
  },

  news1987: {
    url: "www.luoyan-museum.cn/archive/news1987",
    title: "剪报 · 一九八七",
    html: `
      <div class="doc" style="background:#e9dfc6">
        <div class="dsub" style="letter-spacing:1px">《落雁县报》 一九八七年 八月 四日 第三版</div>
        <h2 style="font-size:15px;letter-spacing:2px;text-align:left">落雁滩发现无名女尸 警方排除他杀</h2>
        <p>本报讯 八月三日晨，落雁镇渔民在落雁滩第三湾发现一具女尸，年约十九，身着红衣，身上无外伤。经查，死者非本镇户籍，身份不明。</p>
        <p>警方初步判断为失足溺水，已排除他杀。因无人认领，遗体由赵氏宗祠代为安葬。</p>
        <p class="tiny" style="color:#8a7c5e">又讯：赵氏宗祠即日起招募义工，协助整理族谱。联系人：赵鹤年。</p>
        <p class="tiny" style="color:#8a7c5e;margin-top:16px">［原件扫描 · 边缘有霉斑 · 右下角一枚指印］</p>
      </div>`
  },

  router: {
    url: "http://192.168.1.1/",
    title: "路由器管理",
    html: `
      <div class="site" style="background:#101418;color:#cfe0ea;min-height:100%;padding:24px 18px;font-family:var(--mono)">
        <div style="font-size:11px;letter-spacing:3px;color:#5f7a8a">ZHENHEJU-ROUTER</div>
        <h3 style="font-family:var(--sans);font-size:17px;color:#dbe7ee">管理登录</h3>
        <p class="tiny" style="color:#6f8290">首次登录请修改默认密码</p>
        <label class="tiny">用户名</label>
        <input id="r-user" value="" style="width:100%;padding:10px;margin-top:5px;background:#0a0f13;border:1px solid #24323c;color:#cfe0ea;outline:0;border-radius:4px">
        <label class="tiny" style="display:block;margin-top:12px">密码</label>
        <input id="r-pass" type="password" style="width:100%;padding:10px;margin-top:5px;background:#0a0f13;border:1px solid #24323c;color:#cfe0ea;outline:0;border-radius:4px">
        <button class="btn" data-act="router-login" style="margin-top:14px;background:#2f4f5e;border:0">登录</button>
        <p class="tiny" style="color:#4f6472;margin-top:18px">设备背面标签：admin / 123456</p>
      </div>`
  },

  cloud: {
    url: "pan.zhaoshi-zu.cn/s/7f3a",
    title: "赵氏宗族 · 共享",
    html: `
      <div class="cloud">
        <div class="ch">
          <h2>赵氏宗族 · 共享文件夹</h2>
          <p>创建者 zhao1965 · 仅限族内</p>
        </div>
        <div style="padding:24px 18px">
          <p style="font-size:12.5px;color:#a8bdd6">此分享设置了访问问题。</p>
          <p style="font-size:12.5px;color:#a8bdd6;margin-top:12px">「赵家长子的忌日，是哪一天？」</p>
          <p class="tiny" style="color:#6f88a6;margin-top:4px">请填写八位数字，如 19900101</p>
          <input id="cloud-a" inputmode="numeric" maxlength="8" placeholder="YYYYMMDD"
            style="width:100%;margin-top:12px;padding:11px;background:#0a1520;border:1px solid #1e3a55;border-radius:6px;color:#dbe9fa;outline:0">
          <button class="btn" data-act="cloud-open" style="margin-top:12px;background:#1f3a55;border:0">进入</button>
          <p class="tiny" style="color:#5f7a96;margin-top:16px">线索：地方志 · 卷七</p>
        </div>
      </div>`
  },

  cloudFiles: {
    url: "pan.zhaoshi-zu.cn/s/7f3a/files",
    title: "共享文件夹 · 4 个文件",
    html: `
      <div class="cloud">
        <div class="ch">
          <h2>共享文件夹</h2>
          <p>4 个文件 · 最近更新 2026-10-02</p>
        </div>
        <div class="file" data-go="ledgerDoc"><div class="fi">表</div><div><b>阴账_1986-2026.xls</b><div class="s">1.2 MB · 2026-10-02</div></div></div>
        <div class="file" data-go="proxyDoc"><div class="fi">文</div><div><b>委托书_沈宅.pdf</b><div class="s">386 KB · 2026-09-18</div></div></div>
        <div class="file" data-go="deathDoc"><div class="fi">图</div><div><b>死亡证明_赵小满.jpg</b><div class="s">2.4 MB · 2019-06-01</div></div></div>
        <div class="file" data-go="crowdfund"><div class="fi">链</div><div><b>何舟众筹.pdf</b><div class="s">120 KB · 2026-08-11</div></div></div>
        <p class="tiny" style="padding:0 16px;color:#5f7a96">下载将被记录。</p>
      </div>`
  },

  ledgerDoc: {
    url: "pan.zhaoshi-zu.cn/s/7f3a/files/ledger",
    title: "阴账_1986-2026.xls",
    html: `
      <div class="doc" style="background:#f2efe6">
        <h2 style="letter-spacing:2px">阴 账</h2>
        <div class="dsub">赵氏宗祠 · 手抄本 · 一九八六年起</div>
        <table style="width:100%;font-size:11.5px;border-collapse:collapse;font-family:var(--sans)">
          <tr style="background:#ddd4bd"><th style="border:1px solid #c3b79a;padding:5px">年份</th><th style="border:1px solid #c3b79a;padding:5px">女家</th><th style="border:1px solid #c3b79a;padding:5px">事由</th><th style="border:1px solid #c3b79a;padding:5px">田产</th></tr>
          <tr><td style="border:1px solid #c3b79a;padding:5px">1986</td><td style="border:1px solid #c3b79a;padding:5px">陈氏</td><td style="border:1px solid #c3b79a;padding:5px">配赵鹤鸣</td><td style="border:1px solid #c3b79a;padding:5px">—</td></tr>
          <tr><td style="border:1px solid #c3b79a;padding:5px">1987</td><td style="border:1px solid #c3b79a;padding:5px">沈氏</td><td style="border:1px solid #c3b79a;padding:5px">逃</td><td style="border:1px solid #c3b79a;padding:5px">欠</td></tr>
          <tr><td style="border:1px solid #c3b79a;padding:5px">1987</td><td style="border:1px solid #c3b79a;padding:5px">陈阿棠</td><td style="border:1px solid #c3b79a;padding:5px">顶沈氏</td><td style="border:1px solid #c3b79a;padding:5px">—</td></tr>
          <tr><td style="border:1px solid #c3b79a;padding:5px">2019</td><td style="border:1px solid #c3b79a;padding:5px">李</td><td style="border:1px solid #c3b79a;padding:5px">配</td><td style="border:1px solid #c3b79a;padding:5px">已过户</td></tr>
          <tr><td style="border:1px solid #c3b79a;padding:5px">2026</td><td style="border:1px solid #c3b79a;padding:5px">沈知遥</td><td style="border:1px solid #c3b79a;padding:5px">待</td><td style="border:1px solid #c3b79a;padding:5px">沈宅</td></tr>
        </table>
        <p style="margin-top:14px">末页附记：顶替者，不算还。债在沈家血脉，须沈家女儿亲笔。</p>
        <p class="tiny" style="color:#8a7c5e">［赵鹤年 手书 · 一九九三年补记］</p>
      </div>`
  },

  proxyDoc: {
    url: "pan.zhaoshi-zu.cn/s/7f3a/files/proxy",
    title: "委托书_沈宅.pdf",
    html: `
      <div class="doc" style="background:#f7f3e8">
        <h2 style="font-size:15px;letter-spacing:3px">授 权 委 托 书</h2>
        <div class="dsub">（附于婚书背面 · 仪式现场签署）</div>
        <p>委托人：沈知遥（身份证号略）</p>
        <p>受托人：赵鹤年</p>
        <p>委托事项：委托人自愿将落雁镇沈宅（产权证号 落字第 0447 号）之全部处置权，包括但不限于转让、出租、抵押、拆迁补偿领取，全权委托受托人办理。</p>
        <p>本委托书自双方在赵氏宗祠仪式中签字按印之日起生效，不可撤销。</p>
        <p style="margin-top:24px">委托人签字：____________</p>
        <p>受托人签字：赵鹤年</p>
        <p class="tiny" style="color:#8a7c5e;margin-top:18px">［空白处有浅淡的铅笔字：她不会签的。让他签。］</p>
      </div>`
  },

  deathDoc: {
    url: "pan.zhaoshi-zu.cn/s/7f3a/files/death",
    title: "死亡证明_赵小满.jpg",
    html: `
      <div class="doc" style="background:#eee9dc">
        <h2 style="font-size:15px;letter-spacing:3px">死 亡 证 明</h2>
        <div class="dsub">落雁镇卫生院 · 一九九三年</div>
        <p>姓名：赵小满　性别：男　年龄：六岁</p>
        <p>死亡时间：一九九三年 七月 廿二 日 申时</p>
        <p>死亡地点：落雁滩 第三湾</p>
        <p>死亡原因：溺水</p>
        <p>备注：患儿随父祭祖，失足落水。发现时已无生命体征。</p>
        <p class="tiny" style="margin-top:16px">经办人：赵鹤年（家属）　医师：李</p>
        <p class="tiny" style="color:#a33;margin-top:14px">［照片右下角有一行后来添加的字：他说他看见一个穿红衣服的姐姐。］</p>
      </div>`
  },

  crowdfund: {
    url: "love.水滴筹.com/hz2026",
    title: "何舟 · 众筹",
    html: `
      <div class="site" style="background:#f7f9fb;min-height:100%;padding:16px;font-family:var(--sans)">
        <div style="background:#fff;border-radius:10px;padding:14px;box-shadow:0 1px 6px #0001">
          <h3 style="margin:0;font-size:16px">救救我弟弟何舟，他才 28 岁</h3>
          <p class="tiny" style="color:#888">尿毒症 · 已透析 3 年 · 等一个肾</p>
          <div style="height:8px;background:#eee;border-radius:4px;margin:12px 0"><div style="width:79%;height:8px;background:#e4393c;border-radius:4px"></div></div>
          <p style="font-size:12px;color:#666">已筹 300,120 元 / 目标 380,000 元</p>
          <div class="hr"></div>
          <p style="font-size:12.5px;line-height:1.9;color:#444">
            我们家在落雁镇开民宿，叫枕河居。我妈一个人撑了很多年。<br>
            赵家伯父一直在帮我们，医药费、透析费都是他先垫的。<br>
            我不太清楚他图什么，我妈也不说。但只要我还能活，我就认这个情。
          </p>
          <div class="hr"></div>
          <p class="tiny" style="color:#888">大额捐赠</p>
          <div class="kv" style="border-color:#eee"><span style="color:#444">赵氏民俗文化有限公司</span><span>¥80,000</span></div>
          <div class="kv" style="border-color:#eee"><span style="color:#444">匿名</span><span>¥2,000</span></div>
          <div style="margin-top:12px">
            <button class="btn red w100" data-act="donate" style="font-size:12px;padding:8px">捐 200 元</button>
            <p class="tiny" id="cf-note" style="color:#999;text-align:center;margin-top:6px"></p>
          </div>
        </div>
        <p class="tiny" style="color:#999;margin-top:12px">本页面由患者家属发起，平台不收取费用。</p>
      </div>`
  },

  albumLock: {
    url: "app://云相册",
    title: "云相册",
    html: `
      <div class="site" style="background:#0d0d12;color:#cfc9bd;min-height:100%;padding:40px 22px;font-family:var(--sans)">
        <div style="text-align:center">
          <div style="width:64px;height:64px;margin:0 auto 14px;border-radius:16px;background:#1c1c24;display:grid;place-items:center;font-size:26px">相</div>
          <h3 style="margin:0;font-size:16px">沈知遥的云相册</h3>
          <p class="tiny" style="color:#7a756c">此相册已加密</p>
        </div>
        <p class="tiny" style="color:#8a857a;margin-top:30px;text-align:center">请输入八位密码</p>
        <input id="album-pass" inputmode="numeric" maxlength="8" placeholder="YYYYMMDD"
          style="width:100%;margin-top:8px;padding:12px;text-align:center;letter-spacing:4px;background:#15151b;border:1px solid #2c2c34;border-radius:8px;color:#ded8cc;outline:0">
        <button class="btn w100" data-act="album-open" style="margin-top:12px;background:#2b2b34;border:0">解锁</button>
        <p class="tiny" style="color:#5f5a52;margin-top:18px;text-align:center">密保问题：奶奶的忌日</p>
        <p class="tiny" style="color:#4f4a44;margin-top:6px;text-align:center">（提示：她朋友圈发过的那天）</p>
      </div>`
  },

  album: {
    url: "app://云相册/沈知遥",
    title: "云相册 · 2022",
    html: `
      <div class="album">
        <div class="vhead" style="border-color:#1a1a1a"><span class="back" data-act="home">‹</span><h2>云相册 · 2022</h2></div>
        <div class="grid">
          <div class="cell"><div class="veil">2022.11<br>病房</div></div>
          <div class="cell"><div class="veil">2022.11<br>老照片</div></div>
          <div class="cell" data-go="videoYulan" style="cursor:pointer"><div class="veil" style="color:#c96a5a">2022.12.03<br>▶ 录像</div></div>
          <div class="cell"><div class="veil">2022.12<br>空房间</div></div>
          <div class="cell"><div class="veil">2022.12<br>木匣</div></div>
          <div class="cell"><div class="veil">2023.01<br>雪</div></div>
        </div>
        <p class="tiny" style="padding:0 14px;color:#6f6a60">奶奶走的那天，她录了很久。她说，有些话不能带进土里。</p>
      </div>`
  },

  videoYulan: {
    url: "app://云相册/2022.12.03",
    title: "录像 · 2022.12.03",
    html: `
      <div class="video">
        <div class="frame">
          <div class="framelabel">REC ● 2022.12.03 21:07</div>
          <p class="line" style="animation-delay:.2s">（镜头对着天花板，很久没有动。能听见氧气机的声音。）</p>
          <p class="line" style="animation-delay:1.2s">玉兰：知遥啊……奶奶跟你说件事。你听完，别恨奶奶。</p>
          <p class="line" style="animation-delay:2.4s">玉兰：奶奶年轻的时候，在落雁镇，差点嫁给一个死人。</p>
          <p class="line" style="animation-delay:3.6s">玉兰：不是鬼娶亲那种戏文。是真的。婚书都写好了，红纸黑字，按手印。</p>
          <p class="line" style="animation-delay:4.8s">玉兰：我跑了。成亲头一天夜里，翻墙跑的。你爷爷在外头等我。</p>
          <p class="line" style="animation-delay:6s">玉兰：第二天，赵家买了个姑娘顶我。上游来的，没爹没妈，叫……</p>
          <p class="line" style="animation-delay:7.2s;color:#e0b090" id="yl-name">玉兰：叫阿棠。</p>
          <p class="line" style="animation-delay:8.4s">玉兰：我后来听说，她也没肯。她跟船上的周家小子约好要跑，被赵家抓回来了，按在滩上……</p>
          <p class="line" style="animation-delay:9.6s">玉兰：我没报警。我怕。我一怕，就是一辈子。</p>
          <p class="line" style="animation-delay:10.8s">玉兰：（很久的沉默）</p>
          <p class="line" style="animation-delay:12s">玉兰：那口匣子里有她的东西。银锁，庚帖。我一直没敢扔。</p>
          <p class="line" style="animation-delay:13.2s">玉兰：你要是有一天去了落雁镇……替奶奶，把她的名字还给她。</p>
          <p class="line" style="animation-delay:14.4s;color:#7a6a5a;font-size:11px">（录像里忽然传来另一个人的声音，很远，像在门外——）</p>
          <p class="line" style="animation-delay:15.6s;color:#c96a5a">赵鹤年（画外）：有些债，是活人记在死人账上的。</p>
        </div>
        <p class="tiny" style="margin-top:14px;color:#6f6a60">视频到此结束。最后三秒，画面里有人影从镜头前走过，但没有脚步声。</p>
      </div>`
  },

  shrine: {
    url: "app://落雁镇智慧旅游/导览/祠堂",
    title: "赵氏宗祠 · 语音导览",
    html: `
      <div class="site" style="background:#100c0a;color:#d6c9b2;min-height:100%;padding:18px;font-family:var(--sans)">
        <h3 style="font-family:var(--serif);letter-spacing:4px;color:#d9c08a">赵氏宗祠</h3>
        <p class="tiny" style="color:#8a7a62">导览音频 · 全长 2:41 · 女声</p>
        <div class="hr" style="border-color:#2a2018"></div>
        <p style="font-size:12.5px;line-height:2;color:#b8a88e">
          宗祠始建于清乾隆年间，三进两院。正厅供奉赵氏历代先祖，东厢为冥婚礼制陈列。<br><br>
          旧时镇中未婚而殁的男子，家人会为其寻一门阴亲。礼成之后，两家结为亲家，女家田产由夫家代管——这也是旧时一种体面的帮扶。
        </p>
        <div class="hintbox" style="background:#1a1310;border-color:#3a2a1a;color:#8a7a62">
          播放到 2:17 处有一段明显的杂音，疑似剪辑。<br>
          <span class="btn" data-act="shrine-spectrum" style="margin-top:8px;font-size:11px;padding:6px 12px">导出频谱图</span>
        </div>
        <canvas id="spec" width="620" height="180" style="width:100%;margin-top:10px;border:1px solid #2a2018;background:#080605;display:none"></canvas>
        <p class="tiny" id="spec-cap" style="display:none;color:#c96a5a">频谱图第 2:17 处，有一段不属于人声的共振峰。它拼出了三个字。</p>
        <div class="hr" style="border-color:#2a2018"></div>
        <p class="tiny" style="color:#6a5a48">讲解词由赵鹤年馆长亲自审定。</p>
      </div>`
  },

  boat: {
    url: "app://落雁镇智慧旅游/地图/渡口",
    title: "渡口 · 船屋",
    scene: true,
    html: `
      <div class="site" style="background:#0b0f12;color:#c2cdd4;min-height:100%;padding:18px;font-family:var(--sans)">
        <h3 style="font-family:var(--serif);letter-spacing:3px">周叔的船屋</h3>
        <p class="tiny" style="color:#7a8a94">一台老式收音机，旋钮已经磨平了。频率刻度上有一道刻痕，停在 1314。</p>
        <div class="hintbox" style="background:#10161a;border-color:#22303a;color:#8a9aa4">
          调频范围：AM 1000 — 1400
        </div>
        <input id="am" type="range" min="1000" max="1400" value="1100" style="width:100%;accent-color:#7a9aa8">
        <div class="center" style="margin-top:6px;font-family:var(--mono);font-size:13px;color:#9abaca" id="am-val">1100 kHz</div>
        <div id="am-out" style="margin-top:16px;font-size:12.5px;line-height:2;color:#8a9aa4;min-height:120px"></div>
        <div class="hr" style="border-color:#22303a"></div>
        <p class="tiny" style="color:#5f6f7a">（屋里没人。炉子上坐着一壶水，还是温的。）</p>
      </div>`
  },

  storage: {
    url: "app://库房/门禁",
    title: "赵家老宅 · 库房",
    scene: true,
    html: `
      <div class="site" style="background:#0d0b0a;color:#cbbba6;min-height:100%;padding:34px 22px;font-family:var(--sans)">
        <div style="text-align:center">
          <div style="font-size:11px;letter-spacing:6px;color:#6a5a48">赵家老宅 · 后进</div>
          <h3 style="font-family:var(--serif);letter-spacing:4px;margin:12px 0">库 房</h3>
          <p class="tiny" style="color:#7a6a58">六位数字密码</p>
        </div>
        <input id="st-pass" inputmode="numeric" maxlength="6" placeholder="••••••"
          style="width:100%;margin-top:26px;padding:12px;text-align:center;letter-spacing:10px;font-size:18px;background:#151110;border:1px solid #2f2620;border-radius:8px;color:#d8c8b0;outline:0">
        <button class="btn w100" data-act="storage-open" style="margin-top:12px;background:#3a2a1e;border:0">开锁</button>
        <p class="tiny" style="color:#5a4a3a;margin-top:18px;text-align:center">锁是旧的，密码也是旧的。赵家的人从不改密码。</p>
      </div>`
  },

  storageIn: {
    url: "app://库房/内部",
    title: "库房 · 内部",
    scene: true,
    html: `
      <div class="site" style="background:#0b0908;color:#c9b9a4;min-height:100%;padding:18px;font-family:var(--serif);font-size:13px;line-height:2">
        <p>库房里有霉味，还有香灰味。墙角堆着纸人，脸都朝着门。</p>
        <div class="hintbox" style="background:#141010;border-color:#2a201a;color:#a8987f;font-family:var(--sans)">
          <b style="color:#d9c08a">镇魂钉 ×3</b><br>
          锈铁钉，三枚，钉身缠着褪色的红线。钉子被人从墙里起出来过，钉尖上还带着砖屑。
        </div>
        <div class="hintbox" style="background:#141010;border-color:#2a201a;color:#a8987f;font-family:var(--sans)">
          <b style="color:#d9c08a">账本残页</b><br>
          「沈玉兰，一九八七，逃。陈阿棠，顶。沉潭，落雁滩第三湾。赵鹤年手。」<br>
          「尸骨在祠堂后墙，砖第三排，第二块。钉未起，魂不出。」
        </div>
        <p class="tiny" style="color:#6a5a48">（你拍下了这两页。闪光灯亮的时候，纸人的眼睛好像动了一下。）</p>
        <p style="margin-top:16px"><span class="btn" data-act="evidence-bones">收好证据</span></p>
      </div>`
  },

  errorPage: {
    url: "about:blank",
    title: "无法访问",
    html: `
      <div class="site" style="background:#f2f0ea;color:#555;min-height:100%;padding:60px 24px;text-align:center;font-family:var(--sans)">
        <div style="font-size:40px;color:#bbb">:(</div>
        <h3 style="font-family:var(--serif);letter-spacing:2px;color:#444">无法访问此页面</h3>
        <p class="tiny" style="color:#888">落雁镇范围内，部分网站已被限制访问。</p>
        <p class="tiny" style="color:#aaa;margin-top:20px">ERR_BLOCKED_BY_LOCAL_AUTHORITY</p>
      </div>`
  },

  ended: {
    url: "app://落雁镇",
    title: "落雁镇",
    html: `<div class="site" style="padding:40px 20px;color:#777;text-align:center">故事已经结束了。</div>`
  }
};

/* ---------- 结局 ---------- */
const ENDINGS = {
  bad: {
    code: "结局一 · 留镇",
    title: "留 镇",
    body:
`你烧了婚书，砸了牌位，掀翻供桌。

你以为断了。

火光里，赵鹤年没有拦你。他站在门槛外，看着那些纸灰往天上飘，忽然笑了一下，像松了一口气。

「她自己毁的。」他说，「鬼要她偿，谁也怪不得我。」

雨停了。他们把你送出镇口，客气得像送一位远客。车开出去十分钟，路又绕回镇口。第二次，第三次，还是一样。

第三次绕回来的时候，你看见知遥站在桥上。

她穿着那件红嫁衣，冲你招手，动作很轻，像怕你听不见似的。

你想喊她。你发现自己想不起来她叫什么。

相机里所有合照，都只剩你一个人。

她身后的门牌，已经换成了——

赵门沈氏之位。

你不记得自己是怎么上的车。只记得司机说了一句：

「有些门，推开是走出去的。有些门，推开是走进来的。」`,
    cues: [{ at: 0, s: "glitch" }, { at: 0.35, s: "paper" }, { at: 0.68, s: "knock" }, { at: 0.95, s: "bell" }],
    note: "你把唯一能注销契约的凭证烧了。契从「可解」变成「死契」。"
  },

  eerie: {
    code: "结局二 · 附身",
    title: "附 身",
    body:
`你站着没动。

红烛烧到一半，赵鹤年念完了婚书。知遥自己掀了盖头，看着你，眼睛很亮。

「我愿意。」她说。

声音不是她的。

烛火一起灭了。

再亮起来的时候，她还是那副样子，坐在供桌旁，抬手理了理鬓角。那个动作你见过一千次。可她开口的第一句话是：

「我等了三十九年。」

她伸手摸你的脸，指尖很凉。

「阿周，」她叫你，「你怎么老成这样了。」

门外，赵鹤年跪下去磕头，额头碰在青砖上，一下，一下。

「债清了。」他说，「清了。」

天亮的时候，你带着「知遥」离开落雁镇。她挽着你的胳膊，很乖，一路没说话。镇上的人在背后看着你们，有人说：

「新娘子真乖。」

你低头看她的手机。屏保还是你们俩的合照。

照片里，她的脸已经换成了另一个人。`,
    cues: [{ at: 0.12, s: "bell" }, { at: 0.55, s: "heart" }, { at: 0.88, s: "whisper" }],
    note: "仪式真正的功能是移魂。赵家祖上用它给怨魂找一个活人的身子。"
  },

  true: {
    code: "结局三 · 破局",
    title: "破 局",
    body:
`你把手机架在供桌上，点了直播。

信号只有一格。够了。

你念阴账。念到「陈阿棠」三个字的时候，祠堂里有人吸了一口冷气。

你念到「顶替者，不算还」的时候，赵鹤年忽然不念婚书了。

你念到「尸骨在祠堂后墙，砖第三排」的时候，老周从人群里走出来，一瘸一拐，手里攥着一把锈钉。

「是我埋的。」他说，「三十九年了，我天天从那儿过。」

何婶在人群最后面，忽然哭出声来。她说她儿子还在医院等着钱。她说她有罪。

赵鹤年没有跑。他站在供桌后面，看着你，像看一个他算错了的东西。

「我儿子死的时候，才六岁。」他说，「你们懂什么。」

没有人回答他。

阿棠是在那时候出现的。

她没有七窍流血，也没有尖啸。她只是个穿嫁衣的姑娘，站在红烛后面，安安静静地看着你。

「我叫什么？」她问。

「陈阿棠。」你说。

她笑了一下。很浅，像终于想起一件很久以前的事。

红盖头落在地上。祠堂后面的井，水位退了三尺。

知遥醒过来，第一句话是：「你终于来了。」

天亮的时候，警车停在渡口。赵鹤年被带走，经过你身边时，他问了一句：

「你信不信，这世上真有鬼？」

「有。」你说，「但你比鬼可怕。」

老周撑船送你们过河。船到河心，他忽然说：

「这回可以回头了。」

你回过头。

落雁镇在雾里，很安静。桥上没有人。`,
    cues: [{ at: 0.1, s: "bell" }, { at: 0.42, s: "whisper" }, { at: 0.72, s: "bell" }, { at: 0.94, s: "water" }],
    note: "鬼要的从来不是命，是有人肯把她的名字念对。"
  }
};
