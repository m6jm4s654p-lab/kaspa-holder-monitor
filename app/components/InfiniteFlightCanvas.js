"use client";

import { useEffect, useMemo, useRef } from "react";


const CYCLE_SECONDS = 53;
const REGION_LENGTH = 140;
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => {
  const x = clamp01(value);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) });
const add3 = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub3 = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot3 = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross3 = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const normalize3 = (value) => {
  const length = Math.hypot(value.x, value.y, value.z) || 1;
  return { x: value.x / length, y: value.y / length, z: value.z / length };
};

function hashUnit(value, salt = 0) {
  let hash = 2166136261 ^ salt;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1_000_003) / 1_000_003;
}

function hermite(a, b, tangentA, tangentB, duration, progress) {
  const t = clamp01(progress), t2 = t * t, t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return {
    x: h00 * a.x + h10 * duration * tangentA.x + h01 * b.x + h11 * duration * tangentB.x,
    y: h00 * a.y + h10 * duration * tangentA.y + h01 * b.y + h11 * duration * tangentB.y,
    z: h00 * a.z + h10 * duration * tangentA.z + h01 * b.z + h11 * duration * tangentB.z,
  };
}

const pathTimes = [0, 26, 33, 38, 46, 53];
const pathPoints = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 72 },
  { x: -18, y: 34, z: 58 },
  { x: 12, y: 38, z: 66 },
  { x: 22, y: 16, z: 96 },
  { x: 0, y: 0, z: 140 },
];
const pathTangents = [
  { x: 0, y: 0, z: 2.77 },
  { x: 0, y: 0, z: 2.77 },
  { x: 3.2, y: .15, z: 1.1 },
  { x: 3.1, y: -1.9, z: 2.2 },
  { x: -1.1, y: -2.1, z: 4.2 },
  { x: 0, y: 0, z: 2.77 },
];

function cameraPosition(seconds) {
  let segment = 0;
  while (segment < pathTimes.length - 2 && seconds >= pathTimes[segment + 1]) segment += 1;
  const start = pathTimes[segment], end = pathTimes[segment + 1];
  return hermite(pathPoints[segment], pathPoints[segment + 1], pathTangents[segment], pathTangents[segment + 1], end - start, (seconds - start) / (end - start));
}

function flightPhase(seconds) {
  if (seconds < 26) return { name: "CRUISE", progress: seconds / 26 };
  if (seconds < 33) return { name: "PULL BACK", progress: (seconds - 26) / 7 };
  if (seconds < 38) return { name: "OVERVIEW", progress: (seconds - 33) / 5 };
  if (seconds < 46) return { name: "SPLINE TURN", progress: (seconds - 38) / 8 };
  return { name: "RE-ENTRY", progress: (seconds - 46) / 7 };
}

function focalScale(seconds) {
  if (seconds < 26) return 1.36;
  if (seconds < 33) return lerp(1.36, .58, smooth((seconds - 26) / 7));
  if (seconds < 38) return .58;
  if (seconds < 46) return lerp(.58, .72, smooth((seconds - 38) / 8));
  return lerp(.72, 1.36, smooth((seconds - 46) / 7));
}

function makeTemplates(blocks) {
  const lanes = [
    { x: -64, y: -24 }, { x: -38, y: 22 }, { x: -12, y: -10 },
    { x: 16, y: 14 }, { x: 42, y: -22 }, { x: 66, y: 24 },
  ];
  const rowCount = Math.max(1, Math.ceil(blocks.length / lanes.length));
  return blocks.map((block, index) => {
    const cluster = index % lanes.length;
    const row = Math.floor(index / lanes.length);
    const lane = lanes[cluster];
    const spreadAngle = hashUnit(block.hash, 11) * Math.PI * 2;
    const spread = 2 + hashUnit(block.hash, 17) * 7;
    return {
      block,
      index,
      cluster,
      x: lane.x + Math.cos(spreadAngle) * spread,
      y: lane.y + Math.sin(spreadAngle) * spread * .55,
      localZ: 16 + (row / Math.max(1, rowCount - 1)) * 102 + (hashUnit(block.hash, 23) - .5) * 4,
    };
  });
}

