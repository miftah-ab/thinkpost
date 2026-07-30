// ThinkPost AI — Posts REST API
// GET /api/posts — List drafts (paginated)
// POST /api/posts — Save draft

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as postsService from '@/lib/services/posts.service';
import { getPostsQuerySchema } from '@/lib/validation/posts.schema';
import { handleApiError } from '@/lib/errors/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest();

    const { searchParams } = new URL(request.url);
    const query = getPostsQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      status: searchParams.get('status') || undefined,
    });

    const result = await postsService.getPosts(userId, query);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authenticateRequest();
    const body = await request.json();
    const post = await postsService.createPost(userId, body);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
