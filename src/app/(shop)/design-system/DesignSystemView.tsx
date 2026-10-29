"use client";

import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Chip,
  EmptyState,
  Gallery,
  OptionGroup,
  Icon,
  IconButton,
  ImageMat,
  InfoBanner,
  ListRow,
  ProductCard,
  QuantityStepper,
  RangeSlider,
  Sheet,
  SpecList,
  SummaryRows,
  Tabs,
  TextInput,
  Thumb,
  Toggle,
  type IconName,
} from "@/components/ui";
import { PageShell } from "@/components/shop/PageShell";
import { formatPrice, dictionaries } from "@/lib/i18n";
import { gallerySlides } from "@/components/shop/productGallery";
import { getProduct } from "@/lib/data";
import s from "./ds.module.css";

const COLORS = [
  "surface-page", "surface-card", "surface-mat", "surface-chip", "surface-inverse",
  "ink", "ink-muted", "ink-on-chip", "line", "border-field",
  "focus", "ok", "ok-surface", "error", "error-surface", "warn", "warn-surface",
];
const TYPE = [
  ["display", "Lunar New Year gifts"],
  ["headline", "Tsagaan Sar gift box"],
  ["title", "What's included"],
  ["body", "Everything for a visit in one box."],
  ["body-strong", "Add to cart"],
  ["small", "Gift-wrapped · Цагаан сар"],
  ["price-lg", "₮185,000"],
  ["price", "₮45,000"],
  ["label", "N° 012 · Brand"],
  ["meta", "Tal Pantry"],
];
const SPACE = [4, 6, 8, 10, 14, 16, 24, 32, 48];
const RADII = [["art", 2], ["sm", 8], ["field", 12], ["mat", 14], ["card", 22], ["pill", 999]] as const;
const ICONS: IconName[] = ["heart", "bag", "search", "menu", "back", "arrow", "close", "check", "plus", "minus", "filter", "shield", "alert", "grid", "cup", "home", "image", "box", "star", "tag", "receipt", "user", "bell", "help", "book", "card", "bank", "mail"];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="title">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DesignSystemView() {
  const [qty, setQty] = useState(1);
  const [on, setOn] = useState(true);
  const [range, setRange] = useState<[number, number]>([26000, 98000]);
  const [tab, setTab] = useState<"a" | "b">("a");
  const [chip, setChip] = useState("Elders");
  const [size, setSize] = useState("500");
  const [sheet, setSheet] = useState<"" | "bottom" | "left">("");

  return (
    <PageShell bar={{ title: "Atelier" }}>
      <div className={`wrap ${s.page}`}>
        <header className={s.head}>
          <span className="label muted">Design system</span>
          <h1 className="display">Atelier</h1>
          <p className="body muted">Tokens and components for the made-to-order art supply shop. Light and dark themes follow the system setting.</p>
          <nav className="chiprow" aria-label="Sections">
            {["colors", "type", "space", "icons", "buttons", "controls", "fields", "display", "cards", "gallery", "empty", "overlays"].map((x) => (
              <a key={x} href={`#${x}`} className="at-chip at-chip--fill at-chip--action">
                {x}
              </a>
            ))}
          </nav>
        </header>

        <Section id="colors" title="Color">
          <div className={s.swatches}>
            {COLORS.map((c) => (
              <div key={c} className={s.swatch}>
                <span className={s.chipColor} style={{ background: `var(--${c})` }} />
                <span className="meta">{c}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" title="Typography">
          <div className={s.typeList}>
            {TYPE.map(([cls, sample]) => (
              <div key={cls} className={s.typeRow}>
                <span className="label muted">{cls}</span>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="space" title="Spacing, radius, elevation">
          <div className={s.spaceRow}>
            {SPACE.map((n, i) => (
              <div key={n} className={s.spaceItem}>
                <span className={s.spaceBar} style={{ width: n, height: n }} />
                <span className="meta muted">
                  {i + 1}·{n}
                </span>
              </div>
            ))}
          </div>
          <div className={s.spaceRow}>
            {RADII.map(([name, r]) => (
              <div key={name} className={s.spaceItem}>
                <span className={s.radius} style={{ borderRadius: r }} />
                <span className="meta muted">{name}</span>
              </div>
            ))}
            <div className={s.spaceItem}>
              <span className={s.radius} style={{ boxShadow: "var(--shadow-art)" }} />
              <span className="meta muted">shadow-art</span>
            </div>
            <div className={s.spaceItem}>
              <span className={s.radius} style={{ boxShadow: "var(--shadow-lift)" }} />
              <span className="meta muted">shadow-lift</span>
            </div>
          </div>
        </Section>

        <Section id="icons" title="Icons">
          <div className={s.icons}>
            {ICONS.map((n) => (
              <span key={n} className={s.icon} title={n}>
                <Icon name={n} />
                <span className="meta muted">{n}</span>
              </span>
            ))}
          </div>
        </Section>

        <Section id="buttons" title="Buttons">
          <div className={s.row}>
            <Button>Primary</Button>
            <Button iconAfter="arrow">Browse items</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button icon="plus">Add to cart</Button>
            <Button disabled>Disabled</Button>
            <Button variant="danger" icon="close">
              Remove
            </Button>
          </div>
          <div className={s.row}>
            <Button size="sm">Small</Button>
            <Button size="sm" variant="secondary">
              Small secondary
            </Button>
            <IconButton icon="search" label="Search" />
            <IconButton icon="heart" label="Save" tone="surface" />
            <IconButton icon="heart" label="Saved" pressed tone="surface" />
            <IconButton icon="bag" label="Cart" count={3} />
          </div>
        </Section>

        <Section id="controls" title="Chips, badges, toggles">
          <div className={s.row}>
            {["Elders", "Family", "Colleagues"].map((c) => (
              <Chip key={c} variant="outline" selected={chip === c} onClick={() => setChip(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className={s.row}>
            <Chip>Elders</Chip>
            <Chip>500 g</Chip>
            <Chip selected>Selected</Chip>
          </div>
          <div className={s.row}>
            <Badge tone="new">New</Badge>
            <Badge>Top gift</Badge>
            <Badge tone="ok" icon="check">
              Save ₮25,000
            </Badge>
            <Badge tone="warn">Preparing</Badge>
            <Badge tone="ok">Ready</Badge>
            <Badge tone="error">Cancelled</Badge>
          </div>
          <div className={s.grid2}>
            <Toggle checked={on} onChange={setOn} label="Top gifts" description="Show our most-given Tsagaan Sar gifts" />
            <RangeSlider min={18000} max={185000} low={range[0]} high={range[1]} onChange={(a, b) => setRange([a, b])} format={formatPrice} minLabel="Minimum" maxLabel="Maximum" />
            <QuantityStepper value={qty} onChange={setQty} max={10} />
            <Tabs label="Demo" value={tab} onChange={setTab} tabs={[{ id: "a", label: "Active" }, { id: "b", label: "Completed" }]} />
          </div>
        </Section>

        <Section id="fields" title="Fields">
          <div className={s.grid2}>
            <TextInput label="Phone number" required prefix="+976" placeholder="0000 0000" hint="We will call this number for delivery updates." />
            <TextInput label="District" required error="This field is required" defaultValue="" />
            <TextInput label="Search" icon="search" placeholder="Search gifts…" />
          </div>
        </Section>

        <Section id="display" title="Data display">
          <div className={s.grid2}>
            <InfoBanner>Every order is gift-wrapped and delivered within 5 days.</InfoBanner>
            <InfoBanner tone="warn" icon="clock">
              Being wrapped — est. 3 days remaining.
            </InfoBanner>
            <SpecList
              items={[
                { label: "Brand", value: "Tal Pantry" },
                { label: "Type", value: "Gift set" },
                { label: "Delivery", value: "Within 5 days" },
              ]}
            />
            <SummaryRows rows={[{ label: "Subtotal", value: "₮261,000" }, { label: "Shipping", value: "Free" }]} total={{ label: "Total", value: "₮261,000" }} />
            <div>
              <ListRow icon="receipt" title="My orders" sub="Track and review your orders" onClick={() => {}} />
              <ListRow icon="heart" title="Saved items" sub="Items you want to come back to" onClick={() => {}} />
            </div>
            <div className={s.row}>
              {["p1", "p2", "p6", "p12"].map((id) => (
                <Thumb key={id} art={id} />
              ))}
            </div>
          </div>
        </Section>

        <Section id="cards" title="Image mat & product card">
          <div className={s.cards}>
            <ProductCard href="/products/p1" art="p1" index="N° 001" title="Aaruul gift tin, assorted" brand="Tal Pantry" price="₮45,000" badges={<Badge tone="new">New</Badge>} matAction={<IconButton icon="heart" label="Save" />} action={<Button variant="secondary" fullWidth>Quick view</Button>} />
            <ProductCard href="/products/p7" art="p7" index="N° 007" title="Porcelain bowl, silver rim" brand="Ger & Hearth" price="₮68,000" matAction={<IconButton icon="heart" label="Save" pressed />} action={<Button variant="secondary" fullWidth>Quick view</Button>} />
            <ImageMat art="p12" size="feature" index="N° 012" />
          </div>
        </Section>

        <Section id="gallery" title="Gallery & options">
          <div className={s.grid2}>
            <Gallery slides={gallerySlides(getProduct("p12")!, dictionaries.en, "en")} label="Tsagaan Sar gift box" index="N° 012" />
            <OptionGroup
              label="Size"
              value={size}
              onChange={setSize}
              options={[
                { id: "300", label: "300 g", note: "−₮15,000" },
                { id: "500", label: "500 g" },
                { id: "1000", label: "1 kg", note: "+₮38,000" },
              ]}
            />
          </div>
        </Section>

        <Section id="empty" title="Empty states">
          <div className={s.empties}>
            <EmptyState icon="bag" title="Your cart is empty" text="Browse sweets, tea and cashmere." action={<Button iconAfter="arrow">Browse gifts</Button>} />
            <EmptyState icon="heart" title="Nothing saved yet" text="Tap the heart on any item to keep it here." action={<Button variant="secondary">Browse items</Button>} />
            <EmptyState icon="search" title="No results found" text="Try a different word." action={<Button variant="secondary">Clear search</Button>} />
            <EmptyState icon="box" title="No orders yet" text="When you place an order it will show up here." action={<Button iconAfter="arrow">Start shopping</Button>} />
            <EmptyState icon="filter" title="No items match" text="Try removing a filter." action={<Button variant="secondary">Clear all filters</Button>} />
          </div>
        </Section>

        <Section id="overlays" title="Overlays">
          <div className={s.row}>
            <Button variant="secondary" onClick={() => setSheet("bottom")}>
              Bottom sheet
            </Button>
            <Button variant="secondary" onClick={() => setSheet("left")}>
              Drawer
            </Button>
          </div>
        </Section>
      </div>

      <Sheet open={!!sheet} side={sheet === "left" ? "left" : "bottom"} onClose={() => setSheet("")} title="Sheet" footer={<Button fullWidth onClick={() => setSheet("")}>Done</Button>}>
        <p className="body">Bottom sheets become centered dialogs at ≥720px. Esc or the backdrop closes them; focus is trapped inside.</p>
      </Sheet>
    </PageShell>
  );
}
