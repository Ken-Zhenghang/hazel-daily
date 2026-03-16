import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SLANGS = [
  {
    phrase: "That eats.",
    meaningZh: "意思是这很厉害、很出彩，通常用来夸人表现好或造型好看。",
    example: "Hazel, your outfit today eats."
  },
  {
    phrase: "I’m down.",
    meaningZh: "意思是我可以、我愿意、我参加。",
    example: "If you want coffee after class, I’m down."
  },
  {
    phrase: "It’s giving...",
    meaningZh: "意思是有那种感觉、那种氛围。",
    example: "That coat is giving rich-girl energy."
  },
  {
    phrase: "Low-key",
    meaningZh: "意思是有点、暗暗地、低调地。",
    example: "I low-key love this look on you."
  },
  {
    phrase: "Bet.",
    meaningZh: "意思是好、没问题、就这么定了。",
    example: "7:30 brunch tomorrow? Bet."
  },
  {
    phrase: "No cap.",
    meaningZh: "意思是真的、不是开玩笑、我说实话。",
    example: "No cap, that color looks amazing on you."
  },
  {
    phrase: "It’s not that deep.",
    meaningZh: "意思是别想太多，没那么严重。",
    example: "Don’t stress over that text. It’s not that deep."
  },
  {
    phrase: "Main character energy.",
    meaningZh: "意思是很有主角感，很有存在感。",
    example: "That whole outfit has main character energy."
  }
];

const PROGRAM_TRACKS = [
  {
    university: "DePaul University",
    major: "TESOL / Applied Linguistics",
    lane: "教育 / 英语",
    difficulty: "中等偏友好",
    why: "适合英语基础继续强化，也能衔接教育和语言教学方向。",
    features: "课程通常兼顾语言学、教学法和真实课堂应用，方向清晰。",
    appeal: "对正在学英语的人很友好，既实用，也容易讲清未来职业方向。"
  },
  {
    university: "Northeastern Illinois University",
    major: "TESOL",
    lane: "教育 / 英语",
    difficulty: "友好",
    why: "方向明确，和英语学习背景贴近，申请压力通常比顶尖名校低。",
    features: "项目务实，聚焦英语教学和课堂沟通，不会太空泛。",
    appeal: "如果想先稳稳申请上，再慢慢往教育领域深走，这类项目很合适。"
  },
  {
    university: "Loyola University Chicago",
    major: "Higher Education",
    lane: "教育",
    difficulty: "中等",
    why: "适合以后想在学校、学生服务或教育管理领域发展。",
    features: "更偏教育体系和学生支持，不要求你直接走高门槛教学执照路线。",
    appeal: "如果喜欢教育环境，又不想把门槛拉得太高，这是很聪明的切入点。"
  },
  {
    university: "National Louis University",
    major: "Counseling / Education-related track",
    lane: "教育 / 助人方向",
    difficulty: "友好",
    why: "更偏实践和职业导向，门槛相对没那么高。",
    features: "很多项目强调应用和职业落地，不会只停留在理论层面。",
    appeal: "适合有同理心、想做助人型工作的人，也更容易把个人故事讲进去。"
  },
  {
    university: "University of Illinois Springfield",
    major: "Public Health",
    lane: "医学相关 / 公卫",
    difficulty: "中等偏友好",
    why: "比临床医学门槛低很多，但仍然能进入健康和医疗体系。",
    features: "偏健康管理、社区健康、政策和公共服务，不走临床超高门槛。",
    appeal: "如果对医疗和健康有兴趣，但不想碰临床医学的高难度，这条路很稳。"
  },
  {
    university: "Governors State University",
    major: "Health Administration",
    lane: "医学相关 / 医疗管理",
    difficulty: "友好",
    why: "避开临床高门槛，更适合从管理、服务和医疗体系切入。",
    features: "更看重管理、协调、服务体系理解，适合不走硬核医学学术路线的人。",
    appeal: "未来能进入医院、诊所、医疗机构的管理和服务岗位，实际就业更直接。"
  },
  {
    university: "Saint Xavier University",
    major: "Education",
    lane: "教育",
    difficulty: "友好",
    why: "学校和项目通常更务实，适合先把研究生申请跑通。",
    features: "项目风格通常更清楚直接，不会像顶级名校那样过度卷背景。",
    appeal: "如果现阶段最重要的是先稳妥进入研究生体系，这类项目很值得看。"
  },
  {
    university: "Lewis University",
    major: "Public Health or Education-related track",
    lane: "教育 / 医学相关",
    difficulty: "友好",
    why: "适合以稳妥录取为优先，再逐步往更明确方向靠。",
    features: "项目通常更偏职业型和应用型，适合先建立美国本地学习经历。",
    appeal: "对转轨申请的人比较友好，能先落地，再慢慢做更细的方向选择。"
  }
];

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiImageModel = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

