// ThinkPost AI — Memory Delete REST API
// DELETE /api/memories/:id — Delete memory

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as memoriesService from '@/lib/services/memories.service';
import { handleApiError } from '@/lib/errors/error-handler';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authenticateRequest();
    const { id } = await params;
    await memoriesService.deleteMemory(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
