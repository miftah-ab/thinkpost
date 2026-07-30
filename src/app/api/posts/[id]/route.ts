// ThinkPost AI — Post Detail REST API
// PATCH /api/posts/:id — Update draft / change status
// DELETE /api/posts/:id — Archive draft (soft delete)

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as postsService from '@/lib/services/posts.service';
import { handleApiError } from '@/lib/errors/error-handler';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest();
    const { id } = await params;
    const post = await postsService.getPost(userId, id);
    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest();
    const { id } = await params;
    const body = await request.json();
    const post = await postsService.updatePost(userId, id, body);
    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest();
    const { id } = await params;
    const post = await postsService.archivePost(userId, id);
    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}
