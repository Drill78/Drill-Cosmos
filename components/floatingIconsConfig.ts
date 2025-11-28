// components/floatingIconsConfig.ts

export type IconConfig = {
    id: string;
    imageSrc: string;
    href: string;
    width: number;            // px
    height: number;           // px
    initialXPercent: number;  // 初始位置（相对容器宽度）
    initialYPercent: number;  // 初始位置（相对容器高度）
  };
  
  export const ICONS: IconConfig[] = [
    {
      id: "home-blog",
      imageSrc: "/images/icons/air ship.png",
      href: "/blog",          // 杂谈文章
      width: 128,
      height: 128,
      initialXPercent: 30,
      initialYPercent: 40,
    },
    {
      id: "home-photos",
      imageSrc: "/images/icons/qiu.png",
      href: "/photos",        // 摄影作品
      width: 128,
      height: 128,
      initialXPercent: 65,
      initialYPercent: 35,
    },
    {
      id: "home-music",
      imageSrc: "/images/icons/qiu.png",
      href: "/music",         // 音乐精选集
      width: 128,
      height: 128,
      initialXPercent: 20,
      initialYPercent: 65,
    },
    {
      id: "home-notes",
      imageSrc: "/images/icons/qiu.png",
      href: "/notes",         // 学习笔记 / 点子
      width: 128,
      height: 128,
      initialXPercent: 55,
      initialYPercent: 70,
    },
    {
      id: "home-reviews",
      imageSrc: "/images/icons/qiu.png",
      href: "/reviews",       // 影视 / 游戏锐评
      width: 128,
      height: 128,
      initialXPercent: 80,
      initialYPercent: 55,
    },
    {
      id: "home-skills",
      imageSrc: "/images/icons/qiu.png",
      href: "/skills",        // 2000 技能树
      width: 128,
      height: 128,
      initialXPercent: 45,
      initialYPercent: 20,
    },
    {
      id: "home-food",
      imageSrc: "/images/icons/qiu.png",
      href: "/food",          // 餐车 / 家庭餐厅
      width: 128,
      height: 128,
      initialXPercent: 10,
      initialYPercent: 35,
    },
    {
      id: "home-stash",
      imageSrc: "/images/icons/qiu.png",
      href: "/stash",         // 吊图合集 / memes
      width: 128,
      height: 128,
      initialXPercent: 88,
      initialYPercent: 25,
    },
  ];
  