if (!botToken || !chatId) {
  console.log("Skipping Hazel Telegram push because TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set.");
  process.exit(0);
}

const profilePath = path.join(process.cwd(), "data", "hazel-profile.json");
const profile = JSON.parse(await readFile(profilePath, "utf8"));
const now = new Date();
const [weather, worldBrief] = await Promise.all([
  fetchChicagoWeather(),
  fetchWorldBrief(),
]);
const slang = pickSlang(now);
const outfit = buildOutfit(profile, weather, now);
const program = pickProgram(now);

const lines = [
  `${pickGreetingEmoji(now)} Hazel，早上好`,
  "",
  "──────────",
  "今日口语 | Slang",
  `「${slang.phrase}」`,
  `意思：${slang.meaningZh}`,
  `例句：${slang.example}`,
  "",
  "──────────",
  "今日天气 | Chicago",
  weather.summary,
  "",
  "──────────",
  "国际时局 | Top 3",
  ...renderWorldBrief(worldBrief),
  "",
  "──────────",
  "今日穿搭 | Outfit",
  `场景：${outfit.context}`,
  `风格：${outfit.vibe}`,
  `上身：${outfit.top}`,
  `下身：${outfit.bottom}`,
  `外套：${outfit.outer}`,
  `鞋包：${outfit.shoesAndBag}`,
  `配件：${outfit.accessories}`,
  "",
  "──────────",
  "为什么适合 Hazel",
  ...outfit.why.map((line) => `• ${line}`),
  "",
  "──────────",
  "如果衣柜里没有",
  ...outfit.buyInstead.map((line) => `• ${line}`),
  "",
  "──────────",
  "今日专业 | Grad Pick",
  `学校：${program.university}`,
  `专业：${program.major}`,
  `方向：${program.lane}`,
  `门槛感受：${program.difficulty}`,
  `为什么值得看：${program.why}`,
  `项目特色：${program.features}`,
  `吸引人的地方：${program.appeal}`,
];

const text = lines.join("\n").slice(0, 3900);
const image = await maybeGenerateOutfitImage(profile, outfit, weather);

if (image) {
  const response = await sendTelegramPhoto(botToken, chatId, image, text);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hazel Telegram photo send failed: ${response.status} ${body}`);
  }
} else {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hazel Telegram send failed: ${response.status} ${body}`);
  }
}

console.log("Hazel Telegram brief sent.");

async function fetchWorldBrief() {
  const [politics, economy, military] = await Promise.all([
    fetchGoogleNewsCategory("international politics OR geopolitics", "政治"),
    fetchGoogleNewsCategory("global economy OR international economy", "经济"),
    fetchGoogleNewsCategory("international military OR defense", "军事"),
  ]);

  return [politics, economy, military].filter(Boolean);
}

