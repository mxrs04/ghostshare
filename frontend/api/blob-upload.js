// frontend/api/blob-upload.js
import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  const body = request.body;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Hier könnte man prüfen, ob der User eingeloggt ist.
        // Da GhostShare offen ist, erlauben wir es einfach.
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'application/pdf', 'application/zip'],
          // Du kannst hier weitere Typen erlauben oder '*' für alles.
          tokenPayload: JSON.stringify({
            // optional payload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Wird aufgerufen wenn der Upload fertig ist
        console.log('Upload fertig:', blob.url);
      },
    });
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
