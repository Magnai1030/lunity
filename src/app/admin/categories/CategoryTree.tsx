"use client";

import { useRef, useState, useTransition, type DragEvent } from "react";
import { Button, Icon, IconButton, cx } from "@/components/ui";
import { MAX_CATEGORY_DEPTH } from "@/db/models";
import { saveCategories, type ActionResult, type CategoryInput } from "../actions";
import { Card, SaveBar, useSaveSlot } from "../AdminForm";
import { IconPicker } from "../Pickers";
import s from "../admin.module.css";

type Node = CategoryInput;
type Zone = "before" | "inside" | "after";

/*
 * The tree is a flat list: parentId gives the structure, and siblings are ordered by their
 * position in the array. Every move edits that list, so the whole tree saves in one call.
 */
const kids = (nodes: Node[], parentId: string | null) => nodes.filter((n) => n.parentId === parentId);
const parentOf = (nodes: Node[], id: string) => nodes.find((n) => n.id === id)?.parentId ?? null;
function depth(nodes: Node[], id: string | null): number {
  let d = 0;
  for (let p = id; p !== null; p = parentOf(nodes, p)) d++;
  return d;
}
function below(nodes: Node[], id: string): Set<string> {
  const out = new Set([id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const n of nodes) {
      if (n.parentId && out.has(n.parentId) && !out.has(n.id)) {
        out.add(n.id);
        grew = true;
      }
    }
  }
  return out;
}
/** Levels a subtree spans: 1 for a category without children. */
const height = (nodes: Node[], id: string): number => 1 + Math.max(0, ...kids(nodes, id).map((k) => height(nodes, k.id)));

/** Where `id` would end up when dropped on `target`, or null when that's not allowed. */
function landing(nodes: Node[], id: string, target: string, zone: Zone): string | null | false {
  if (below(nodes, id).has(target)) return false; // into itself or its own branch
  const parent = zone === "inside" ? target : parentOf(nodes, target);
  return depth(nodes, parent) + height(nodes, id) <= MAX_CATEGORY_DEPTH ? parent : false;
}

/** Moves one node (its children follow through parentId) next to or into another. */
function move(nodes: Node[], id: string, target: string, zone: Zone): Node[] {
  const parent = landing(nodes, id, target, zone);
  if (parent === false) return nodes;
  const node = { ...nodes.find((n) => n.id === id)!, parentId: parent };
  const rest = nodes.filter((n) => n.id !== id);
  let at = rest.findIndex((n) => n.id === target);
  if (zone === "after") at += 1;
  if (zone === "inside") {
    const last = kids(rest, target).at(-1);
    at = rest.findIndex((n) => n.id === (last ?? rest[at]).id) + 1;
  }
  return [...rest.slice(0, at), node, ...rest.slice(at)];
}

let newId = 0;
const blank = (parentId: string | null): Node => ({ id: `new:${++newId}`, parentId, name: { en: "", mn: "" }, icon: null, showInMenu: true });