async function fetchGoogleNewsCategory(query, category) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
    const top = items
      .map((item) => ({
        title: decodeHtml(readXmlTag(item, "title")).replace(/\s+-\s+[^-]+$/, "").trim(),
        url: readXmlTag(item, "link"),
        dateLabel: readXmlTag(item, "pubDate"),
        source: extractSourceFromTitle(decodeHtml(readXmlTag(item, "title"))),
      }))
      .find((item) => item.title && item.url);

    if (!top) return null;

    return {
      category,
      title: top.title,
      url: top.url,
      source: top.source || "Google News",
      dateLabel: formatShortDate(top.dateLabel),
    };
  } catch {
    return null;
  }
}

function renderWorldBrief(items) {
  if (!items.length) {
    return ["• 今天暂时没有抓到稳定的国际新闻摘要"];
  }

  return items.flatMap((item, index) => ([
    `${index + 1}. ${item.category}｜${item.title}`,
    `   来源：${item.source} · ${item.dateLabel}`,
    `   ${item.url}`,
  ]));
}

function pickProgram(date) {
  const day = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    day: "numeric",
  }).format(date));
  return PROGRAM_TRACKS[(day - 1) % PROGRAM_TRACKS.length];
}

async function fetchChicagoWeather() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FChicago&forecast_days=1";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fallbackWeather();
    }

    const payload = await response.json();
    const max = round(payload?.daily?.temperature_2m_max?.[0]);
    const min = round(payload?.daily?.temperature_2m_min?.[0]);
    const code = Number(payload?.daily?.weather_code?.[0] ?? -1);
    const condition = describeWeatherCode(code);
    return {
      max,
      min,
      code,
      condition,
      summary: buildWeatherSummary(condition, max, min, code),
    };
  } catch {
    return fallbackWeather();
  }
}

function fallbackWeather() {
  const month = new Date().toLocaleString("en-US", { month: "numeric", timeZone: "America/Chicago" });
  const monthNumber = Number(month);

  if (monthNumber <= 3) {
    return { max: 7, min: 0, code: -1, condition: "偏冷", summary: "芝加哥偏冷，体感仍接近冬末初春，出门要保暖。" };
  }
  if (monthNumber <= 5) {
    return { max: 18, min: 9, code: -1, condition: "春季微凉", summary: "芝加哥春季微凉，适合轻外套叠穿。" };
  }
  if (monthNumber <= 8) {
    return { max: 29, min: 21, code: -1, condition: "偏暖", summary: "芝加哥偏暖，适合轻薄清爽搭配。" };
  }
  if (monthNumber <= 10) {
    return { max: 16, min: 8, code: -1, condition: "秋凉", summary: "芝加哥秋凉，适合外套和围巾层次。" };
  }
  return { max: 6, min: -1, code: -1, condition: "寒冷", summary: "芝加哥寒冷，适合冬季保暖层次搭配。" };
}

function buildOutfit(profile, weather, date) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
  }).format(date);
  const dayIndex = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    day: "numeric",
  }).format(date));
  const context = pickContext(weekday, dayIndex);

  if (weather.max <= 5) {
    return buildColdLook(context);
  }
  if (weather.max <= 12) {
    return buildCoolLook(context);
  }
  if (weather.max <= 20) {
    return buildMildLook(context);
  }
  return buildWarmLook(context);
}

function pickContext(weekday, dayIndex) {
  if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday)) {
    return "school";
  }
  return dayIndex % 2 === 0 ? "weekend outings" : "date";
}

function buildWeatherSummary(condition, max, min, code) {
  const snowCodes = [71, 73, 75, 77, 85, 86];
  if (snowCodes.includes(code) && max <= 5) {
    return `芝加哥 ${condition}，最高 ${max}°C，最低 ${min}°C，注意保暖和路面湿滑。`;
  }
  return `芝加哥 ${condition}，最高 ${max}°C，最低 ${min}°C。`;
}

