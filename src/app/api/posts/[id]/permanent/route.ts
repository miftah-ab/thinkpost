// ThinkPost AI — Permanent Delete REST API
// DELETE /api/posts/:id/permanent — Hard-delete an already-archived draft

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as postsService from '@/lib/services/posts.service';
import { handleApiError } from '@/lib/errors/error-handler';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest();
    const { id } = await params;
    await postsService.permanentDeletePost(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