export function CategoryTree({ initial, counts }: { initial: Node[]; counts: Record<string, number> }) {
  const [baseline, setBaseline] = useState(initial);
  const [nodes, setNodes] = useState(initial);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();
  const [drag, setDrag] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ id: string; zone: Zone; ok: boolean } | null>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const dirty = JSON.stringify(nodes) !== JSON.stringify(baseline);

  const saveNow = async () => {
    const r = await saveCategories(nodes);
    // New ids ("new:…") become real ones on the server; the page remounts this editor with them.
    if (r?.ok) setBaseline(nodes);
    return r;
  };
  const discard = () => {
    setNodes(baseline);
    setResult(null);
  };
  const inScope = useSaveSlot({ dirty, save: saveNow, discard });

  const patch = (id: string, p: Partial<Node>) => setNodes((list) => list.map((n) => (n.id === id ? { ...n, ...p } : n)));
  const sibling = (id: string, by: -1 | 1) => {
    const sibs = kids(nodes, parentOf(nodes, id));
    return sibs[sibs.findIndex((n) => n.id === id) + by];
  };

  const onDragOver = (e: DragEvent, id: string) => {
    if (!drag) return;
    e.preventDefault();
    const rect = rows.current.get(id)!.getBoundingClientRect();
    const y = (e.clientY - rect.top) / rect.height;
    let zone: Zone = y < 0.28 ? "before" : y > 0.72 ? "after" : "inside";
    // Can't nest here (too deep)? Fall back to the nearer edge.
    if (zone === "inside" && landing(nodes, drag, id, "inside") === false) zone = y < 0.5 ? "before" : "after";
    const ok = drag !== id && landing(nodes, drag, id, zone) !== false;
    e.dataTransfer.dropEffect = ok ? "move" : "none";
    if (drop?.id !== id || drop.zone !== zone || drop.ok !== ok) setDrop({ id, zone, ok });
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    if (drag && drop?.ok) setNodes((list) => move(list, drag, drop.id, drop.zone));
    setDrag(null);
    setDrop(null);
  };

  const renderLevel = (parentId: string | null, level: number) => (
    <ul className={s.treeLevel} role={level === 1 ? "tree" : "group"} aria-label={level === 1 ? "Categories" : undefined}>
      {kids(nodes, parentId).map((n, i, sibs) => {
        const children = kids(nodes, n.id);
        const count = counts[n.id] ?? 0;
        const prev = sibs[i - 1];
        const canIndent = !!prev && depth(nodes, prev.id) + height(nodes, n.id) <= MAX_CATEGORY_DEPTH;
        const blocked = children.length ? "Has subcategories" : count ? `Has ${count} ${count === 1 ? "product" : "products"}` : "";
        const here = drop?.id === n.id ? drop : null;
        return (
          <li key={n.id} role="treeitem" aria-level={level} aria-expanded={children.length ? true : undefined} aria-selected={false}>
            <div
              ref={(el) => {
                if (el) rows.current.set(n.id, el);
              }}
              className={cx(s.treeRow, drag === n.id && s.treeDragging, here?.ok && s[`drop_${here.zone}`], here && !here.ok && s.dropNo)}
              onDragOver={(e) => onDragOver(e, n.id)}
              onDragLeave={() => setDrop((d) => (d?.id === n.id ? null : d))}
              onDrop={onDrop}
            >
              <span
                className={s.grip}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", n.name.en || n.id);
                  e.dataTransfer.setDragImage(rows.current.get(n.id)!, 20, 20);
                  setDrag(n.id);
                }}
                onDragEnd={() => {
                  setDrag(null);
                  setDrop(null);
                }}
                title="Drag to move"
                aria-hidden="true"
              >
                <Icon name="grip" size={18} strokeWidth={2.6} />
              </span>
              <input aria-label="Name in English" value={n.name.en} placeholder="Name · English" onChange={(e) => patch(n.id, { name: { ...n.name, en: e.target.value } })} />
              <input aria-label="Name in Mongolian" lang="mn" value={n.name.mn} placeholder="Нэр · Монгол" onChange={(e) => patch(n.id, { name: { ...n.name, mn: e.target.value } })} />
              <span className={cx("small muted", s.treeCount)}>{n.id.startsWith("new:") ? "New" : `${count} ${count === 1 ? "product" : "products"}`}</span>
              <span className={s.treeTools}>
                <IconButton icon="chevron" className={s.up} label="Move up" disabled={!prev} onClick={() => setNodes((l) => move(l, n.id, prev.id, "before"))} />
                <IconButton icon="chevron" className={s.down} label="Move down" disabled={!sibs[i + 1]} onClick={() => setNodes((l) => move(l, n.id, sibling(n.id, 1).id, "after"))} />
                <IconButton icon="back" label="Move out a level" disabled={parentId === null} onClick={() => setNodes((l) => move(l, n.id, parentId!, "after"))} />
                <IconButton icon="arrow" label={prev ? `Move into ${prev.name.en || "the category above"}` : "Move into the category above"} disabled={!canIndent} onClick={() => setNodes((l) => move(l, n.id, prev.id, "inside"))} />
                <IconButton icon="plus" label="Add subcategory" disabled={level >= MAX_CATEGORY_DEPTH} onClick={() => setNodes((l) => [...l, blank(n.id)])} />
                <IconButton icon="trash" label={blocked ? `Can’t delete: ${blocked.toLowerCase()}` : `Delete ${n.name.en || "category"}`} disabled={!!blocked} onClick={() => setNodes((l) => l.filter((x) => x.id !== n.id))} />
              </span>
              {level === 1 && (
                <span className={s.treeMenu}>
                  <label className={s.treeCheck}>
                    <input type="checkbox" checked={n.showInMenu} onChange={(e) => patch(n.id, { showInMenu: e.target.checked })} />
                    <span className="small">In store menu</span>
                  </label>
                  <span className={s.treeIcon}>
                    <span className="small muted">Menu icon</span>
                    <IconPicker value={n.icon} onChange={(icon) => patch(n.id, { icon })} label={`Menu icon for ${n.name.en || "category"}`} />
                  </span>
                </span>
              )}
            </div>
            {children.length > 0 && renderLevel(n.id, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <Card
      title="Category tree"
      hint={`Drag by the dots: drop on the top or bottom edge of a category to place it before or after, or on its middle to put it inside. Up to ${MAX_CATEGORY_DEPTH} levels.`}
      aside={
        <Button type="button" size="sm" variant="secondary" icon="plus" onClick={() => setNodes((l) => [...l, blank(null)])}>
          Add category
        </Button>
      }
    >
      {nodes.length === 0 ? <p className="small muted">No categories yet. Add the first one.</p> : renderLevel(null, 1)}
      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onSave={() => start(async () => setResult(await saveNow()))} onDiscard={discard} onDone={() => setResult(null)} />}
    </Card>
  );
}
