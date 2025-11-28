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
      id: "planet-a",
      imageSrc: "/images/icons/air ship.png",
      href: "/planet-a",
      width: 128,  // ⬅ 从 64 → 128
      height: 128,
      initialXPercent: 50,
      initialYPercent: 50,
    },
    {
      id: "blog-planet",
      imageSrc: "/images/icons/qiu.png", // 先复用图标
      href: "/planet-a",
      width: 128,
      height: 128,
      initialXPercent: 25,
      initialYPercent: 35,
    },
    {
      id: "photo-planet",
      imageSrc: "/images/icons/qiu.png",
      href: "/planet-a",
      width: 128,
      height: 128,
      initialXPercent: 70,
      initialYPercent: 65,
    },
  ];
  