function buildColdLook(context) {
  if (context === "date") {
    return {
      context: "约会",
      vibe: "高级温柔 + 收线条，不走甜妹",
      top: "深灰贴身针织打底，领口保持干净偏开领",
      bottom: "高腰 A 字短裙或顺直针织裙，避免臀腿处太贴",
      outer: "长款驼色或奶油色羊毛大衣",
      shoesAndBag: "黑色及膝长靴 + 小号硬挺黑包",
      accessories: "灰色围巾 + 小耳钉",
      why: [
        "大衣和长靴能把比例拉长，让 163 的身高更利落。",
        "上身用干净开领能照顾胸围，不会显得挤。",
        "整体是优雅和女人味，不会太可爱。"
      ],
      buyInstead: [
        "如果没有长大衣，先买一件驼色直线条羊毛大衣。",
        "如果没有长靴，先用黑色短靴替代，但下装长度要更克制。"
      ],
    };
  }

  if (context === "school") {
    return {
      context: "上学",
      vibe: "韩系通勤感，保暖但不臃肿",
      top: "奶灰色细针织或有领针织开衫，内里配简洁打底",
      bottom: "深色高腰直筒牛仔裤或窄直筒裤",
      outer: "深蓝或黑色短款羽绒/飞行夹克",
      shoesAndBag: "保暖靴或干净运动鞋 + 大号通勤包",
      accessories: "围巾 + 长袜",
      why: [
        "短外套配高腰直筒裤更显精神，不会拖沓。",
        "上半身保持利落，能避免胸口显厚。",
        "整体和你给的参考图很接近，但更适合真实通勤。"
      ],
      buyInstead: [
        "可以补一件深色短羽绒，优先选有立体肩线的版型。",
        "裤子优先补高腰直筒深蓝牛仔。"
      ],
    };
  }

  return {
    context: "周末出门",
    vibe: "松弛但高级，偏韩系冬日街头",
    top: "白色或浅灰打底，外搭深色针织或卫衣",
    bottom: "高腰深蓝牛仔裤",
    outer: "焦糖或黑色蓬松羽绒/机车夹克",
    shoesAndBag: "雪地靴或厚底保暖靴 + 质感单肩包",
    accessories: "大围巾或棒球帽",
    why: [
      "参考图里这种冬日街头感很适合 Hazel，但要控制上身体积。",
      "用深浅对比能保留高级感，不会显土。",
      "牛仔裤和保暖靴更适合芝加哥的真实天气。"
    ],
    buyInstead: [
      "可以补一件焦糖色或黑色短羽绒。",
      "可以补一条高腰直筒牛仔裤。"
    ],
  };
}

function buildCoolLook(context) {
  if (context === "date") {
    return {
      context: "约会",
      vibe: "轻熟性感，但克制干净",
      top: "黑色或炭灰色修身针织，上半身不要过多装饰",
      bottom: "高腰短裙或顺直短裤裙",
      outer: "深棕色短款皮衣或收腰西装",
      shoesAndBag: "黑色长靴 + 小号链条包",
      accessories: "细耳环 + 深色丝袜",
      why: [
        "这是你参考图里最适合转译给 Hazel 的一类。",
        "皮衣和长靴能增加气场，性感但不廉价。",
        "修身只保留在一个区域，整体更高级。"
      ],
      buyInstead: [
        "优先买深棕短皮衣和黑色长靴。",
        "没有短裙时可换高腰修身中长裙。"
      ],
    };
  }

  if (context === "school") {
    return {
      context: "上学",
      vibe: "干净学院感，但不是甜妹路线",
      top: "浅灰开衫或有领针织，里面配白色打底",
      bottom: "深色短裙配打底袜，或高腰直筒裤",
      outer: "黑色或炭灰短外套",
      shoesAndBag: "乐福鞋/长靴 + 通勤肩包",
      accessories: "细围巾或发夹",
      why: [
        "把学院感做得成熟一点，更符合 29 岁的状态。",
        "上身清爽，能把胸口量感处理得更利落。",
        "短外套和高腰下装更显比例。"
      ],
      buyInstead: [
        "优先补灰色有领针织开衫。",
        "再补一条版型干净的深色短裙。"
      ],
    };
  }

  return {
    context: "周末出门",
    vibe: "都市轻熟，松弛但有质感",
    top: "白色打底 + 灰色或橄榄绿针织",
    bottom: "浅蓝高腰直筒牛仔裤",
    outer: "驼色长大衣",
    shoesAndBag: "白色或灰色运动鞋 + 黑色硬挺包",
    accessories: "灰围巾",
    why: [
      "你发的长大衣 + 牛仔裤这类图很适合 Hazel 日常复制。",
      "驼色、灰色、浅蓝的组合非常符合中国审美里的高级感。",
      "整体不会过分强调身材，但还是有气质。"
    ],
    buyInstead: [
      "优先买驼色长大衣和灰色围巾。",
      "牛仔裤选高腰顺直版，不要低腰。"
    ],
  };
}

