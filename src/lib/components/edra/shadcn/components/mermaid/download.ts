/** Serialize the rendered SVG and trigger a PNG download. */
export function downloadDiagramAsPng(svg: SVGSVGElement): void {
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const DOMURL = window.URL || window.webkitURL || window;
  const url = DOMURL.createObjectURL(svgBlob);

  const rect = svg.getBoundingClientRect();
  const viewBoxWidth = svg.viewBox?.baseVal?.width;
  const viewBoxHeight = svg.viewBox?.baseVal?.height;

  const width = viewBoxWidth && viewBoxWidth > 0 ? viewBoxWidth : rect.width || 800;
  const height = viewBoxHeight && viewBoxHeight > 0 ? viewBoxHeight : rect.height || 600;

  const dpr = window.devicePixelRatio;
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(dpr, dpr);
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "mermaid-diagram.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    DOMURL.revokeObjectURL(url);
  };

  image.src = url;
}
