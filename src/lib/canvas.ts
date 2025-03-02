export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });
};

export const blobToImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(blob);
  });
};

export const drawBlobToCanvas = async (
  ctx: CanvasRenderingContext2D,
  blob: Blob,
): Promise<void> => {
  const img = await blobToImage(blob);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src); // Prevent memory leaks
};