function buildMildLook(context) {
  if (context === "date") {
    return {
      context: "约会",
      vibe: "温柔高级，有女人味但很干净",
      top: "方领或微 V 领贴身针织",
      bottom: "高腰 A 字半裙",
      outer: "薄款短西装或轻皮夹克",
      shoesAndBag: "中跟短靴 + 小包",
      accessories: "金色小耳环",
      why: [
        "领口的处理比硬贴身更重要，能更好修饰上半身。",
        "A 字下装更稳，也更端庄。",
        "这类 look 约会效果最好，优雅感足。"
      ],
      buyInstead: [
        "可以补一件方领针织。",
        "可以补一条版型好的高腰 A 字裙。"
      ],
    };
  }

  if (context === "school") {
    return {
      context: "上学",
      vibe: "轻通勤、轻知识分子感",
      top: "有领衬衫或开领针织",
      bottom: "高腰直筒裤或长裙",
      outer: "轻薄风衣或针织外套",
      shoesAndBag: "乐福鞋或干净球鞋 + 大号包",
      accessories: "简洁发夹",
      why: [
        "这类搭配比甜妹路线更适合 Hazel 现在的年龄和气质。",
        "线条流畅，胸口不会显拥挤。",
        "适合芝加哥春秋上学日常。"
      ],
      buyInstead: [
        "可补一件米白风衣。",
        "可补一条高腰直筒西裤。"
      ],
    };
  }

  return {
    context: "周末出门",
    vibe: "高级松弛，韩系都市感",
    top: "修身针织或简洁 T 恤",
    bottom: "直筒牛仔或长裙",
    outer: "薄款皮夹克或小西装",
    shoesAndBag: "短靴或复古球鞋 + 单肩包",
    accessories: "墨镜或轻围巾",
    why: [
      "松弛感有了，但线条还是收着的，所以不显邋遢。",
      "很适合周末约咖啡、散步、吃饭。",
      "参考图里的都市感可以在这类天气里转译得更自然。"
    ],
    buyInstead: [
      "可以补一件薄款小西装。",
      "可以补一个黑色单肩通勤包。"
    ],
  };
}

