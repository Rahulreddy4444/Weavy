import { task } from "@trigger.dev/sdk/v3";

export const extractFrame = task({
  id: "extract-frame",
  run: async (payload: {
    videoUrl: string;
    timestamp: string;
  }) => {
    console.log("Starting frame extraction", payload);

    try {
      // Parse timestamp
      let seekTime: string;
      if (payload.timestamp.includes('%')) {
        // For simplicity in this example, we'll use 00:00:00
        // In production, you'd fetch video duration first
        seekTime = '00:00:00';
      } else {
        // Seconds-based
        const seconds = parseFloat(payload.timestamp);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        seekTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      // Extract frame using Transloadit
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
              url: payload.videoUrl,
            },
            extract: {
              use: 'import',
              robot: '/video/encode',
              ffmpeg_stack: 'v4.3.1',
              ffmpeg: {
                ss: seekTime,
                vframes: '1',
                f: 'image2',
              },
            },
            export: {
              use: 'extract',
              robot: '/http/export',
              url: 'https://cdn.transloadit.com/',
            },
          },
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error('Frame extraction failed: ' + result.message);
      }

      // Wait for assembly
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

      const frameUrl = assemblyResult.results?.export?.[0]?.ssl_url;

      if (!frameUrl) {
        throw new Error('No frame URL in result');
      }

      console.log("Frame extraction completed", { frameUrl });

      return {
        success: true,
        extractedFrameUrl: frameUrl,
      };
    } catch (error: any) {
      console.error("Frame extraction failed", { error: error.message });
      throw error;
    }
  },
});