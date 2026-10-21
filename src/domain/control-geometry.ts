const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export function wheelSelection(x: number, y: number, width: number, height: number, previousHue: number) {
  const dx = x - width / 2, dy = y - height / 2;
  const radius = Math.min(width, height) / 2;
  if (radius <= 0) return { hue: previousHue, saturation: 0 };
  const distance = Math.hypot(dx, dy);
  return {
    hue: distance < .5 ? previousHue : (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360,
    saturation: clamp(distance / radius, 0, 1),
  };
}

export function wheelMarker(hue: number, saturation: number) {
  const angle = hue * Math.PI / 180;
  return { x: 50 + Math.cos(angle) * saturation * 50, y: 50 + Math.sin(angle) * saturation * 50 };
}

export function dimmerSelection(y: number, height: number) {
  return height <= 0 ? 1 : clamp(Math.round((1 - y / height) * 100), 1, 100);
}
