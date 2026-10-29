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
  { label: "Prayer", href: "/prayer" },
  { label: "Books", href: "/gf/" },
  { label: "Holy Spirit", href: "/gf/walking-in-the-spirit" },
  { label: "Videos", href: "/rewatch" },
  { label: "Promises", href: "/promises" },
  { label: "Knowing God", href: "/knowing-god" },
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
    href: "/knowing-god",
  },
  {
    title: "God\u2019s Promises for Hope",
    description: "When feelings fail, His promises still stand.",
    href: "/promises",
  },
  {
    title: "God\u2019s Majesty",
    description: "Because of who God is, I worship.",
    href: "/because/gods-majesty",
  },
  {
    title: "Your Identity in Christ",
    description: "Because of who I am in Christ, I belong.",
    href: "/because/your-identity-in-christ",
  },
  {
    title: "The Work of the Holy Spirit",
    description: "Because of what the Spirit does, I walk.",
    href: "/because/the-work-of-the-holy-spirit",
  },
  {
    title: "Experiencing God 24/7",
    description: "Practice His presence from first light to last thought.",
    href: "/experiencing-god",
  },
  {
    title: "Prayer Starters",
    description: "Begin the conversation.",
    href: "/prayer",
  },
  {
    title: "The Lord\u2019s Prayer Guide",
    description: "Pray as Jesus taught\u2014one topic at a time.",
    href: "/lords-prayer",
  },
]