function buildWarmLook(context) {
  if (context === "date") {
    return {
      context: "约会",
      vibe: "清爽高级，不甜不腻",
      top: "简洁修身针织或方领上衣",
      bottom: "高腰半裙或顺直长裙",
      outer: "薄款短外套，视气温可省略",
      shoesAndBag: "细带凉鞋或浅口鞋 + 小包",
      accessories: "极简项链",
      why: [
        "暖天更要做减法，避免堆太多元素。",
        "只保留线条和质感，最容易显高级。",
        "对于 Hazel 来说，修身要适度，别太紧。"
      ],
      buyInstead: [
        "补一件好版型方领上衣。",
        "补一条垂感好的高腰半裙。"
      ],
    };
  }

  if (context === "school") {
    return {
      context: "上学",
      vibe: "简洁利落，成熟干净",
      top: "开领衬衫或轻针织",
      bottom: "高腰直筒裤",
      outer: "薄针织开衫",
      shoesAndBag: "乐福鞋或白球鞋 + 大包",
      accessories: "发圈或耳钉",
      why: [
        "暖天通勤更适合极简，别做可爱路线。",
        "利落上衣和高腰裤最不容易出错。",
        "很符合她的端庄和大气偏好。"
      ],
      buyInstead: [
        "补一件开领衬衫。",
        "补一条垂感西裤。"
      ],
    };
  }

  return {
    context: "周末出门",
    vibe: "轻松高级，都市女生日常",
    top: "短款针织或简洁 T 恤",
    bottom: "牛仔裤或短裙",
    outer: "无，或搭一件薄衬衫",
    shoesAndBag: "球鞋或凉鞋 + 单肩包",
    accessories: "墨镜",
    why: [
      "轻装也能高级，关键在于版型和配色。",
      "暖天气下更适合做 clean look。",
      "避免太可爱，保持成熟感。"
    ],
    buyInstead: [
      "补一件版型好的白 T。",
      "补一条高腰直筒牛仔裤。"
    ],
  };
}

function round(value) {
  return Math.round(Number(value));
}

function describeWeatherCode(code) {
  if ([0].includes(code)) return "晴";
  if ([1, 2, 3].includes(code)) return "多云";
  if ([45, 48].includes(code)) return "有雾";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "有雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "有雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "天气多变";
}

function pickGreetingEmoji(date) {
  const day = Number(new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/Chicago" }).format(date));
  const emojis = ["☀️", "🌷", "✨", "💛", "🌤️", "🤍", "🕊️"];
  return emojis[(day - 1) % emojis.length];
}

function pickSlang(date) {
  const day = Number(new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "America/Chicago" }).format(date));
  return SLANGS[(day - 1) % SLANGS.length];
}

async function maybeGenerateOutfitImage(profile, outfit, weather) {
  if (!openAiApiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: openAiImageModel,
      prompt: buildImagePrompt(profile, outfit, weather),
      size: "1024x1536",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI image generation failed: ${response.status} ${body}`);
  }

  const payload = await response.json();
  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) {
    return null;
  }

  return Buffer.from(b64, "base64");
}

function buildImagePrompt(profile, outfit, weather) {
  return [
    "Create a realistic full-body outfit reference image.",
    `Subject: East Asian woman, ${profile.age} years old, ${profile.height_cm}cm, balanced figure, slightly fuller bust.`,
    "Style: elegant, refined, high-end, softly sexy, mature Korean-Chinese city style.",
    `Weather: Chicago, ${weather.condition}, high ${weather.max}C, low ${weather.min}C.`,
    `Outfit vibe: ${outfit.vibe}.`,
    `Top: ${outfit.top}. Bottom: ${outfit.bottom}. Outerwear: ${outfit.outer}. Shoes and bag: ${outfit.shoesAndBag}. Accessories: ${outfit.accessories}.`,
    "Make the styling flattering and realistic for Hazel, with clean neckline handling and polished proportions.",
    "Natural editorial lighting, premium textures, no text, no collage, one person."
  ].join(" ");
}

async function sendTelegramPhoto(token, targetChatId, imageBuffer, caption) {
  const form = new FormData();
  form.append("chat_id", targetChatId);
  form.append("caption", caption.slice(0, 1000));
  form.append("photo", new Blob([imageBuffer], { type: "image/png" }), "hazel-look.png");

  return fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
}

function readXmlTag(xml, tag) {
  const match = String(xml).match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, "").trim() : "";
}

function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&nbsp;/g, " ");
}

function extractSourceFromTitle(value) {
  const parts = String(value).split(" - ");
  return parts.length > 1 ? parts.at(-1) : "";
}

function formatShortDate(value) {
  const parsed = Date.parse(String(value));
  if (Number.isNaN(parsed)) return "今天";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(parsed));
}
