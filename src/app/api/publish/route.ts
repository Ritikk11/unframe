import { NextRequest, NextResponse } from 'next/server';
import {
  createSingleMediaContainer,
  createCarouselItemContainer,
  createCarouselParentContainer,
  checkMediaContainerStatus,
  publishContainer,
} from '@/lib/meta';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { igUserId, accessToken, imageUrls, caption } = body;

    if (!igUserId || !accessToken) {
      return NextResponse.json(
        { error: 'Instagram account authentication is required to publish.' },
        { status: 401 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please add at least one photo to publish.' },
        { status: 400 }
      );
    }

    if (imageUrls.length > 10) {
      return NextResponse.json(
        { error: 'Instagram allows a maximum of 10 photos per post.' },
        { status: 400 }
      );
    }

    let creationIdToPublish = '';

    if (imageUrls.length === 1) {
      // Single photo container
      creationIdToPublish = await createSingleMediaContainer(
        igUserId,
        imageUrls[0],
        caption || '',
        accessToken
      );
    } else {
      // Multi-photo carousel container
      const childContainerIds: string[] = [];
      for (const url of imageUrls) {
        const childId = await createCarouselItemContainer(igUserId, url, accessToken);
        childContainerIds.push(childId);
      }

      creationIdToPublish = await createCarouselParentContainer(
        igUserId,
        childContainerIds,
        caption || '',
        accessToken
      );
    }

    // Wait for container to be ready (up to 15 seconds)
    // For single images, Instagram creates containers synchronously and status_code is FINISHED or omitted
    for (let attempt = 0; attempt < 15; attempt++) {
      try {
        const status = await checkMediaContainerStatus(creationIdToPublish, accessToken);
        if (!status?.status_code || status.status_code === 'FINISHED') {
          break;
        }
        if (status.status_code === 'ERROR') {
          throw new Error('Instagram failed to process media container.');
        }
      } catch (err) {
        // If status endpoint errors or still in progress, continue waiting briefly
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Publish container
    const publishRes = await publishContainer(igUserId, creationIdToPublish, accessToken);

    return NextResponse.json({
      success: true,
      postId: publishRes.id,
      permalink: `https://www.instagram.com/p/${publishRes.id}/`,
      message: 'Published successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Publish failed';
    console.error('API /publish error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
