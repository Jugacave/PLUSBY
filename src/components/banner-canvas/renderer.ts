import { toPng } from "html-to-image";

// Render an HTML element (the banner template div) to a PNG data URL.
// scale: 2 gives 2160x3840 @ 2x = near-4K quality.
export async function renderBannerToPng(
  element: HTMLElement,
  scale = 2,
): Promise<string> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: scale,
    // Ensure cross-origin images are fetched properly
    fetchRequestInit: { mode: "cors" },
  });
  return dataUrl;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
