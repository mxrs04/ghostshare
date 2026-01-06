import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'nodejs', // HIER GEÄNDERT: Von 'edge' zu 'nodejs'
};

export default async function handler(request, response) {
  // In der Node.js Runtime wird der Body automatisch geparst, wenn er JSON ist
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
          allowedRequestBodyOptions: [
            'addRandomSuffix',
            'cacheControlMaxAge'
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

    // Node.js Syntax für die Antwort
    response.status(200).json(jsonResponse);
  } catch (error) {
    // Node.js Syntax für Fehler
    response.status(400).json({ error: error.message });
  }
}
