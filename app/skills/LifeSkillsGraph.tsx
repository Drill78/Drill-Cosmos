// app/skills/LifeSkillsGraph.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import type { Skill } from "@/lib/skills";

export type SkillTheme =
  | "life"
  | "art"
  | "mind"
  | "tech"
  | "adventure"
  | "game"
  | "meta";

interface LifeSkillsGraphProps {
  skills: Skill[];
  theme: SkillTheme;
  title: string;
}

type NodeType = "category" | "skill";

interface Node {
  id: string;
  name: string;
  type: NodeType;
  x: number; // 0–100 百分比坐标
  y: number;
  level?: Skill["level"];
}

interface Edge {
  id: string;
  fromId: string;
  toId: string;
}

type SimNode = d3.SimulationNodeDatum & {
  id: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
};

type SimLink = d3.SimulationLinkDatum<SimNode> & {
  id: string;
  fromId: string;
  toId: string;
};

const THEME_STYLES: Record<
  SkillTheme,
  {
    edgeStroke: string;
    categoryBorder: string;
    categoryBg: string;
    categoryShadow: string;
    levelBorderSoft: string;
    levelBorderMid: string;
    levelBorderStrong: string;
  }
> = {
  life: {
    edgeStroke: "rgba(52,211,153,0.55)",
    categoryBorder: "border-emerald-300",
    categoryBg: "bg-emerald-900/90",
    categoryShadow: "shadow-[0_0_36px_rgba(52,211,153,0.9)]",
    levelBorderSoft: "border-emerald-500/60",
    levelBorderMid: "border-emerald-400/80",
    levelBorderStrong: "border-emerald-300/95",
  },
  art: {
    edgeStroke: "rgba(244,114,182,0.55)",
    categoryBorder: "border-pink-300",
    categoryBg: "bg-pink-900/80",
    categoryShadow: "shadow-[0_0_36px_rgba(244,114,182,0.9)]",
    levelBorderSoft: "border-pink-400/60",
    levelBorderMid: "border-pink-300/80",
    levelBorderStrong: "border-pink-200/95",
  },
  mind: {
    edgeStroke: "rgba(168,85,247,0.55)",
    categoryBorder: "border-purple-300",
    categoryBg: "bg-purple-900/80",
    categoryShadow: "shadow-[0_0_36px_rgba(168,85,247,0.9)]",
    levelBorderSoft: "border-purple-400/60",
    levelBorderMid: "border-purple-300/80",
    levelBorderStrong: "border-purple-200/95",
  },
  tech: {
    edgeStroke: "rgba(59,130,246,0.55)",
    categoryBorder: "border-sky-300",
    categoryBg: "bg-sky-900/80",
    categoryShadow: "shadow-[0_0_36px_rgba(59,130,246,0.9)]",
    levelBorderSoft: "border-sky-400/60",
    levelBorderMid: "border-sky-300/80",
    levelBorderStrong: "border-sky-200/95",
  },
  adventure: {
    edgeStroke: "rgba(234,179,8,0.6)",
    categoryBorder: "border-amber-300",
    categoryBg: "bg-amber-900/80",
    categoryShadow: "shadow-[0_0_36px_rgba(234,179,8,0.9)]",
    levelBorderSoft: "border-amber-400/60",
    levelBorderMid: "border-amber-300/80",
    levelBorderStrong: "border-amber-200/95",
  },
  game: {
    edgeStroke: "rgba(248,113,113,0.6)",
    categoryBorder: "border-red-300",
    categoryBg: "bg-red-900/80",
    categoryShadow: "shadow-[0_0_36px_rgba(248,113,113,0.9)]",
    levelBorderSoft: "border-red-400/60",
    levelBorderMid: "border-red-300/80",
    levelBorderStrong: "border-red-200/95",
  },
  meta: {
    edgeStroke: "rgba(148,163,184,0.6)",
    categoryBorder: "border-slate-300",
    categoryBg: "bg-slate-900/80",
    categoryShadow: "shadow-[0_0_36px_rgba(148,163,184,0.9)]",
    levelBorderSoft: "border-slate-400/60",
    levelBorderMid: "border-slate-300/80",
    levelBorderStrong: "border-slate-200/95",
  },
};

