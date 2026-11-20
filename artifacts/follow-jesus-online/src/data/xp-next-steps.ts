export type XPIntroductionType = "received" | "rededicated" | "believer";

export const XP_INTRODUCTIONS = {
  received: {
    title: "Something Real Has Begun",
    paragraphs: [
      "When you invited Jesus Christ into your life, you began a personal relationship with God that lasts forever. Jesus is already at work in you, and He will keep working as you walk with Him.",
    ],
  },
  rededicated: {
    title: "Welcome Back",
    paragraphs: [
      "You just turned toward Jesus again. He receives you. He already knows where you have been. Coming back is the step that matters. Jesus is already at work in you, and He will keep working as you walk with Him.",
    ],
  },
  believer: {
    title: "You Already Belong to Him",
    paragraphs: [
      "You already trust Jesus. God already sees you as His child — forgiven, belonging, and accepted. Your part now is to walk in what is already true.",
      "Even as a believer, questions still come. That is normal. The resources below are here to help you go deeper in what God has already given you.",
    ],
  },
} as const;

export const XP_TOP_TEN = [
  { title: "What does it mean that Jesus now lives within me?", href: "/adv/begin-the-adventure" },
  { title: "How can I be sure that I’m going to heaven?", href: "/adv/citizen-of-heaven" },
  { title: "Who am I now that I belong to Jesus?", href: "/adv/your-new-identity-christ" },
  { title: "What kind of power does God give me?", href: "/adv/the-holy-spirit" },
  { title: "What do I do when I start to doubt?", href: "/adv/walking-by-faith" },
  { title: "How does the Bible provide guidance for my daily choices?", href: "/adv/gods-word" },
  { title: "How can I talk to God like He’s really there?", href: "/adv/prayer" },
  { title: "Why do I need other Christians?", href: "/adv/belonging-to-gods-family" },
  { title: "Does God have a purpose for my life?", href: "/adv/living-a-life-of-purpose" },
  { title: "How do I really get to know Jesus?", href: "/xp/know-Jesus" },
] as const;

export const XP_TOP_TEN_CLOSING = "These are honest questions with solid answers. Learn what it means to belong to Jesus, how to grow in your relationship with Him, and how to live the life He has already begun in you.";

export const KNOW_JESUS = {
  title: "Getting to Know Jesus",
  introduction: "You get to know Jesus the same way you get to know any person you love—by spending time with Him, listening to Him, and walking with Him day by day.",
  lead: "Here are the main ways that actually work:",
  sections: [
    {
      title: "Listen to Him (the Bible)",
      text: "Jesus speaks through His Word. As you read the Gospels (Matthew, Mark, Luke, and John), you see how He lived, what He values, and how He loves. Start small—even a few verses a day—and ask, “What are You showing me about Yourself?”",
      links: [
        { title: "Read the Bible Online", href: "/bible/John/1" },
        { title: "Discover Jesus in the Gospels", href: "/bible/resources/discover-jesus" },
        { title: "Hearing the Voice of God", href: "/bible/resources/hearing-god" },
      ],
    },
    {
      title: "Obey what He says",
      text: "Knowing Jesus grows when you take what He says seriously and put it into practice. Obedience is how trust becomes real. As the Holy Spirit helps you do what Jesus asks, even in small things, your relationship deepens.",
      links: [
        { title: "The Exchanged Life", href: "/gf/walking-in-the-spirit/the-exchanged-life" },
      ],
    },
    {
      title: "Talk to Him (prayer)",
      text: "Talk to Jesus honestly about what’s on your heart—your thanks, your fears, your questions, your needs. You don’t have to use special words. Just talk. He already knows you, and He wants the conversation.",
      links: [
        { title: "Prayer Starter Guide", href: "/prayer" },
      ],
    },
    {
      title: "Walk with Him through ordinary life",
      text: "Invite Him into your normal days—your work, your relationships, your decisions, your struggles. You get to know Him better as you learn to depend on Him in real situations, not just in quiet moments.",
      links: [
        { title: "Experiencing God 24/7", href: "/experiencing-god" },
      ],
    },
    {
      title: "Stay close to other believers",
      text: "Jesus often shows Himself through His people. As you worship, learn, and serve with other Christians, you see more of who He is and how He works.",
      links: [
        { title: "You Are a Member of the Body of Christ", href: "/gf/your-new-identity-in-christ/you-are-a-member-of-the-body-of-christ" },
      ],
    },
  ],
  closing: [
    "You don’t have to do all of this perfectly. Start with one or two simple habits: a short time of reading and prayer each day, and a willingness to respond to what He shows you. Over time, knowing about Jesus turns into actually knowing Him.",
    "He wants to be known by you. And He is patient as you learn.",
  ],
} as const;

export function getXPIntroduction(type: string) {
  return Object.hasOwn(XP_INTRODUCTIONS, type)
    ? XP_INTRODUCTIONS[type as XPIntroductionType]
    : undefined;
}

export function xpIntroductionHref(type: string) {
  return getXPIntroduction(type) ? `/xp/${type}/top10` : undefined;
}