function blockLevel(block) {
  return block.maxTransferKas >= 1_000_000 ? "mega"
    : block.maxTransferKas >= 100_000 ? "large"
      : block.maxTransferKas >= 10_000 ? "medium"
        : block.maxTransferKas >= 1_000 ? "small"
          : "normal";
}

export default function InfiniteFlightCanvas({ blocks, selected, paused, onSelect }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const lastFrameRef = useRef(0);
  const flightStartRef = useRef(null);
  const pauseStartedAtRef = useRef(null);
  const totalPausedMsRef = useRef(0);
  const canvasSizeRef = useRef({ cssWidth: 0, cssHeight: 0, dpr: 0 });
  const positionsRef = useRef(new Map());
  const frontierFollowRef = useRef(null);
  const beaconRef = useRef({ hash: "", startedAt: 0 });
  const orderedBlocks = useMemo(() => [...blocks].sort((a, b) => a.daaScore - b.daaScore || a.timestamp - b.timestamp), [blocks]);
  const templates = useMemo(() => makeTemplates(orderedBlocks), [orderedBlocks]);
  const beaconHash = useMemo(() => orderedBlocks.find((block) => blockLevel(block) === "mega")?.hash ?? "", [orderedBlocks]);

  useEffect(() => {
    if (beaconHash && beaconHash !== beaconRef.current.hash) beaconRef.current = { hash: beaconHash, startedAt: performance.now() };
    if (!beaconHash) beaconRef.current = { hash: "", startedAt: 0 };
  }, [beaconHash]);

  useEffect(() => {
    const now = performance.now();
    if (paused) {
      if (pauseStartedAtRef.current == null) pauseStartedAtRef.current = now;
      return;
    }
    if (pauseStartedAtRef.current != null) {
      totalPausedMsRef.current += now - pauseStartedAtRef.current;
      pauseStartedAtRef.current = null;
    }
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const draw = (time) => {
      const rect = canvas.getBoundingClientRect();
      const mobile = rect.width < 640;
      const frameInterval = mobile ? 1000 / 30 : 1000 / 45;
      if (!paused && lastFrameRef.current && time - lastFrameRef.current < frameInterval) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameRef.current = time;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.4);
      const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
      const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
      const previousSize = canvasSizeRef.current;
      const firstSize = previousSize.cssWidth === 0 || previousSize.cssHeight === 0;
      const meaningfulResize = firstSize
        || Math.abs(rect.width - previousSize.cssWidth) >= 8
        || Math.abs(rect.height - previousSize.cssHeight) >= 8
        || Math.abs(dpr - previousSize.dpr) >= .1;
      if (meaningfulResize) {
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
        }
        canvasSizeRef.current = { cssWidth: rect.width, cssHeight: rect.height, dpr };
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (flightStartRef.current == null) flightStartRef.current = time;
      const activePauseMs = pauseStartedAtRef.current == null ? 0 : Math.max(0, time - pauseStartedAtRef.current);
      const elapsed = Math.max(0, (time - flightStartRef.current - totalPausedMsRef.current - activePauseMs) / 1000);
      const cycle = Math.floor(elapsed / CYCLE_SECONDS);
      const seconds = elapsed % CYCLE_SECONDS;
      const phase = flightPhase(seconds);
      const regionBase = cycle * REGION_LENGTH;
      const growthWave = seconds < 26 ? smooth(seconds / 26) : 1;
      let camera = add3(cameraPosition(seconds), { x: 0, y: 0, z: regionBase });
      let target;
      if (seconds < 26) {
        target = add3(camera, { x: 0, y: 0, z: 58 });
      } else if (seconds < 33) {
        const u = smooth((seconds - 26) / 7);
        target = lerp3(add3(camera, { x: 0, y: 0, z: 58 }), { x: 0, y: 0, z: regionBase + 78 }, u);
      } else if (seconds < 38) {
        target = { x: 0, y: 1.5, z: regionBase + 78 };
      } else if (seconds < 46) {
        target = lerp3({ x: 0, y: 1.5, z: regionBase + 78 }, { x: 0, y: 0, z: regionBase + 140 }, smooth((seconds - 38) / 8));
      } else {
        target = lerp3({ x: 0, y: 0, z: regionBase + 140 }, add3(camera, { x: 0, y: 0, z: 58 }), smooth((seconds - 46) / 7));
      }

      const growthLimit = 16 + growthWave * 102;
      const frontierTemplate = templates.reduce((frontier, node) => {
        if (node.localZ > growthLimit) return frontier;
        return !frontier || node.localZ > frontier.localZ ? node : frontier;
      }, null);
      let frontierWorld = null;
      if (frontierTemplate) {
        frontierWorld = { x: frontierTemplate.x, y: frontierTemplate.y, z: regionBase + frontierTemplate.localZ };
        const growingTemplate = templates.reduce((frontier, node) => {
          const nodeBirth = clamp01((node.localZ - 16) / 102);
          const birth = smooth((growthWave - nodeBirth + .075) / .075);
          if (birth <= .01 || birth >= .995 || node.block.parents.length === 0) return frontier;
          return !frontier || node.localZ > frontier.localZ ? node : frontier;
        }, null);
        if (seconds < 26 && growingTemplate) {
          const parentIndex = growingTemplate.block.parents.findIndex((hash) => templates.some((node) => node.block.hash === hash));
          const parentHash = parentIndex >= 0 ? growingTemplate.block.parents[parentIndex] : "";
          const parent = templates.find((node) => node.block.hash === parentHash);
          if (parent) {
            const nodeBirth = clamp01((growingTemplate.localZ - 16) / 102);
            const birth = smooth((growthWave - nodeBirth + .075) / .075);
            const parentWorld = { x: parent.x, y: parent.y, z: regionBase + parent.localZ };
            const childWorld = { x: growingTemplate.x, y: growingTemplate.y, z: regionBase + growingTemplate.localZ };
            const dx = childWorld.x - parentWorld.x;
            const dy = childWorld.y - parentWorld.y;
            const distance = Math.hypot(dx, dy) || 1;
            const bend = (hashUnit(growingTemplate.block.hash, 61 + parentIndex) - .5) * 16;
            const control = {
              x: (parentWorld.x + childWorld.x) / 2 - dy / distance * bend,
              y: (parentWorld.y + childWorld.y) / 2 + dx / distance * bend,
              z: (parentWorld.z + childWorld.z) / 2,
            };
            const inverse = 1 - birth;
            frontierWorld = {
              x: inverse * inverse * parentWorld.x + 2 * inverse * birth * control.x + birth * birth * childWorld.x,
              y: inverse * inverse * parentWorld.y + 2 * inverse * birth * control.y + birth * birth * childWorld.y,
              z: inverse * inverse * parentWorld.z + 2 * inverse * birth * control.z + birth * birth * childWorld.z,
            };
          }
        }
        if (seconds < 26) {
          // The active frontier changes discretely as new DAG nodes are born. Smooth
          // that changing point before it influences the camera so CRUISE never snaps
          // from one frontier block to another.
          const previousFrontier = frontierFollowRef.current;
          if (!previousFrontier || Math.abs(previousFrontier.z - frontierWorld.z) > REGION_LENGTH * .9) {
            frontierFollowRef.current = { ...frontierWorld };
          } else {
            const smoothing = 1 - Math.exp(-frameInterval / 900);
            frontierFollowRef.current = lerp3(previousFrontier, frontierWorld, smoothing);
          }
          const followedFrontier = frontierFollowRef.current;
          const follow = smooth(seconds / 4);
          camera = {
            x: lerp(camera.x, followedFrontier.x, follow * .18),
            y: lerp(camera.y, followedFrontier.y, follow * .14),
            z: camera.z,
          };
          target = lerp3(target, { x: followedFrontier.x, y: followedFrontier.y, z: followedFrontier.z + 12 }, follow * .62);
        }
      }

      const beaconTemplate = templates.find((node) => node.block.hash === beaconHash);
      let beaconWorld = null;
      let beaconBlend = 0;
      if (beaconTemplate) {
        const zoneShift = REGION_LENGTH * smooth((seconds - 38) / 8);
        beaconWorld = { x: beaconTemplate.x, y: beaconTemplate.y, z: regionBase + beaconTemplate.localZ + zoneShift };
        beaconBlend = smooth((time - beaconRef.current.startedAt) / 18_000);
        camera = {
          x: lerp(camera.x, beaconWorld.x, beaconBlend * .12),
          y: lerp(camera.y, beaconWorld.y, beaconBlend * .08),
          z: camera.z,
        };
        target = lerp3(target, beaconWorld, beaconBlend * .52);
      }

      const forward = normalize3(sub3(target, camera));
      const right = normalize3(cross3({ x: 0, y: 1, z: 0 }, forward));
      const up = normalize3(cross3(forward, right));
      const focal = Math.min(rect.width, rect.height) * focalScale(seconds);
      const centerX = rect.width * .5;
      const centerY = rect.height * (mobile ? .51 : .5);
      const project = (world) => {
        const relative = sub3(world, camera);
        const depth = dot3(relative, forward);
        if (depth <= 1.2) return null;
        const cameraX = dot3(relative, right), cameraY = dot3(relative, up);
        return { x: centerX + cameraX * focal / depth, y: centerY - cameraY * focal / depth, depth };
      };

      ctx.fillStyle = "rgba(2,7,12,.34)";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const starCount = mobile ? 24 : 44;
      ctx.save();
      ctx.lineCap = "round";
      for (let zone = cycle - 1; zone <= cycle + 1; zone += 1) {
        for (let index = 0; index < starCount; index += 1) {
          const key = `field-${zone}-${index}`;
          const world = {
            x: (hashUnit(key, 31) - .5) * 176,
            y: (hashUnit(key, 37) - .5) * 92,
            z: zone * REGION_LENGTH + hashUnit(key, 41) * REGION_LENGTH,
          };
          const point = project(world);
          if (!point || point.x < -30 || point.x > rect.width + 30 || point.y < -30 || point.y > rect.height + 30) continue;
          const trail = Math.min(13, focal / point.depth * .58);
          ctx.strokeStyle = `rgba(92,238,224,${Math.min(.26, .03 + 20 / (point.depth + 80))})`;
          ctx.lineWidth = point.depth < 54 ? 1.15 : .55;
          ctx.beginPath(); ctx.moveTo(point.x, point.y + trail); ctx.lineTo(point.x, point.y); ctx.stroke();
        }
      }
      ctx.restore();

      const projected = [];
      for (let zone = cycle - 1; zone <= cycle + 1; zone += 1) {
        templates.forEach((node) => {
          const nodeBirth = clamp01((node.localZ - 16) / 102);
          const zoneGrowth = zone < cycle ? 1 : zone === cycle ? growthWave : 0;
          const birth = zoneGrowth >= 1 ? 1 : smooth((zoneGrowth - nodeBirth + .075) / .075);
          if (birth <= .01) return;
          const point = project({ x: node.x, y: node.y, z: zone * REGION_LENGTH + node.localZ });
          if (!point || point.x < -90 || point.x > rect.width + 90 || point.y < -90 || point.y > rect.height + 90) return;
          const baseSize = 1.15 + Math.sqrt(Math.max(1, node.block.txCount)) * .44;
          const radius = Math.min(21, Math.max(.65, baseSize * focal / point.depth)) * (.2 + birth * .8);
          const lod = point.depth < 52 || radius >= 6 ? "near" : point.depth < 132 || radius >= 2 ? "mid" : "far";
          projected.push({ ...node, zone, sx: point.x, sy: point.y, depth: point.depth, radius, lod, birth });
        });
      }
      projected.sort((a, b) => b.depth - a.depth);

      const byZone = new Map();
      projected.forEach((node) => {
        const map = byZone.get(node.zone) ?? new Map();
        map.set(node.block.hash, node);
        byZone.set(node.zone, map);
      });

      const flowEdges = [];
      const offscreenParentEdges = [];
      const branchCounts = new Map();
      const edgeKeys = new Set();
      const templatesByHash = new Map(templates.map((node) => [node.block.hash, node]));
      for (let zone = cycle - 1; zone <= cycle + 1; zone += 1) {
        const zoneGrowth = zone < cycle ? 1 : zone === cycle ? growthWave : 0;
        templates.forEach((child) => {
          const nodeBirth = clamp01((child.localZ - 16) / 102);
          const birth = zoneGrowth >= 1 ? 1 : smooth((zoneGrowth - nodeBirth + .075) / .075);
          if (birth <= .01) return;
          const uniqueParents = [...new Set(child.block.parents)];
          const visibleParents = uniqueParents
            .map((parentHash, parentIndex) => ({ parentHash, parentIndex, parent: templatesByHash.get(parentHash) }))
            .filter((entry) => entry.parent);

          // Draw real parent relationships whenever the parent is inside the current block window.
          visibleParents.forEach(({ parentHash, parentIndex, parent }) => {
            const edgeKey = `${zone}:${parentHash}>${child.block.hash}`;
            if (edgeKeys.has(edgeKey)) return;
            edgeKeys.add(edgeKey);
            const key = `${zone}:${parentHash}`;
            branchCounts.set(key, (branchCounts.get(key) ?? 0) + 1);
            const parentWorld = { x: parent.x, y: parent.y, z: zone * REGION_LENGTH + parent.localZ };
            const childWorld = { x: child.x, y: child.y, z: zone * REGION_LENGTH + child.localZ };
            const dx = childWorld.x - parentWorld.x;
            const dy = childWorld.y - parentWorld.y;
            const distance = Math.hypot(dx, dy) || 1;
            const bend = (hashUnit(child.block.hash, 61 + parentIndex) - .5) * 16;
            const control = {
              x: (parentWorld.x + childWorld.x) / 2 - dy / distance * bend,
              y: (parentWorld.y + childWorld.y) / 2 + dx / distance * bend,
              z: (parentWorld.z + childWorld.z) / 2,
            };
            flowEdges.push({ parent, child, zone, birth, control });
          });

          // If none of this block's real parents are visible, add 1–3 visual continuation
          // guides. Their count and 3D directions are deterministic-random per block so
          // they do not flicker between frames. These guides mean "continues outside the
          // visible window"; they do not represent additional real parent relationships.
          if (uniqueParents.length > 0 && visibleParents.length === 0) {
            const guideCount = 1 + Math.floor(hashUnit(child.block.hash, 191) * 3);
            const childWorld = { x: child.x, y: child.y, z: zone * REGION_LENGTH + child.localZ };

            for (let guideIndex = 0; guideIndex < guideCount; guideIndex += 1) {
              const edgeKey = `${zone}:offscreen-guide:${child.block.hash}:${guideIndex}`;
              if (edgeKeys.has(edgeKey)) continue;
              edgeKeys.add(edgeKey);

              const azimuth = hashUnit(child.block.hash, 211 + guideIndex * 17) * Math.PI * 2;
              const elevation = (hashUnit(child.block.hash, 223 + guideIndex * 19) - .5) * Math.PI * .82;
              const length = 28 + hashUnit(child.block.hash, 239 + guideIndex * 23) * 34;
              const horizontal = Math.cos(elevation);

              const direction = {
                x: Math.cos(azimuth) * horizontal,
                y: Math.sin(elevation),
                z: Math.sin(azimuth) * horizontal,
              };
              const endWorld = {
                x: childWorld.x + direction.x * length,
                y: childWorld.y + direction.y * length,
                z: childWorld.z + direction.z * length,
              };

              offscreenParentEdges.push({
                child,
                zone,
                birth,
                guideIndex,
                childWorld,
                endWorld,
              });
            }
          }
        });
      }

      const edgeWorldPoint = (edge, progress) => {
        const parent = { x: edge.parent.x, y: edge.parent.y, z: edge.zone * REGION_LENGTH + edge.parent.localZ };
        const child = { x: edge.child.x, y: edge.child.y, z: edge.zone * REGION_LENGTH + edge.child.localZ };
        const inverse = 1 - progress;
        return {
          x: inverse * inverse * parent.x + 2 * inverse * progress * edge.control.x + progress * progress * child.x,
          y: inverse * inverse * parent.y + 2 * inverse * progress * edge.control.y + progress * progress * child.y,
          z: inverse * inverse * parent.z + 2 * inverse * progress * edge.control.z + progress * progress * child.z,
        };
      };

      const projectEdgePoint = (world) => {
        const point = project(world);
        if (!point) return null;
        const marginX = rect.width * 1.5;
        const marginY = rect.height * 1.5;
        if (point.x < -marginX || point.x > rect.width + marginX || point.y < -marginY || point.y > rect.height + marginY) return null;
        return point;
      };

      // Blocks with no visible parent get 1–3 fading continuation guides in
      // deterministic-random 3D directions. These guides only indicate that the DAG
      // continues outside the visible window; they are not extra real parent edges.
      ctx.save();
      ctx.lineCap = "round";
      offscreenParentEdges.forEach((edge) => {
        const steps = mobile ? 6 : 9;
        for (let step = 0; step < steps; step += 1) {
          const t0 = step / steps;
          const t1 = (step + 1) / steps;
          const w0 = lerp3(edge.childWorld, edge.endWorld, t0);
          const w1 = lerp3(edge.childWorld, edge.endWorld, t1);
          const p0 = projectEdgePoint(w0);
          const p1 = projectEdgePoint(w1);
          if (!p0 || !p1) continue;
          const fade = Math.max(0, 1 - t0);
          ctx.strokeStyle = `rgba(143,255,244,${.46 * fade * edge.birth})`;
          ctx.lineWidth = p0.depth < 70 ? 1.05 : .68;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      });
      ctx.restore();

      // Every visible parent-to-child edge carries moving data packets. Multiple edges
      // animate at the same time to express Kaspa's parallel, distributed processing.
      ctx.save();
      ctx.lineCap = "round";
      flowEdges.forEach((edge, edgeIndex) => {
          const center = projectEdgePoint(edgeWorldPoint(edge, Math.min(.5, edge.birth)));
          const depth = center?.depth ?? Number.POSITIVE_INFINITY;
          const near = depth < 52;
          const mid = depth >= 52 && depth < 132;
          const growing = edge.zone === cycle && edge.birth < .995;
          const alpha = growing ? (near ? .82 : .64) : near ? .58 : mid ? .32 : .18;
          ctx.strokeStyle = growing ? `rgba(226,255,252,${alpha})` : `rgba(143,255,244,${alpha})`;
          ctx.lineWidth = growing ? (near ? 1.65 : 1.15) : near ? 1.25 : mid ? .8 : .58;
          ctx.shadowColor = growing ? "#9ffff4" : "transparent";
          ctx.shadowBlur = growing ? (mobile ? 4 : 7) : 0;
          ctx.beginPath();
          const segments = mobile ? 7 : 10;
          let drawing = false;
          for (let segment = 0; segment <= segments; segment += 1) {
            const progress = edge.birth * segment / segments;
            const point = projectEdgePoint(edgeWorldPoint(edge, progress));
            if (!point) {
              drawing = false;
              continue;
            }
            if (!drawing) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
            drawing = true;
          }
          ctx.stroke();

          const level = blockLevel(edge.child.block);
          const packetColor = level === "mega" ? "#c486ff" : level === "large" ? "#ff6075" : level === "medium" ? "#ff9f43" : level === "small" ? "#ffd84d" : "#effffd";
          const packetCount = 1;
          for (let packetIndex = 0; packetIndex < packetCount; packetIndex += 1) {
            if (mobile && !near && edgeIndex % 3 !== 0) continue;
            const progress = ((time / (level === "normal" ? 1500 : 1120) + edgeIndex * .173 + packetIndex / packetCount) % 1) * edge.birth;
            const packet = projectEdgePoint(edgeWorldPoint(edge, progress));
            if (!packet) continue;
            ctx.save();
            ctx.fillStyle = packetColor;
            if (!mobile || level !== "normal") {
              ctx.shadowColor = packetColor;
              ctx.shadowBlur = level === "normal" ? 4 : 8;
            }
            ctx.globalAlpha = .38 + Math.sin(progress * Math.PI) * .62;
            ctx.beginPath(); ctx.arc(packet.x, packet.y, level === "normal" ? 1.35 : 2.05, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
      });
      ctx.restore();

      const positions = new Map();
      let parallelCount = 0;
      projected.forEach((node) => {
        const level = blockLevel(node.block);
        const color = level === "mega" ? "#b36cff" : level === "large" ? "#ff4d64" : level === "medium" ? "#ff9f43" : level === "small" ? "#ffd84d" : "#49e7d5";
        const processProgress = (time / 1180 + hashUnit(node.block.hash, 73) * 2.7) % 1;
        const isProcessing = node.zone === cycle && node.birth > .82 && node.lod !== "far" && processProgress < .32;
        if (isProcessing) parallelCount += 1;
        const current = positions.get(node.block.hash);
        if (node.lod !== "far" && (!current || node.depth < current.depth)) positions.set(node.block.hash, { x: node.sx, y: node.sy, radius: Math.max(6, node.radius), depth: node.depth });
        ctx.save();
        if (node.lod === "far") {
          ctx.globalAlpha = (level === "normal" ? .34 : .7) * node.birth;
          ctx.fillStyle = color;
          ctx.fillRect(node.sx, node.sy, level === "normal" ? 1 : 1.7, level === "normal" ? 1 : 1.7);
        } else if (node.lod === "mid") {
          ctx.globalAlpha = (level === "normal" ? .62 : .92) * node.birth;
          ctx.fillStyle = color;
          if (level !== "normal") { ctx.shadowColor = color; ctx.shadowBlur = mobile ? 5 : 9; }
          ctx.beginPath(); ctx.arc(node.sx, node.sy, Math.max(1.35, node.radius * .58), 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.globalAlpha = .94 * node.birth;
          ctx.fillStyle = color;
          if (!mobile || level !== "normal") {
            ctx.shadowColor = color;
            ctx.shadowBlur = level === "normal" ? 4 : mobile ? 7 : 11;
          }
          ctx.beginPath(); ctx.arc(node.sx, node.sy, node.radius, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = selected === node.block.hash ? "#ffffff" : "rgba(225,255,251,.46)";
          ctx.lineWidth = selected === node.block.hash ? 1.8 : .8;
          ctx.beginPath(); ctx.arc(node.sx, node.sy, node.radius + 2.5, 0, Math.PI * 2); ctx.stroke();
          const activity = clamp01(Math.log10(Math.max(1, node.block.volumeKas)) / 8);
          ctx.strokeStyle = color;
          ctx.globalAlpha = .25 + activity * .42;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(node.sx, node.sy, node.radius + 6, -.5 * Math.PI, (-.5 + 2 * activity) * Math.PI); ctx.stroke();
        }
        if (isProcessing) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = color;
          ctx.globalAlpha = .46 * (1 - processProgress / .32);
          ctx.lineWidth = node.lod === "near" ? 1.2 : .7;
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, Math.max(4, node.radius) + 5 + processProgress * 18, -.72 * Math.PI, .68 * Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      });
      positionsRef.current = positions;

      if (frontierWorld) {
        const frontier = project(frontierWorld);
        if (frontier && frontier.x > 20 && frontier.x < rect.width - 20 && frontier.y > 20 && frontier.y < rect.height - 20) {
          const pulse = (time / 1050) % 1;
          ctx.save();
          ctx.strokeStyle = "#dcfffb";
          ctx.shadowColor = "#49e7d5";
          ctx.shadowBlur = mobile ? 4 : 9;
          ctx.globalAlpha = .62 * (1 - pulse);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(frontier.x, frontier.y, 7 + pulse * 23, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = .72;
          ctx.fillStyle = "#bafff7";
          ctx.font = "600 9px ui-monospace, monospace";
          ctx.fillText("DAG FRONTIER", frontier.x + 11, frontier.y + 3);
          ctx.restore();
        }
      }

      // Shared parents are real fan-out points in the visible DAG. A synchronized
      // ring makes the distributed branch readable without adding synthetic edges.
      let branchPointCount = 0;
      ctx.save();
      branchCounts.forEach((count, key) => {
        if (count < 2) return;
        const separator = key.indexOf(":");
        const zone = Number(key.slice(0, separator));
        const hash = key.slice(separator + 1);
        const parent = byZone.get(zone)?.get(hash);
        if (!parent || parent.zone !== cycle) return;
        branchPointCount += 1;
        const pulse = (time / 1320 + hashUnit(hash, 83)) % 1;
        ctx.strokeStyle = "#7ffff2";
        ctx.globalAlpha = .42 * (1 - pulse);
        ctx.lineWidth = .9;
        ctx.beginPath(); ctx.arc(parent.sx, parent.sy, Math.max(5, parent.radius * .65) + pulse * 16, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.restore();

      if (beaconWorld) {
        const beacon = project(beaconWorld);
        if (beacon && beacon.x > 18 && beacon.x < rect.width - 18 && beacon.y > 18 && beacon.y < rect.height - 18) {
          const pulse = (time / 1500) % 1;
          ctx.save();
          ctx.strokeStyle = "#b36cff";
          ctx.shadowColor = "#b36cff";
          ctx.shadowBlur = mobile ? 7 : 12;
          ctx.globalAlpha = .78 * (1 - pulse);
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(beacon.x, beacon.y, 10 + pulse * 34, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = .82;
          ctx.fillStyle = "#d8b6ff";
          ctx.font = "600 10px ui-monospace, monospace";
          ctx.fillText("1M+ BEACON", beacon.x + 13, beacon.y - 12);
          ctx.restore();
        }
      }

      const selectedPoint = selected ? positions.get(selected) : null;
      if (selectedPoint) {
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = .82;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.arc(selectedPoint.x, selectedPoint.y, selectedPoint.radius + 9 + Math.sin(time / 260) * 2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = "rgba(220,255,251,.88)";
      ctx.font = "600 11px ui-monospace, monospace";
      ctx.fillText(`INFINITE FLIGHT  ·  ${phase.name}`, 18, 24);
      ctx.fillStyle = "rgba(73,231,213,.48)";
      ctx.font = "10px ui-monospace, monospace";
      const remaining = Math.max(0, Math.ceil((phase.name === "CRUISE" ? 26 : phase.name === "PULL BACK" ? 33 : phase.name === "OVERVIEW" ? 38 : phase.name === "SPLINE TURN" ? 46 : 53) - seconds));
      ctx.fillText(`GROWTH ${Math.round(growthWave * 100)}%  ·  FRONTIER FOLLOW`, 18, 41);
      ctx.fillStyle = "rgba(73,231,213,.36)";
      ctx.fillText(`PARALLEL ${parallelCount}  ·  BRANCH ${branchPointCount}  ·  FLOW ${flowEdges.length}`, 18, 58);
      ctx.fillText(`LOD NEAR / CLUSTER / FIELD  ·  ${remaining}s`, 18, 75);
      if (beaconWorld) {
        ctx.fillStyle = "rgba(179,108,255,.8)";
        ctx.fillText(`MEGA BEACON COURSE ${Math.round(beaconBlend * 100)}%`, 18, 92);
      }
      ctx.restore();

      if (!paused) animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [beaconHash, orderedBlocks, paused, selected, templates]);

  const handlePointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    let nearest = null;
    orderedBlocks.forEach((block) => {
      const point = positionsRef.current.get(block.hash);
      if (!point) return;
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance <= point.radius + 13 && (!nearest || distance < nearest.distance)) nearest = { block, distance };
    });
    if (nearest) onSelect(nearest.block);
  };

  return <canvas ref={canvasRef} className="dag-canvas" aria-label="Infinite Flight形式のライブBlockDAG。発光ブロックを選択すると詳細を表示します" onPointerDown={handlePointer} />;
}
