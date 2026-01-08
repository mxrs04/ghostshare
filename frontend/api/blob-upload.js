import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request, response) {
  const body = request.body;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/webm',
            'application/pdf',
            'text/plain',
            'application/zip'
          ],
          // WICHTIG: Hier erlauben wir explizit alle Optionen, die der Client senden könnte
          allowedRequestBodyOptions: [
            'addRandomSuffix',
            'cacheControlMaxAge',
            'allowOverwrite'
          ],
          tokenPayload: JSON.stringify({
            // optional: user infos
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    response.status(200).json(jsonResponse);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
