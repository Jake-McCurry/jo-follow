export interface TopicMenuLink {
  label: string
  href: string
}

export interface ConnectWithGodResource {
  title: string
  description: string
  href: string
}

export const TOPIC_MENU_LINKS: TopicMenuLink[] = [
  { label: "Bible", href: "/bible/John/1" },
  { label: "Prayer", href: "/adv/prayer" },
  { label: "Books", href: "/gf/" },
  { label: "Holy Spirit", href: "/gf/walking-in-the-spirit" },
  { label: "Videos", href: "/rewatch" },
  { label: "Promises", href: "/bible/Romans/8" },
  { label: "Knowing God", href: "/gf/beholding-the-majesty-of-god" },
]

export const CONNECT_WITH_GOD_RESOURCES: ConnectWithGodResource[] = [
  {
    title: "Read the Bible",
    description: "Open the Word. Meet the Father.",
    href: "/bible/John/1",
  },
  {
    title: "Knowing God / Topical Concordance",
    description: "A new view of the Father, one topic at a time.",
    href: "/gf/beholding-the-majesty-of-god",
  },
  {
    title: "God\u2019s Promises for Hope",
    description: "When feelings fail, His promises still stand.",
    href: "/bible/Romans/8",
  },
  {
    title: "Reflecting on God\u2019s Majesty",
    description: "Because of who God is, I worship.",
    href: "/gf/beholding-the-majesty-of-god",
  },
  {
    title: "Reflecting on Your identity in Christ",
    description: "Because of who I am in Christ, I belong.",
    href: "/gf/your-new-identity-in-christ",
  },
  {
    title: "Reflecting on the Work of the Spirit",
    description: "Because of what the Spirit does, I walk.",
    href: "/gf/walking-in-the-spirit",
  },
  {
    title: "Experiencing God 24/7",
    description: "Practice His presence from first light to last thought.",
    href: "/gf/a-heart-after-god/a-heart-that-remains",
  },
  {
    title: "Prayer Starters",
    description: "Begin the conversation.",
    href: "/adv/prayer",
  },
  {
    title: "The Lord\u2019s Prayer Guide",
    description: "Pray as Jesus taught\u2014one topic at a time.",
    href: "/deeper/the-lords-prayer-guide",
  },
]
