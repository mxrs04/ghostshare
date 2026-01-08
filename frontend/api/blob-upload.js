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
            'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm',
            'application/pdf', 'text/plain', 'application/zip'
          ],
          // HIER LIEGT DER FEHLER: Diese Liste muss alle Optionen enthalten, die dein Frontend sendet.
          // Füge sicherheitshalber alle drei hinzu, die in der Fehlermeldung stehen.
          allowedRequestBodyOptions: [
            'addRandomSuffix',
            'cacheControlMaxAge',
            'allowOverwrite'
          ],
          tokenPayload: JSON.stringify({}),
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
