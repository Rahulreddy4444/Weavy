import { task } from "@trigger.dev/sdk/v3";

export const cropImage = task({
  id: "crop-image",
  run: async (payload: {
    imageUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  }) => {
    console.log("Starting image crop", payload);

    try {
      // Call Transloadit API for image processing
      const response = await fetch('https://api2.transloadit.com/assemblies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth: {
            key: process.env.TRANSLOADIT_KEY!,
          },
          steps: {
            import: {
              robot: '/http/import',
              url: payload.imageUrl,
            },
            crop: {
              use: 'import',
              robot: '/image/resize',
              crop: {
                x1: payload.xPercent,
                y1: payload.yPercent,
                x2: payload.xPercent + payload.widthPercent,
                y2: payload.yPercent + payload.heightPercent,
                type: 'percent',
              },
            },
            export: {
              use: 'crop',
              robot: '/http/export',
              url: `https://cdn.transloadit.com/`,
            },
          },
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error('Crop failed: ' + result.message);
      }

      // Wait for assembly to complete
      const assemblyUrl = result.assembly_url;
      let assemblyResult;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(assemblyUrl);
        assemblyResult = await statusResponse.json();

        if (assemblyResult.ok && assemblyResult.ok === 'ASSEMBLY_COMPLETED') {
          break;
        }

        if (assemblyResult.error) {
          throw new Error(assemblyResult.error);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }

      const croppedUrl = assemblyResult.results?.export?.[0]?.ssl_url;

      if (!croppedUrl) {
        throw new Error('No cropped image URL in result');
      }

      console.log("Image crop completed", { croppedUrl });

      return {
        success: true,
        croppedUrl,
      };
    } catch (error: any) {
      console.error("Image crop failed", { error: error.message });
      throw error;
    }
  },
});