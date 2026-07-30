// ThinkPost AI — Writing Style REST API
// GET /api/writing-style — Fetch style
// PUT /api/writing-style — Update style

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as writingStyleService from '@/lib/services/writing-style.service';
import { handleApiError } from '@/lib/errors/error-handler';

export async function GET() {
  try {
    const { userId } = await authenticateRequest();
    const style = await writingStyleService.getWritingStyle(userId);
    return NextResponse.json(style);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await authenticateRequest();
    const body = await request.json();
    const style = await writingStyleService.updateWritingStyle(userId, body);
    return NextResponse.json(style);
  } catch (error) {
    return handleApiError(error);
  }
}
