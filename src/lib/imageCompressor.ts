/**
 * Compresses and reduces the file size of any uploaded image.
 * Ensures the output is a Base64 string under 2MB (2,097,152 bytes) using iterative quality & scale reductions.
 */
export async function reduceImageSize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const maxFinalSize = 2 * 1024 * 1024; // 2MB binary limit

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to create canvas context"));
          return;
        }

        // Downscale large image resolutions immediately (e.g. 4K images) to prevent memory bloating
        const maxDimension = 1200; // Perfect crisp resolution for a profile avatar
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        let quality = 0.85; // highly efficient initial compression quality
        let scale = 1.0;
        let dataUrl = "";
        let size = Infinity;
        const maxIterations = 8;
        let iteration = 0;

        while (size > maxFinalSize && iteration < maxIterations) {
          iteration++;

          const targetWidth = Math.round(width * scale);
          const targetHeight = Math.round(height * scale);

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Standard compressed JPEG string
          dataUrl = canvas.toDataURL("image/jpeg", quality);

          // Get exact Base64 payload size in bytes
          const base64Part = dataUrl.split(",")[1] || dataUrl;
          size = base64Part.length * 0.75;

          if (size > maxFinalSize) {
            if (quality > 0.4) {
              quality -= 0.15; // lower quality first to preserve resolution
            } else {
              scale *= 0.7; // downscale dimensions if quality reduction isn't enough
              quality = 0.7;
            }
          }
        }

        // Emergency safety cutoff
        if (size > maxFinalSize) {
          canvas.width = 250;
          canvas.height = 250;
          ctx.clearRect(0, 0, 250, 250);
          ctx.drawImage(img, 0, 0, 250, 250);
          dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
