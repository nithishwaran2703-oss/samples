import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

function extractFileKey(url: string): string | null {
  if (!url) return null;
  // UploadThing URLs are in the format https://utfs.io/f/FILE_KEY or similar
  const match = url.match(/\/f\/([^?#]+)/);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  try {
    const { urls } = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ success: true, message: 'No URLs provided' });
    }

    // Extract key from each URL and filter out nulls
    const fileKeys = urls
      .map((url: string) => extractFileKey(url))
      .filter((key): key is string => !!key);

    if (fileKeys.length === 0) {
      return NextResponse.json({ success: true, message: 'No valid UploadThing file keys found' });
    }

    console.log('Deleting file keys from UploadThing:', fileKeys);
    
    // Trigger unlinking/deletion from UploadThing
    const deleteResult = await utapi.deleteFiles(fileKeys);
    
    console.log('UploadThing deletion completed successfully:', deleteResult);

    return NextResponse.json({ success: true, result: deleteResult });
  } catch (error: any) {
    console.error('Failed to delete from UploadThing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
