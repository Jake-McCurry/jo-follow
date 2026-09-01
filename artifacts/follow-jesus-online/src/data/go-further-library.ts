export type GFReading = {
  slug: string;
  title: string;
  desc: string;
};

export type GFBook = {
  slug: string;
  title: string;
  subtitle: string;
  desc: string;
  intro: string[];
  readings: GFReading[];
  closing: string;
  buttonText: string;
};

export const GO_FURTHER_BOOKS: GFBook[] = [
  {
    slug: 'a-heart-after-god',
    title: 'A Heart After God',
    subtitle: 'Seven Reflections on the Inner Life',
    desc: 'Learn to want what God wants, in the hidden places no one else sees.',
    intro: [
      'God is not first after your schedule, your words, or the life other people can see. He is after your heart.',
      'That is good news. The heart is where you actually live—where you want, fear, hide, and hope. If Christ is welcome there, He will, in time, walk through every other room. If He is kept at the door, the rest of life can look ordered and still remain unchanged.',
      'These seven short readings are for that inner place. They are not a program for becoming impressive. They are a quiet look at what God sees, what a new heart means, and how His Spirit does the work you cannot do by trying harder.',
      'Read them in order if you can. Or open the one that is of particular interest to you today.',
    ],
    readings: [
      {
        slug: 'the-heart-reflects-the-person',
        title: '1. The Heart Reflects the Person',
        desc: 'A heart that is quiet before God reflects truth with increasing clarity. When it is stirred by unchecked thoughts and restless desires, the reflection becomes distorted.',
      },
      {
        slug: 'god-looks-at-the-heart',
        title: '2. God Looks at the Heart',
        desc: 'People judge by the street view. God examines the foundation. What looks impressive to others may still be unseen where it matters most.',
      },
      {
        slug: 'understanding-the-inner-life-of-the-heart',
        title: '3. Understanding the Inner Life of the Heart',
        desc: 'The heart is not one feeling. It is a control center whose hidden movements quietly direct the whole of life.',
      },
      {
        slug: 'the-need-for-a-new-heart',
        title: '4. The Need for a New Heart',
        desc: 'Better habits can improve the appearance of a life. They cannot give a new heart. God does not offer repair. He offers new birth.',
      },
      {
        slug: 'adoption-and-fellowship-the-journey-begins',
        title: '5. Adoption and Fellowship. The Journey Begins',
        desc: 'Adoption places you in the family forever. Fellowship is sitting at the table. One cannot be lost; the other can still be left empty.',
      },
      {
        slug: 'relationship-whole-heartedness-and-passion',
        title: '6. Relationship, Whole-heartedness, and Passion',
        desc: 'A heart after God is not produced by sudden emotion. It is formed by ordinary practices that slowly gather the whole self toward Him.',
      },
      {
        slug: 'the-holy-spirit-and-the-transformation-of-the-heart',
        title: '7. The Holy Spirit and the Transformation of the Heart',
        desc: 'You can set the sails with discipline and sincere effort. Only the Spirit supplies the wind that actually moves the heart.',
      }
    ],
    closing: 'He already knows the rooms you would rather keep closed. This is an invitation to let Him in—not as a guest for an hour, but as the One who lives at the center.',
    buttonText: 'Begin the first reading',
  },
  {
    slug: 'your-new-identity-in-christ',
    title: 'Your New Identity in Christ',
    subtitle: 'Embracing Who God Says You Are',
    desc: 'Settle the question of who you are now, so the old names lose their hold.',
    intro: [
      'Something real has begun—and it is deeper than a fresh start. In Christ, God has not merely forgiven what you have done. He has given you a new name.',
      'For years you may have answered to other names: failure, orphan, addict, the one who never measures up, the one who has to keep proving yourself. Those names feel true because they are familiar. They are not the last word. The last word belongs to the One who made you and now lives in you.',
      'These nine short readings are for that settling. They are not nine ways to feel better about yourself. They are a slow look at what God has already declared: child, saint, member, citizen. Believe it. Walk in it. Choose from it. Live it on an ordinary day.',
      'Read them in order if you can. Or open the one that names the old label you still hear.',
    ],
    readings: [
      {
        slug: 'embracing-your-new-identity-in-christ',
        title: '1. Embracing Your New Identity in Christ',
        desc: 'Who you really are is no longer decided by your past. It is declared by God.',
      },
      {
        slug: 'walking-in-your-new-identity',
        title: '2. Walking in Your New Identity',
        desc: 'A new identity is not only something to believe. It is something to live from, one step at a time.',
      },
      {
        slug: 'you-are-a-child-of-god',
        title: '3. You Are a Child of God',
        desc: 'You do not approach God as a stranger hoping to be noticed. You come as a son or daughter who already belongs.',
      },
      {
        slug: 'you-are-a-saint-with-a-new-nature',
        title: '4. You Are a Saint with a New Nature',
        desc: 'In Christ you are not a condemned sinner trying to become acceptable. You are a saint learning to live as who you already are.',
      },
      {
        slug: 'you-are-a-member-of-the-body-of-christ',
        title: '5. You Are a Member of the Body of Christ',
        desc: 'You were not saved to stand alone. You were placed in a living body where your life is needed.',
      },
      {
        slug: 'you-are-a-citizen-of-gods-kingdom',
        title: '6. You Are a Citizen of God’s Kingdom',
        desc: 'Your true citizenship is not of this world. You now belong to an unshakable kingdom and represent its King.',
      },
      {
        slug: 'choosing-wisely-with-your-new-identity',
        title: '7. Choosing Wisely with Your New Identity',
        desc: 'Every choice either agrees with who you are in Christ or returns to an old name God has already taken away.',
      },
      {
        slug: 'living-out-your-new-identity-daily',
        title: '8. Living Out Your New Identity Daily',
        desc: 'Identity becomes real not in a single moment of insight, but in the quiet practices of an ordinary day.',
      },
      {
        slug: 'living-supernaturally-in-your-new-identity',
        title: '9. Living Supernaturally in Your New Identity',
        desc: 'The new life God has given you is not merely improved. It is empowered by His Spirit for freedom, peace, and endurance.',
      }
    ],
    closing: 'The old names will still speak. They do not get to name you. God already has.',
    buttonText: 'Begin the first reading',
  },
  {
    slug: 'beholding-the-majesty-of-god',
    title: 'Beholding the Majesty of God',
    subtitle: 'Explore His Divine Attributes',
    desc: 'Lift your eyes from your own story long enough to see the God who holds it.',
    intro: [
      'The Christian life does not begin with what you must become. It begins with who God is.',
      'A small view of God produces a small and anxious life. You measure yourself, manage outcomes, and wonder if He is able, near, or even kind. A true view of God does the opposite. It settles the heart. The One who simply is does not depend on you. He is able. He does not change. His goodness moves toward the undeserving and does not let go.',
      'These six short readings are an invitation to look up. They are not a catalog of ideas about God. They are a quiet beholding of His being, His power, His integrity, and His goodness—so that ordinary days can be lived in the light of who He actually is.',
      'Read them in order if you can. Or open the one that names the question you carry about Him today.',
    ],
    readings: [
      {
        slug: 'the-supreme-pursuit-of-the-heart',
        title: '1. The Supreme Pursuit of the Heart',
        desc: 'The heart was made for more than lesser loves. Its highest joy is to behold the God who made it.',
      },
      {
        slug: 'attributes-of-being',
        title: '2. Attributes of Being',
        desc: 'God does not depend on anything He has made. He is the One who simply is—and all life flows from Him.',
      },
      {
        slug: 'attributes-of-ability',
        title: '3. Attributes of Ability',
        desc: 'Nothing you face is beyond His power or hidden from His sight. The God who is able is also near—and He does not change.',
      },
      {
        slug: 'attributes-of-integrity',
        title: '4. Attributes of Integrity',
        desc: 'God’s character has no fracture and no shadow. The purity that humbles the heart is the same integrity that draws it near.',
      },
      {
        slug: 'attributes-of-goodness',
        title: '5. Attributes of Goodness',
        desc: 'The heart of God is not only holy. It is goodness that moves toward the undeserving and does not let go.',
      },
      {
        slug: 'live-in-the-light-of-his-majesty',
        title: '6. Live in the Light of His Majesty',
        desc: 'To know what God is like is not the end of the journey. It is the light by which the rest of life is meant to be lived.',
      }
    ],
    closing: 'You do not have to make God larger. You only have to look. He is already who He has always been.',
    buttonText: 'Begin the first reading',
  },
  {
    slug: 'walking-in-the-spirit',
    title: 'Walking in the Spirit',
    subtitle: 'A Practical Guide to the Holy Spirit\'s Presence, Power, and Fruit in the Believer\'s Life',
    desc: 'Discover how the Spirit who lives in you shapes ordinary decisions, not only high moments.',
    intro: [
      'You were never meant to live this new life by enthusiasm alone.',
      'The Spirit of Jesus now lives in you. He is not a feeling you must chase, a force you must tap, or a reward for the spiritually advanced. He is God with you—teaching, guiding, convicting, comforting, and giving power for ordinary hours. The Christian life is not you trying harder for Christ. It is Christ living in you through His Spirit.',
      'These nine short readings are a practical walk into that companionship. They will help you know who the Spirit is, how a surrendered heart is filled, what He has already secured in you, and how His fruit grows over time—not in a rare crisis, but in daily step with the One who already dwells within.',
      'Read them in order if you can. Or open the one that names the place you feel weakest today.',
    ],
    readings: [
      {
        slug: 'who-is-the-holy-spirit',
        title: '1. Who Is the Holy Spirit?',
        desc: 'The Holy Spirit is not an impersonal force. He is the living presence of God given to walk with you.',
      },
      {
        slug: 'the-exchanged-life',
        title: '2. The Exchanged Life',
        desc: 'The Christian life is not you trying harder for Christ. It is Christ living in you through His Spirit.',
      },
      {
        slug: 'surrender-the-pathway-to-spirit-filled-living',
        title: '3. Surrender: The Pathway to Spirit-Filled Living',
        desc: 'The Spirit does not fill a heart that is still determined to remain in control.',
      },
      {
        slug: 'how-to-be-filled-and-empowered-by-the-holy-spirit',
        title: '4. How to Be Filled and Empowered by the Holy Spirit',
        desc: 'Being filled with the Spirit is not a rare crisis. It is a daily yielding to His direction and power.',
      },
      {
        slug: 'firmly-established',
        title: '5. Firmly Established',
        desc: 'What the Spirit has already done in you—indwelling, sealing, adopting—cannot be undone by a weak day.',
      },
      {
        slug: 'empowered-for-supernatural-living',
        title: '6. Empowered for Supernatural Living',
        desc: 'The Spirit does not merely visit on occasion. He teaches, guides, convicts, comforts, and sends you in ordinary hours.',
      },
      {
        slug: 'the-spirits-work-of-fruitfulness',
        title: '7. The Spirit’s Work of Fruitfulness',
        desc: 'Christlike character is not manufactured by effort. It is grown as the Spirit reproduces the life of Jesus in you.',
      },
      {
        slug: 'the-fruit-of-the-spirit',
        title: '8. The Fruit of the Spirit',
        desc: 'The surest evidence of a changed life is not a spiritual moment. It is the fruit that begins to appear over time.',
      },
      {
        slug: 'walking-in-the-spirit-reading',
        title: '9. Walking in the Spirit',
        desc: 'Walking with God is not a technique. It is learning to live in step with the Spirit who already dwells within you.',
      }
    ],
    closing: 'You do not have to produce the wind. You only have to set the sail. He is already in you.',
    buttonText: 'Begin the first reading',
  },
  {
    slug: 'building-blocks-for-maturity',
    title: 'Building Blocks for Maturity',
    subtitle: 'Grow up in Christ one practiced step at a time',
    desc: 'Grow up in Christ one practiced step at a time—not by trying harder, but by walking with Him.',
    intro: [
      'New life in Christ is a gift. Growing up in that life is a walk.',
      'You do not become mature by collecting more information, adding more activity, or trying harder to be impressive. You grow as you practice seeing as God sees, staying near Him, living from your new name, walking by the Spirit, hearing His Word, obeying what you know, belonging to His family, giving the gospel away, standing against the enemy, and taking your place in His purpose.',
      'These ten short readings are building blocks, not a ladder you must finish before God loves you. He is already with you. Choose one and take the next step.',
      'Read them in order if you can. Or open the one that names the place you most need to grow today.',
    ],
    readings: [
      {
        slug: 'seeing-life-from-gods-perspective',
        title: '1. Seeing Life from God’s Perspective',
        desc: 'Circumstances look different when you read them through God’s character, not through fear or the world’s scoreboard.',
      },
      {
        slug: 'growing-closer-to-god',
        title: '2. Growing Closer to God',
        desc: 'Maturity is not more activity for God. It is a living, affectionate walk with the Lord Himself.',
      },
      {
        slug: 'becoming-the-new-you',
        title: '3. Becoming the New You',
        desc: 'You do not have to keep wearing the old self. In Christ you are already new—and you can learn to live as if that is true.',
      },
      {
        slug: 'walking-by-the-spirit-reading',
        title: '4. Walking by the Spirit',
        desc: 'A grown-up life in Christ is not self-effort dressed in religious language. It is daily reliance on the Spirit who lives in you.',
      },
      {
        slug: 'receiving-insights-from-god',
        title: '5. Receiving Insights from God',
        desc: 'God still speaks. Scripture and a renewed mind become the path by which He directs your next faithful step.',
      },
      {
        slug: 'obeying-god-faithfully',
        title: '6. Obeying God Faithfully',
        desc: 'Knowing the truth is not the same as walking in it. Obedience is how love for Christ takes on a body.',
      },
      {
        slug: 'living-as-gods-family',
        title: '7. Living as God’s Family',
        desc: 'Faith grows cold in isolation. God places you in a family so you can be strengthened, needed, and kept near the fire.',
      },
      {
        slug: 'reaching-the-world',
        title: '8. Reaching the World',
        desc: 'The life Christ has given you is not only for you. He intends it to move outward—in witness, mercy, and making disciples.',
      },
      {
        slug: 'resisting-the-enemy',
        title: '9. Resisting the Enemy',
        desc: 'You have an enemy who accuses and distracts. You also have armor, truth, and a Lord who has already won.',
      },
      {
        slug: 'pursuing-gods-master-plan',
        title: '10. Pursuing God’s Master Plan',
        desc: 'Your life is not an accident to manage. Christ intends to use your ordinary days—and your gifts—for something that lasts.',
      }
    ],
    closing: 'He is already with you. Choose one and take the next step.',
    buttonText: 'Begin the first reading',
  }
];

export function getGFBook(slug: string): GFBook | undefined {
  return GO_FURTHER_BOOKS.find(b => b.slug === slug);
}