function clampPct(v: number) {
  return Math.max(5, Math.min(95, v));
}

// 节点尺寸：根据类型 + 子节点数 + 文本长度做一点自适应
function getNodeSizeRem(node: Node & { childCount?: number }): number {
  const nameLength = node.name ? node.name.length : 0;
  const textExtra = Math.min(2, Math.max(0, (nameLength - 4) * 0.16));

  if (node.type === "category") {
    const base = 5.4;
    const extra = node.childCount
      ? Math.min(2, 0.35 * Math.sqrt(node.childCount))
      : 0;
    return base + extra + textExtra * 0.9;
  }

  // skill 节点
  const base = 2.8;
  const extra = node.childCount
    ? Math.min(1.4, 0.35 * Math.sqrt(node.childCount))
    : 0;
  return base + extra + textExtra;
}

function getLevelClasses(
  level: Skill["level"] | undefined,
  theme: SkillTheme
): string {
  const styles = THEME_STYLES[theme];

  if (!level || level === "正在学习") {
    return "border-slate-500/60 bg-slate-950/80";
  }
  if (level.includes("初窥")) {
    return `${styles.levelBorderSoft} bg-slate-950/80`;
  }
  if (level.includes("轻车") || level.includes("略有")) {
    return `${styles.levelBorderMid} bg-slate-950/80`;
  }
  if (level.includes("炉火") || level.includes("登峰")) {
    return `${styles.levelBorderStrong} bg-slate-900/85`;
  }
  return `${styles.levelBorderSoft} bg-slate-950/80`;
}

