"use client";
/* User-selected blob URLs require native img elements; framework image optimization cannot handle them. */
/* eslint-disable @next/next/no-img-element */
import {
  ChangeEvent,
  FormEvent,
  PointerEvent as PE,
  useEffect,
  useRef,
  useState,
} from "react";

type Layer = {
  id: number;
  kind?: "text" | "image";
  text: string;
  x: number;
  y: number;
  size: number;
  weight: number;
  color: string;
  align: "left" | "center" | "right";
  caps: boolean;
  tracking: number;
  font: string;
  lineHeight: number;
  opacity: number;
  rotation: number;
  italic: boolean;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  src?: string;
  name?: string;
  width?: number;
  aspect?: number;
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
};
const formats = [
  ["Square post", 1080, 1080],
  ["Portrait", 1080, 1350],
  ["Story / Reel", 1080, 1920],
  ["Landscape", 1200, 628],
] as const;
const popularFonts = ["Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"];
const seed: Layer[] = [
  {
    id: 1,
    kind: "text",
    text: "MAKE IT\nUNMISSABLE.",
    x: 9,
    y: 55,
    size: 84,
    weight: 800,
    color: "#f7f4ed",
    align: "left",
    caps: false,
    tracking: -3,
    font: "Montserrat",
    lineHeight: 0.92,
    opacity: 100,
    rotation: 0,
    italic: false,
    shadow: true,
    shadowColor: "#000000",
    shadowBlur: 18,
  },
  {
    id: 2,
    kind: "text",
    text: "New collection — 2026",
    x: 9,
    y: 88,
    size: 22,
    weight: 500,
    color: "#f7f4ed",
    align: "left",
    caps: true,
    tracking: 3,
    font: "Open Sans",
    lineHeight: 1.1,
    opacity: 100,
    rotation: 0,
    italic: false,
    shadow: false,
    shadowColor: "#000000",
    shadowBlur: 8,
  },
];
export default function Home() {
  const [format, setFormat] = useState<(typeof formats)[number]>(formats[0]),
    [layers, setLayers] = useState(seed),
    [selected, setSelected] = useState(1),
    [image, setImage] = useState(""),
    [scale, setScale] = useState(100),
    [position, setPosition] = useState(50),
    [positionY, setPositionY] = useState(50),
    [overlay, setOverlay] = useState(42),
    [a, setA] = useState("#13201b"),
    [b, setB] = useState("#b84a2b"),
    [angle, setAngle] = useState(135),
    [zoom, setZoom] = useState(58),
    [fonts, setFonts] = useState(popularFonts),
    [fontInput, setFontInput] = useState("");
  const file = useRef<HTMLInputElement>(null),
    layerFile = useRef<HTMLInputElement>(null),
    drag = useRef<{ id: number; dx: number; dy: number } | null>(null),
    ready = useRef(false),
    active = layers.find((x) => x.id === selected);
  useEffect(() => {
    popularFonts.forEach(loadFont);
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("frame-design") || "null",
        );
        if (saved) {
          setFormat(formats.find((f) => f[0] === saved.format) || formats[0]);
          setLayers(saved.layers?.map((l: Layer) => normalizeLayer(l)) || seed);
          setSelected(saved.selected || 1);
          setImage(saved.image || "");
          setScale(saved.scale || 100);
          setPosition(saved.position ?? 50);
          setPositionY(saved.positionY ?? 50);
          setOverlay(saved.overlay ?? 42);
          setA(saved.a || "#13201b");
          setB(saved.b || "#b84a2b");
          setAngle(saved.angle ?? 135);
          setFonts(saved.fonts || popularFonts);
          (saved.fonts || popularFonts).forEach(loadFont);
        }
      } catch (error) {
        console.warn("Could not restore the local draft.", error);
      }
      ready.current = true;
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (ready.current)
      try {
        localStorage.setItem(
          "frame-design",
          JSON.stringify({
            format: format[0],
            layers,
            selected,
            image,
            scale,
            position,
            positionY,
            overlay,
            a,
            b,
            angle,
            fonts,
          }),
        );
      } catch (error) {
        console.warn("Could not save the local draft.", error);
      }
  }, [
    format,
    layers,
    selected,
    image,
    scale,
    position,
    positionY,
    overlay,
    a,
    b,
    angle,
    fonts,
  ]);
  const update = (v: Partial<Layer>) =>
    setLayers((xs) => xs.map((x) => (x.id === selected ? { ...x, ...v } : x)));
  const reset = () => {
    localStorage.removeItem("frame-design");
    setFormat(formats[0]);
    setLayers(seed);
    setSelected(1);
    setImage("");
    setScale(100);
    setPosition(50);
    setPositionY(50);
    setOverlay(42);
    setA("#13201b");
    setB("#b84a2b");
    setAngle(135);
    setFonts(popularFonts);
  };
  const add = () => {
    const id = Date.now();
    setLayers((xs) => [
      ...xs,
      {
        id,
        kind: "text",
        text: "Your message",
        x: 15,
        y: 30,
        size: 52,
        weight: 700,
        color: "#ffffff",
        align: "left",
        caps: false,
        tracking: 0,
        font: "Montserrat",
        lineHeight: 1,
        opacity: 100,
        rotation: 0,
        italic: false,
        shadow: false,
        shadowColor: "#000000",
        shadowBlur: 12,
      },
    ]);
    setSelected(id);
  };
  const removeLayer = (id: number) => {
    const remaining = layers.filter((layer) => layer.id !== id);
    setLayers(remaining);
    if (selected === id) setSelected(remaining.at(-1)?.id ?? 0);
  };
  const addFont = (e: FormEvent) => {
    e.preventDefault();
    const name = fontInput
      .trim()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, " ");
    if (!name) return;
    loadFont(name);
    setFonts((xs) =>
      xs.some((x) => x.toLowerCase() === name.toLowerCase())
        ? xs
        : [...xs, name],
    );
    if (active) update({ font: name });
    setFontInput("");
  };
  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };
  const addImageLayer = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const preview = new Image();
      preview.onload = () => {
        const id = Date.now();
        setLayers((current) => [
          ...current,
          {
            ...seed[0],
            id,
            kind: "image",
            text: "",
            src,
            name: selectedFile.name,
            x: 25,
            y: 25,
            width: 50,
            aspect: preview.width / preview.height,
            radius: 0,
            borderWidth: 0,
            borderColor: "#ffffff",
            rotation: 0,
            opacity: 100,
            shadow: false,
          },
        ]);
        setSelected(id);
        e.target.value = "";
      };
      preview.src = src;
    };
    reader.readAsDataURL(selectedFile);
  };
  const down = (e: PE, l: Layer) => {
    const r = e.currentTarget.parentElement!.getBoundingClientRect();
    drag.current = {
      id: l.id,
      dx: e.clientX - r.left - (r.width * l.x) / 100,
      dy: e.clientY - r.top - (r.height * l.y) / 100,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PE) => {
    const currentDrag = drag.current;
    if (!currentDrag) return;
    const r = e.currentTarget.parentElement!.getBoundingClientRect(),
      x = Math.max(
        0,
        Math.min(92, ((e.clientX - r.left - currentDrag.dx) / r.width) * 100),
      ),
      y = Math.max(
        0,
        Math.min(94, ((e.clientY - r.top - currentDrag.dy) / r.height) * 100),
      );
    setLayers((xs) =>
      xs.map((l) => (l.id === currentDrag.id ? { ...l, x, y } : l)),
    );
  };
  async function exportPost() {
    const c = document.createElement("canvas"),
      w = format[1],
      h = format[2];
    c.width = w;
    c.height = h;
    const x = c.getContext("2d")!;
    x.fillStyle = makeGradient(x, w, h, angle, a, b);
    x.fillRect(0, 0, w, h);
    if (image) {
      const im = new Image();
      im.src = image;
      await im.decode();
      const s = (Math.max(w / im.width, h / im.height) * scale) / 100,
        iw = im.width * s,
        ih = im.height * s;
      x.drawImage(
        im,
        ((w - iw) * position) / 100,
        ((h - ih) * positionY) / 100,
        iw,
        ih,
      );
      x.globalAlpha = overlay / 100;
      x.fillStyle = makeGradient(x, w, h, angle, a, b);
      x.fillRect(0, 0, w, h);
      x.globalAlpha = 1;
    }
    for (const raw of layers) {
      const l = normalizeLayer(raw);
      x.save();
      x.globalAlpha = l.opacity / 100;
      if (l.kind === "image" && l.src) {
        const layerImage = new Image();
        layerImage.src = l.src;
        await layerImage.decode();
        const imageWidth = ((l.width ?? 50) / 100) * w;
        const imageHeight = imageWidth / (l.aspect ?? 1);
        x.translate(
          (l.x / 100) * w + imageWidth / 2,
          (l.y / 100) * h + imageHeight / 2,
        );
        x.rotate((l.rotation * Math.PI) / 180);
        x.beginPath();
        x.roundRect(
          -imageWidth / 2,
          -imageHeight / 2,
          imageWidth,
          imageHeight,
          ((l.radius ?? 0) / 100) * imageWidth,
        );
        x.clip();
        x.drawImage(
          layerImage,
          -imageWidth / 2,
          -imageHeight / 2,
          imageWidth,
          imageHeight,
        );
        if ((l.borderWidth ?? 0) > 0) {
          x.lineWidth = l.borderWidth ?? 0;
          x.strokeStyle = l.borderColor ?? "#ffffff";
          x.stroke();
        }
        x.restore();
        continue;
      }
      await document.fonts.load(`${l.weight} ${l.size}px "${l.font}"`);
      x.translate((l.x / 100) * w, (l.y / 100) * h);
      x.rotate((l.rotation * Math.PI) / 180);
      x.fillStyle = l.color;
      x.font = `${l.italic ? "italic " : ""}${l.weight} ${l.size}px "${l.font}", Arial`;
      x.textAlign = "left";
      if (l.shadow) {
        x.shadowColor = l.shadowColor;
        x.shadowBlur = l.shadowBlur;
      }
      const lines = (l.caps ? l.text.toUpperCase() : l.text).split("\n");
      const widths = lines.map((line) => measureTrackedText(x, line, l.tracking));
      const blockWidth = Math.max(...widths, 0);
      const lineHeight = l.size * l.lineHeight;
      lines.forEach((line, i) => {
        const metrics = x.measureText(line || " ");
        const ascent = metrics.actualBoundingBoxAscent || l.size * 0.8;
        const descent = metrics.actualBoundingBoxDescent || l.size * 0.2;
        const baseline = i * lineHeight + (lineHeight - ascent - descent) / 2 + ascent;
        const offset =
          l.align === "center"
            ? (blockWidth - widths[i]) / 2
            : l.align === "right"
              ? blockWidth - widths[i]
              : 0;
        drawTrackedText(x, line, offset, baseline, l.tracking);
      });
      x.restore();
    }
    const link = document.createElement("a");
    link.download = `post-${w}x${h}.png`;
    link.href = c.toDataURL();
    link.click();
  }
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <i>F</i>
          <b>FRAME</b>
          <span>Post studio</span>
        </div>
        <div>
          <button className="quiet" onClick={reset}>
            Reset
          </button>
          <button className="export" onClick={exportPost}>
            Export PNG ↗
          </button>
        </div>
      </header>
      <nav className="rail">
        <button className="on">
          ◇<small>Design</small>
        </button>
        <button onClick={() => layerFile.current?.click()}>
          ▧<small>Media</small>
        </button>
        <button onClick={add}>
          T<small>Text</small>
        </button>
      </nav>
      <input
        ref={layerFile}
        hidden
        type="file"
        accept="image/*"
        onChange={addImageLayer}
      />
      <aside className="panel left">
        <p className="eyebrow">Canvas</p>
        <h1>Create a post</h1>
        <Field label="Format">
          <select
            value={format[0]}
            onChange={(e) =>
              setFormat(formats.find((f) => f[0] === e.target.value)!)
            }
          >
            {formats.map((f) => (
              <option key={f[0]}>{f[0]}</option>
            ))}
          </select>
        </Field>
        <p className="dimensions">
          {format[1]} × {format[2]} px{" "}
          <span>{(format[1] / format[2]).toFixed(2)} ratio</span>
        </p>
        <Title
          name="Background"
          action={image ? "Replace" : "Upload"}
          click={() => file.current?.click()}
        />
        <input
          ref={file}
          hidden
          type="file"
          accept="image/*"
          onChange={upload}
        />
        <button className="upload" onClick={() => file.current?.click()}>
          {image ? (
            <img src={image} alt="Uploaded background" />
          ) : (
            <>
              <b>＋</b>
              <strong>Add an image</strong>
              <small>JPG, PNG or WebP</small>
            </>
          )}
        </button>
        {image && (
          <>
            <Range
              label="Image scale"
              value={scale}
              min={100}
              max={180}
              set={setScale}
            />
            <Range
              label="Horizontal"
              value={position}
              min={0}
              max={100}
              set={setPosition}
            />
            <Range
              label="Vertical"
              value={positionY}
              min={0}
              max={100}
              set={setPositionY}
            />
          </>
        )}
        <Title name="Color overlay" action={`${overlay}%`} />
        <div className="colors">
          <input
            type="color"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
          →
          <input
            type="color"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </div>
        <Range
          label="Opacity"
          value={overlay}
          min={0}
          max={100}
          set={setOverlay}
        />
        <Range
          label="Direction"
          value={angle}
          min={0}
          max={360}
          set={setAngle}
        />
      </aside>
      <section className="workspace">
        <label className="zoom">
          {zoom}%{" "}
          <input
            type="range"
            min="35"
            max="78"
            value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
          />
        </label>
        <div
          className="stage"
          style={{
            width: `min(${zoom}vh,680px)`,
            aspectRatio: `${format[1]}/${format[2]}`,
            background: `linear-gradient(${angle}deg,${a},${b})`,
          }}
        >
          {image && (
            <img
              className="stage-image"
              src={image}
              alt=""
              style={{
                objectPosition: `${position}% ${positionY}%`,
                transform: `scale(${scale / 100})`,
              }}
            />
          )}
          {image && (
            <div
              className="shade"
              style={{
                opacity: overlay / 100,
                background: `linear-gradient(${angle}deg,${a},${b})`,
              }}
            />
          )}
          <div className="grain" />
          {layers.map((l) =>
            l.kind === "image" ? (
              <button
                key={l.id}
                className={`image-layer ${selected === l.id ? "selected" : ""}`}
                onClick={() => setSelected(l.id)}
                onPointerDown={(e) => down(e, l)}
                onPointerMove={move}
                onPointerUp={() => (drag.current = null)}
                style={{
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  width: `${l.width ?? 50}%`,
                  aspectRatio: l.aspect,
                  opacity: l.opacity / 100,
                  transform: `rotate(${l.rotation}deg)`,
                  borderRadius: `${l.radius ?? 0}%`,
                  borderWidth: `${((l.borderWidth ?? 0) / format[1]) * 100}cqw`,
                  borderColor: l.borderColor,
                }}
              >
                <img src={l.src} alt="" />
              </button>
            ) : (
              <button
                key={l.id}
                className={`text-layer ${selected === l.id ? "selected" : ""}`}
                onClick={() => setSelected(l.id)}
                onPointerDown={(e) => down(e, l)}
                onPointerMove={move}
                onPointerUp={() => (drag.current = null)}
                style={{
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  color: l.color,
                  fontFamily: `"${l.font}", Arial, sans-serif`,
                  fontSize: `${(l.size / format[1]) * 100}cqw`,
                  fontWeight: l.weight,
                  fontStyle: l.italic ? "italic" : "normal",
                  lineHeight: l.lineHeight,
                  opacity: l.opacity / 100,
                  transform: `rotate(${l.rotation}deg)`,
                  textShadow: l.shadow
                    ? `0 0 ${(l.shadowBlur / format[1]) * 100}cqw ${l.shadowColor}`
                    : "none",
                  textAlign: l.align,
                  textTransform: l.caps ? "uppercase" : "none",
                  letterSpacing: `${(l.tracking / format[1]) * 100}cqw`,
                }}
              >
                {l.text}
              </button>
            ),
          )}
          <span className="canvas-label">FRAME / 01</span>
        </div>
      </section>
      <aside className="panel inspector">
        <div className="head">
          <div>
            <p className="eyebrow">Selected layer</p>
            <h2>{active?.kind === "image" ? "Image" : "Typography"}</h2>
          </div>
        </div>
        {active?.kind === "image" ? (
          <>
            <p className="asset-name" title={active.name}>
              {active.name || "Image layer"}
            </p>
            <Range
              label="Width"
              value={active.width ?? 50}
              min={5}
              max={100}
              set={(width) => update({ width })}
            />
            <Range
              label="Rotation"
              value={active.rotation}
              min={-180}
              max={180}
              set={(rotation) => update({ rotation })}
            />
            <Range
              label="Opacity"
              value={active.opacity}
              min={0}
              max={100}
              set={(opacity) => update({ opacity })}
            />
            <Range
              label="Corner radius"
              value={active.radius ?? 0}
              min={0}
              max={50}
              set={(radius) => update({ radius })}
            />
            <Range
              label="Border"
              value={active.borderWidth ?? 0}
              min={0}
              max={20}
              set={(borderWidth) => update({ borderWidth })}
            />
            {(active.borderWidth ?? 0) > 0 && (
              <Field label="Border color">
                <input
                  type="color"
                  value={active.borderColor}
                  onChange={(e) => update({ borderColor: e.target.value })}
                />
              </Field>
            )}
            <button
              className="duplicate"
              onClick={() => {
                const id = Date.now();
                setLayers((current) => [
                  ...current,
                  { ...active, id, x: active.x + 3, y: active.y + 3 },
                ]);
                setSelected(id);
              }}
            >
              Duplicate layer
            </button>
          </>
        ) : active ? (
          <>
            <Field label="Content">
              <textarea
                value={active.text}
                onChange={(e) => update({ text: e.target.value })}
              />
            </Field>
            <Field label="Font family">
              <select
                value={active.font}
                onChange={(e) => {
                  loadFont(e.target.value);
                  update({ font: e.target.value });
                }}
              >
                {fonts.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </Field>
            <form className="font-add" onSubmit={addFont}>
              <input
                aria-label="Google Font name"
                placeholder="Add a Google Font"
                value={fontInput}
                onChange={(e) => setFontInput(e.target.value)}
              />
              <button>Add</button>
            </form>
            <Field label="Weight">
              <div className="segments">
                {[400, 600, 800].map((n) => (
                  <button
                    type="button"
                    className={active.weight === n ? "on" : ""}
                    key={n}
                    onClick={() => update({ weight: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
            <Range
              label="Size"
              value={active.size}
              min={12}
              max={180}
              set={(size) => update({ size })}
            />
            <Range
              label="Line height"
              value={Math.round(active.lineHeight * 100)}
              min={70}
              max={180}
              set={(lineHeight) => update({ lineHeight: lineHeight / 100 })}
            />
            <Range
              label="Tracking"
              value={active.tracking}
              min={-8}
              max={30}
              set={(tracking) => update({ tracking })}
            />
            <Range
              label="Rotation"
              value={active.rotation}
              min={-180}
              max={180}
              set={(rotation) => update({ rotation })}
            />
            <Range
              label="Opacity"
              value={active.opacity}
              min={0}
              max={100}
              set={(opacity) => update({ opacity })}
            />
            <Field label="Color & alignment">
              <div className="inline">
                <input
                  type="color"
                  value={active.color}
                  onChange={(e) => update({ color: e.target.value })}
                />
                {(["left", "center", "right"] as const).map((v) => (
                  <button
                    type="button"
                    className={active.align === v ? "on" : ""}
                    key={v}
                    onClick={() => update({ align: v })}
                  >
                    {v === "left" ? "≡" : v === "center" ? "≣" : "☰"}
                  </button>
                ))}
              </div>
            </Field>
            <div className="toggle-grid">
              <Toggle
                label="Uppercase"
                checked={active.caps}
                set={(caps) => update({ caps })}
              />
              <Toggle
                label="Italic"
                checked={active.italic}
                set={(italic) => update({ italic })}
              />
              <Toggle
                label="Shadow"
                checked={active.shadow}
                set={(shadow) => update({ shadow })}
              />
            </div>
            {active.shadow && (
              <div className="shadow-controls">
                <Field label="Shadow color">
                  <input
                    type="color"
                    value={active.shadowColor}
                    onChange={(e) => update({ shadowColor: e.target.value })}
                  />
                </Field>
                <Range
                  label="Shadow blur"
                  value={active.shadowBlur}
                  min={0}
                  max={60}
                  set={(shadowBlur) => update({ shadowBlur })}
                />
              </div>
            )}
            <button
              className="duplicate"
              onClick={() => {
                const id = Date.now();
                setLayers((xs) => [
                  ...xs,
                  { ...active, id, x: active.x + 3, y: active.y + 3 },
                ]);
                setSelected(id);
              }}
            >
              Duplicate layer
            </button>
          </>
        ) : (
          <button className="duplicate" onClick={add}>
            Add text layer
          </button>
        )}
        <div className="layer-list">
          <div className="layer-list-head">
            <b>Layers</b>
            <div>
              <button onClick={add}>＋ Text</button>
              <button onClick={() => layerFile.current?.click()}>
                ＋ Image
              </button>
            </div>
          </div>
          {[...layers].reverse().map((l) => (
            <div className="layer-row" key={l.id}>
              <button
                className={`layer-select ${l.id === selected ? "on" : ""}`}
                onClick={() => setSelected(l.id)}
              >
                <b>{l.kind === "image" ? "▧" : "T"}</b>
                <span>
                  {l.kind === "image"
                    ? l.name || "Image layer"
                    : l.text.replace("\n", " ")}
                </span>
              </button>
              <button
                className="layer-delete"
                aria-label={`Delete ${l.kind === "image" ? l.name || "image layer" : l.text.replace("\n", " ")}`}
                title="Delete layer"
                onClick={() => removeLayer(l.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Title({
  name,
  action,
  click,
}: {
  name: string;
  action: string;
  click?: () => void;
}) {
  return (
    <div className="title">
      <b>{name}</b>
      <button onClick={click}>{action}</button>
    </div>
  );
}
function Range({
  label,
  value,
  min,
  max,
  set,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  set: (n: number) => void;
}) {
  return (
    <label className="range">
      <span>
        {label}
        <small>
          {value}
          {label === "Direction" ? "°" : ""}
        </small>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => set(+e.target.value)}
      />
    </label>
  );
}
function Toggle({
  label,
  checked,
  set,
}: {
  label: string;
  checked: boolean;
  set: (value: boolean) => void;
}) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => set(e.target.checked)}
      />
      <i />
      {label}
    </label>
  );
}
function makeGradient(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  degrees: number,
  start: string,
  end: string,
) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  const length = Math.abs(width * dx) + Math.abs(height * dy);
  const centerX = width / 2;
  const centerY = height / 2;
  const gradient = context.createLinearGradient(
    centerX - (dx * length) / 2,
    centerY - (dy * length) / 2,
    centerX + (dx * length) / 2,
    centerY + (dy * length) / 2,
  );
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  return gradient;
}
function measureTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  tracking: number,
) {
  return context.measureText(text).width + Math.max(0, text.length - 1) * tracking;
}
function drawTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  if (tracking === 0) {
    context.fillText(text, x, y);
    return;
  }
  for (const character of text) {
    context.fillText(character, x, y);
    x += context.measureText(character).width + tracking;
  }
}
function loadFont(name: string) {
  if (document.querySelector(`link[data-font="${CSS.escape(name)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.font = name;
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}
function normalizeLayer(layer: Layer): Layer {
  return {
    ...layer,
    kind: layer.kind || "text",
    font: layer.font || "Montserrat",
    lineHeight: layer.lineHeight ?? 1,
    opacity: layer.opacity ?? 100,
    rotation: layer.rotation ?? 0,
    italic: layer.italic ?? false,
    shadow: layer.shadow ?? false,
    shadowColor: layer.shadowColor || "#000000",
    shadowBlur: layer.shadowBlur ?? 12,
    width: layer.width ?? 50,
    aspect: layer.aspect ?? 1,
    radius: layer.radius ?? 0,
    borderWidth: layer.borderWidth ?? 0,
    borderColor: layer.borderColor || "#ffffff",
  };
}
