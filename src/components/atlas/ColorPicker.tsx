import { useState, useRef, useCallback } from 'react';
import { Pipette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(50);
  const [hexInput, setHexInput] = useState(value);
  const hueRef = useRef<HTMLDivElement>(null);
  const sbRef = useRef<HTMLDivElement>(null);

  const hslToHex = useCallback((h: number, s: number, l: number) => {
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  const currentColor = hslToHex(hue, saturation, brightness);

  const handleHueInteraction = useCallback((clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newHue = Math.round((x / rect.width) * 360);
    setHue(newHue);
    const color = hslToHex(newHue, saturation, brightness);
    onChange(color);
    setHexInput(color);
  }, [saturation, brightness, hslToHex, onChange]);

  const handleSBInteraction = useCallback((clientX: number, clientY: number) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const newSat = Math.round((x / rect.width) * 100);
    const newBright = Math.round(100 - (y / rect.height) * 100);
    setSaturation(newSat);
    setBrightness(newBright);
    const color = hslToHex(hue, newSat, newBright);
    onChange(color);
    setHexInput(color);
  }, [hue, hslToHex, onChange]);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val);
    }
  };

  const startDrag = (handler: (x: number, y: number) => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const getCoords = (ev: MouseEvent | TouchEvent) => {
      if ('touches' in ev) return [ev.touches[0].clientX, ev.touches[0].clientY];
      return [ev.clientX, ev.clientY];
    };

    const coords = 'touches' in e ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
    handler(coords[0], coords[1]);

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const [cx, cy] = getCoords(ev);
      handler(cx, cy);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  return (
    <div className="relative inline-block">
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center hover:border-primary/60 transition-colors duration-150"
      >
        <Pipette className="w-3.5 h-3.5 text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-2 left-0 w-56 p-3 rounded-xl bg-card border border-border shadow-atlas-lg"
          >
            {/* Saturation/Brightness Area */}
            <div
              ref={sbRef}
              className="relative w-full h-32 rounded-lg cursor-crosshair mb-3 overflow-hidden"
              style={{
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
                `,
              }}
              onMouseDown={startDrag((x, y) => handleSBInteraction(x, y))}
              onTouchStart={startDrag((x, y) => handleSBInteraction(x, y))}
            >
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                  backgroundColor: currentColor,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div
              ref={hueRef}
              className="relative w-full h-3 rounded-full cursor-pointer mb-3"
              style={{
                background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              }}
              onMouseDown={startDrag((x) => handleHueInteraction(x))}
              onTouchStart={startDrag((x) => handleHueInteraction(x))}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  backgroundColor: `hsl(${hue}, 100%, 50%)`,
                }}
              />
            </div>

            {/* Hex Input + Preview */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg shrink-0 border border-border"
                style={{ backgroundColor: currentColor }}
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                maxLength={7}
                className="flex-1 text-xs font-mono bg-secondary/50 border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
