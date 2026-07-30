// ThinkPost AI — Memories REST API
// GET /api/memories — List memories (filter by category)
// POST /api/memories — Create memory

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as memoriesService from '@/lib/services/memories.service';
import { getMemoriesQuerySchema } from '@/lib/validation/memories.schema';
import { handleApiError } from '@/lib/errors/error-handler';
import type { MemoryCategory } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await authenticateRequest();

    const { searchParams } = new URL(request.url);
    const query = getMemoriesQuerySchema.parse({
      category: searchParams.get('category') || undefined,
    });

    const memories = await memoriesService.getMemories(userId, query.category as MemoryCategory | undefined);
    return NextResponse.json({ data: memories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authenticateRequest();
    const body = await request.json();
    const memory = await memoriesService.createMemory(userId, body);
    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