export function LifeSkillsGraph({ skills, theme, title }: LifeSkillsGraphProps) {
  const styles = THEME_STYLES[theme];

  // 1. 用 parentName 递归构建整棵树：中心大球 + 多级父子关系
  const { baseNodes, edges, childrenMap } = useMemo(() => {
    if (!skills.length) {
      return {
        baseNodes: [] as (Node & { childCount?: number })[],
        edges: [] as Edge[],
        childrenMap: {} as Record<string, string[]>,
      };
    }

    const allNodes: (Node & { childCount?: number })[] = [];
    const allEdges: Edge[] = [];
    const childrenMap: Record<string, string[]> = {};

    const centerX = 50;
    const centerY = 50;

    const categoryNode: Node & { childCount?: number } = {
      id: `category-${theme}`,
      name: title,
      type: "category",
      x: centerX,
      y: centerY,
      childCount: 0,
    };
    allNodes.push(categoryNode);

    const skillByName: Record<string, Skill> = {};
    for (const s of skills) {
      skillByName[s.name] = s;
    }

    const childrenByParentName: Record<string, Skill[]> = {};
    for (const skill of skills) {
      if (!skill.parentName) continue;
      if (!childrenByParentName[skill.parentName]) {
        childrenByParentName[skill.parentName] = [];
      }
      childrenByParentName[skill.parentName].push(skill);
    }

    const roots: Skill[] = skills.filter(
      (s) => !s.parentName || !skillByName[s.parentName]
    );

    const nodeById: Record<string, Node & { childCount?: number }> = {
      [categoryNode.id]: categoryNode,
    };
    const nodeBySkillName: Record<string, Node & { childCount?: number }> = {};

    let edgeCounter = 0;

    const rootCount = Math.max(roots.length, 1);
    const rootRadius = 24;

    roots.forEach((skill, index) => {
      const angle = (2 * Math.PI * index) / rootCount;
      const x = centerX + rootRadius * Math.cos(angle);
      const y = centerY + rootRadius * Math.sin(angle);

      const node: Node & { childCount?: number } = {
        id: skill.id,
        name: skill.name,
        type: "skill",
        x,
        y,
        level: skill.level,
        childCount: 0,
      };

      allNodes.push(node);
      nodeById[node.id] = node;
      nodeBySkillName[skill.name] = node;

      const edge: Edge = {
        id: `edge-${edgeCounter++}`,
        fromId: categoryNode.id,
        toId: node.id,
      };
      allEdges.push(edge);

      categoryNode.childCount = (categoryNode.childCount ?? 0) + 1;
      if (!childrenMap[categoryNode.id]) childrenMap[categoryNode.id] = [];
      childrenMap[categoryNode.id].push(node.id);
    });

    const placeChildren = (
      parentNode: Node & { childCount?: number },
      parentSkillName: string,
      depth: number
    ) => {
      const group = childrenByParentName[parentSkillName];
      if (!group || !group.length) return;

      const n = group.length;
      const orbitBase = 10;
      const orbitRadius =
        orbitBase + depth * 5 + Math.min(8, Math.sqrt(n) * 2.2);

      const step = (2 * Math.PI) / n;
      const startAngle = -Math.PI / 2;

      for (let idx = 0; idx < n; idx++) {
        const skill = group[idx];

        if (nodeById[skill.id]) {
          const existing = nodeById[skill.id];
          const edge: Edge = {
            id: `edge-${edgeCounter++}`,
            fromId: parentNode.id,
            toId: existing.id,
          };
          allEdges.push(edge);

          if (!childrenMap[parentNode.id]) childrenMap[parentNode.id] = [];
          childrenMap[parentNode.id].push(existing.id);

          parentNode.childCount = (parentNode.childCount ?? 0) + 1;
          placeChildren(existing, skill.name, depth + 1);
          continue;
        }

        const angle = startAngle + step * idx;
        let x = parentNode.x + orbitRadius * Math.cos(angle);
        let y = parentNode.y + orbitRadius * Math.sin(angle);

        x = Math.max(8, Math.min(92, x));
        y = Math.max(8, Math.min(92, y));

        const node: Node & { childCount?: number } = {
          id: skill.id,
          name: skill.name,
          type: "skill",
          x,
          y,
          level: skill.level,
          childCount: 0,
        };

        allNodes.push(node);
        nodeById[node.id] = node;
        nodeBySkillName[skill.name] = node;

        const edge: Edge = {
          id: `edge-${edgeCounter++}`,
          fromId: parentNode.id,
          toId: node.id,
        };
        allEdges.push(edge);

        if (!childrenMap[parentNode.id]) childrenMap[parentNode.id] = [];
        childrenMap[parentNode.id].push(node.id);

        parentNode.childCount = (parentNode.childCount ?? 0) + 1;

        placeChildren(node, skill.name, depth + 1);
      }
    };

    roots.forEach((rootSkill) => {
      const parentNode = nodeBySkillName[rootSkill.name];
      if (parentNode) {
        placeChildren(parentNode, rootSkill.name, 1);
      }
    });

    return { baseNodes: allNodes, edges: allEdges, childrenMap };
  }, [skills, theme, title]);

  // 2. 当前可见节点坐标（基础布局 + 拖拽 / d3 浮动之后）
  const [nodes, setNodes] = useState<(Node & { childCount?: number })[]>(baseNodes);

  useEffect(() => {
    setNodes(baseNodes);
  }, [baseNodes]);

  const getSubtreeIds = (rootId: string): Set<string> => {
    const result = new Set<string>();
    const stack = [rootId];
    while (stack.length) {
      const id = stack.pop()!;
      if (result.has(id)) continue;
      result.add(id);
      const children = childrenMap[id];
      if (children) {
        for (const childId of children) stack.push(childId);
      }
    }
    return result;
  };

  // 3. d3 子树仿真：拖拽时只对「这一颗子树」做轻微弹性
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[] | null>(null);

  const startSubtreeSimulation = (rootId: string) => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
      simNodesRef.current = null;
    }

    const subtreeIds = getSubtreeIds(rootId);
    if (!subtreeIds.size) return;

    const simNodes: SimNode[] = nodes
      .filter((n) => subtreeIds.has(n.id))
      .map((n) => ({
        id: n.id,
        x: n.x,
        y: n.y,
      }));

    const simLinks: SimLink[] = edges
      .filter((e) => subtreeIds.has(e.fromId) && subtreeIds.has(e.toId))
      .map((e) => ({
        ...e,
        source: e.fromId,
        target: e.toId,
      }));

    simNodesRef.current = simNodes;

    const sim = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(8)
          .strength(0.4)
      )
      .force("charge", d3.forceManyBody<SimNode>().strength(-10))
      .alpha(0.9)
      .alphaDecay(0.1);

    sim.on("tick", () => {
      const sn = simNodesRef.current;
      if (!sn) return;
      setNodes((prev) => {
        const map = new Map(prev.map((n) => [n.id, { ...n }]));
        for (const s of sn) {
          if (s.x == null || s.y == null) continue;
          const n = map.get(s.id);
          if (!n) continue;
          n.x = clampPct(s.x);
          n.y = clampPct(s.y);
        }
        return Array.from(map.values());
      });
    });

    simulationRef.current = sim;
  };

  const stopSubtreeSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    simulationRef.current = null;
    simNodesRef.current = null;
  };

  const handleNodePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string
  ) => {
    e.preventDefault(); // 不要蓝色选中文字
    e.stopPropagation();
    draggingIdRef.current = nodeId;
    startSubtreeSimulation(nodeId);
  };

  const handleWrapperPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const draggingId = draggingIdRef.current;
    if (!draggingId) return;

    const wrapper = wrapperRef.current;
    const sim = simulationRef.current;
    const simNodes = simNodesRef.current;
    if (!wrapper || !sim || !simNodes) return;

    const rect = wrapper.getBoundingClientRect();
    const xPct = clampPct(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = clampPct(((e.clientY - rect.top) / rect.height) * 100);

    const rootSimNode = simNodes.find((n) => n.id === draggingId);
    if (!rootSimNode) return;

    rootSimNode.fx = xPct;
    rootSimNode.fy = yPct;

    sim.alphaTarget(0.7).restart();
  };

  const handleWrapperPointerUp = () => {
    if (!draggingIdRef.current) return;
    draggingIdRef.current = null;
    stopSubtreeSimulation();
  };

  if (!skills.length) {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-xs text-slate-500">
        这个大类暂时还没有技能。
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-3xl select-none"
      onPointerMove={handleWrapperPointerMove}
      onPointerUp={handleWrapperPointerUp}
      onPointerLeave={handleWrapperPointerUp}
      style={{
        touchAction: "none",
        cursor: draggingIdRef.current ? "grabbing" : "grab",
      }}
    >
      {/* 背景：只画线，完全透明 */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none" // 关键：让线和节点共用同一套 0-100% 坐标
      >
        {edges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.fromId);
          const to = nodes.find((n) => n.id === edge.toId);
          if (!from || !to) return null;
          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={styles.edgeStroke}
              strokeWidth={0.45}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* 节点 */}
      {nodes.map((node) => {
        const sizeRem = getNodeSizeRem(node);
        const baseClasses =
          "absolute flex items-center justify-center rounded-full border text-[10px] text-emerald-50/95 backdrop-blur-sm select-none transition-transform duration-150";

        const typeClasses =
          node.type === "category"
            ? `${styles.categoryBorder} ${styles.categoryBg} ${styles.categoryShadow} font-mono text-[11px] tracking-[0.18em] uppercase`
            : `${getLevelClasses(node.level, theme)} shadow-[0_0_22px_rgba(15,23,42,0.9)] hover:scale-[1.03] active:scale-[0.98]`;

        return (
          <div
            key={node.id}
            className={`${baseClasses} ${typeClasses}`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${sizeRem}rem`,
              height: `${sizeRem}rem`,
              transform: "translate(-50%, -50%)",
            }}
            onPointerDown={(e) => handleNodePointerDown(e, node.id)}
          >
            <span className="px-2 text-center leading-snug whitespace-normal break-words">
              {node.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
