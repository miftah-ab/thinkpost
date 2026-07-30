// ThinkPost AI — Profile REST API
// GET /api/profile — Fetch profile
// PUT /api/profile — Update profile

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as profileService from '@/lib/services/profile.service';
import { handleApiError } from '@/lib/errors/error-handler';

export async function GET() {
  try {
    const { userId } = await authenticateRequest();
    const profile = await profileService.getProfile(userId);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await authenticateRequest();
    const body = await request.json();
    const profile = await profileService.updateProfile(userId, body);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
