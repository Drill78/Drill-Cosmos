// components/FloatingIconsField.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ICONS, IconConfig } from "./floatingIconsConfig";

type IconState = {
  x: number;   // 当前左上角位置 (px)
  y: number;
  vx: number;  // 速度 (px/s)
  vy: number;
};

const MIN_SPEED = 40; // 最小速度 (px/s)
const MAX_SPEED = 80; // 最大速度 (px/s)

// 生成一个随机速度向量
function randomVelocity() {
  const speed =
    MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED); // 40~80
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

// 初始化每个图标的位置和速度
function initIconStates(
  icons: IconConfig[],
  width: number,
  height: number
): IconState[] {
  return icons.map((icon) => {
    const maxX = Math.max(width - icon.width, 0);
    const maxY = Math.max(height - icon.height, 0);

    const x = ((icon.initialXPercent ?? 50) / 100) * maxX;
    const y = ((icon.initialYPercent ?? 50) / 100) * maxY;

    const { vx, vy } = randomVelocity();

    return { x, y, vx, vy };
  });
}

// 单个图标：移动 + 撞墙反弹
function updateIconState(
  state: IconState,
  icon: IconConfig,
  width: number,
  height: number,
  deltaSeconds: number
): IconState {
  let x = state.x + state.vx * deltaSeconds;
  let y = state.y + state.vy * deltaSeconds;
  let vx = state.vx;
  let vy = state.vy;

  // 左右边界
  if (x < 0) {
    x = 0;
    vx = Math.abs(vx);
  } else if (x + icon.width > width) {
    x = width - icon.width;
    vx = -Math.abs(vx);
  }

  // 上下边界
  if (y < 0) {
    y = 0;
    vy = Math.abs(vy);
  } else if (y + icon.height > height) {
    y = height - icon.height;
    vy = -Math.abs(vy);
  }

  return { x, y, vx, vy };
}

// 图标之间的简单碰撞处理：矩形重叠时交换速度
function handleIconCollisions(
  states: IconState[],
  icons: IconConfig[]
): IconState[] {
  const next = states.map((s) => ({ ...s }));

  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const a = next[i];
      const b = next[j];
      const iconA = icons[i];
      const iconB = icons[j];

      const overlapX =
        a.x < b.x + iconB.width && a.x + iconA.width > b.x;
      const overlapY =
        a.y < b.y + iconB.height && a.y + iconA.height > b.y;

      if (overlapX && overlapY) {
        // 简单粗暴：交换速度向量
        const tempVx = a.vx;
        const tempVy = a.vy;
        a.vx = b.vx;
        a.vy = b.vy;
        b.vx = tempVx;
        b.vy = tempVy;

        // 轻微分离一下，避免黏在一起
        const centerAx = a.x + iconA.width / 2;
        const centerAy = a.y + iconA.height / 2;
        const centerBx = b.x + iconB.width / 2;
        const centerBy = b.y + iconB.height / 2;

        const dx = centerBx - centerAx;
        const dy = centerBy - centerAy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const pushDistance = 4; // 往相反方向各推开一点点
        const nx = (dx / dist) || 1;
        const ny = (dy / dist) || 0;

        a.x -= nx * pushDistance;
        a.y -= ny * pushDistance;
        b.x += nx * pushDistance;
        b.y += ny * pushDistance;
      }
    }
  }

  return next;
}

export default function FloatingIconsField() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [iconStates, setIconStates] = useState<IconState[] | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // 初始化
  useEffect(() => {
    function initialize() {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      setIconStates((prev) => {
        if (prev && prev.length === ICONS.length) return prev;
        return initIconStates(ICONS, width, height);
      });
    }

    initialize();

    window.addEventListener("resize", initialize);
    return () => window.removeEventListener("resize", initialize);
  }, []);

  // 动画循环
  useEffect(() => {
    if (!iconStates) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const deltaSeconds = deltaMs / 1000;

      const el = containerRef.current;
      if (!el) {
        animationFrameId = requestAnimationFrame(step);
        return;
      }
      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      setIconStates((prev) => {
        if (!prev) return prev;

        // 先基于速度 & 边界更新位置
        const moved = prev.map((state, index) =>
          updateIconState(
            state,
            ICONS[index],
            width,
            height,
            deltaSeconds
          )
        );

        // 再处理图标之间的碰撞
        const withCollisions = handleIconCollisions(moved, ICONS);

        return withCollisions;
      });

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [iconStates]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundImage: 'url("/images/backgrounds/drill-cosmos.png")',
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
    >
      {/* 左上角标题 */}
      <div className="absolute bottom-4 right-4 text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.7)] z-10">
        <div className="text-xl md:text-2xl font-semibold text-glow-soft">Drill - Cosmos</div>
        <div className="retro-title retro-cursor">Personal Blog</div>
      </div>

      {/* 悬浮 & 弹跳的图标按钮 */}
      {iconStates &&
        ICONS.map((icon, index) => {
          const state = iconStates[index];
          return (
            <Link
              key={icon.id}
              href={icon.href}
              className="
                absolute block
                transition-transform duration-150 ease-out
                hover:scale-110 active:scale-95
              "
              style={{
                left: `${state.x}px`,
                top: `${state.y}px`,
                width: `${icon.width}px`,
                height: `${icon.height}px`,
              }}
            >
              <img
                src={icon.imageSrc}
                alt={icon.id}
                className="w-full h-full object-contain pointer-events-auto"
              />
            </Link>
          );
        })}
    </div>
  );
}
