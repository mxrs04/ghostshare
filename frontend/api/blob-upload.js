import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Hier erlauben wir die Optionen, die der Client sendet
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain', 'application/zip'],

          // WICHTIG: Das hier behebt deinen Fehler!
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

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
