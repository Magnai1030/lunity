"use client";

import { useRef, useState, useTransition, type ChangeEvent, type DragEvent } from "react";
import { Icon, IconButton, Thumb, cx } from "@/components/ui";
import { moveProductPhoto, removeProductPhoto, uploadProductPhoto } from "../../actions";
import { Card } from "../../AdminForm";
import s from "../../admin.module.css";

/**
 * Product photos: drop or pick files (several at once), set the cover, reorder, remove.
 * Each change saves immediately — separate from the text fields' Save bar.
 */
export function PhotoManager({ id, photos, title }: { id: string; photos: string[]; title: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [over, setOver] = useState(false);

  const upload = (files: File[]) => {
    if (!files.length) return;
    start(async () => {
      const errors: string[] = [];
      for (const [i, file] of files.entries()) {
        setStatus({ ok: true, text: files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…" });
        const fd = new FormData();
        fd.set("photo", file);
        const r = await uploadProductPhoto(id, fd);
        if (!r.ok) errors.push(r.message);
      }
      setStatus(errors.length ? { ok: false, text: errors.join(" ") } : { ok: true, text: files.length > 1 ? `${files.length} photos added` : "Photo added" });
    });
  };

  // stopPropagation keeps the file input from marking the surrounding product form as unsaved.
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    upload([...(e.target.files ?? [])]);
    e.target.value = "";
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    upload([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/")));
  };
  const act = (fn: () => Promise<void>) => start(async () => {
    setStatus(null);
    await fn();
  });

  return (
    <Card title="Images" hint="The first photo is the cover on cards, cart and search. JPG, PNG, WebP or AVIF, up to 5 MB.">
      <div
        className={cx(s.photoGrid, over && s.photoOver, pending && s.busy)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        {photos.map((src, i) => (
          <figure key={src} className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element -- uploaded file of unknown size */}
            <img src={src} alt={`${title}, photo ${i + 1}`} />
            {i === 0 && <span className={s.coverTag}>Cover</span>}
            <figcaption className={s.photoActions}>
              {i > 0 && (
                <button type="button" className={s.photoBtn} onClick={() => act(() => moveProductPhoto(id, src, 0))} disabled={pending}>
                  Make cover
                </button>
              )}
              <span className={s.photoIcons}>
                <IconButton icon="back" label="Move earlier" onClick={() => act(() => moveProductPhoto(id, src, i - 1))} disabled={pending || i === 0} />
                <IconButton icon="arrow" label="Move later" onClick={() => act(() => moveProductPhoto(id, src, i + 1))} disabled={pending || i === photos.length - 1} />
                <IconButton icon="trash" label={`Remove photo ${i + 1}`} onClick={() => act(() => removeProductPhoto(id, src))} disabled={pending} />
              </span>
            </figcaption>
          </figure>
        ))}

        <button type="button" className={s.photoAdd} onClick={() => input.current?.click()} disabled={pending}>
          {photos.length === 0 && <Thumb art={id} size={72} />}
          <Icon name="plus" size={22} />
          <span className="body-strong">{photos.length ? "Add more" : "Add photos"}</span>
          <span className="small muted">or drop them here</span>
        </button>
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={onPick} />

      <span className={cx("small", status && !status.ok ? s.rowNoteError : "muted")} aria-live="polite">
        {status?.text ?? (photos.length === 0 ? "No photos yet, so the store shows the drawing." : `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`)}
      </span>
    </Card>
  );
}
