// ThinkPost AI — Read-Only Mode REST API
// PUT /api/settings/read-only-mode — Toggle MCP write access

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as usersService from '@/lib/services/users.service';
import { handleApiError } from '@/lib/errors/error-handler';
import { z } from 'zod';

const readOnlyModeSchema = z.object({
  enabled: z.boolean({
    error: 'The "enabled" field must be true or false.',
  }),
});

export async function PUT(request: Request) {
  try {
    const { userId } = await authenticateRequest();
    const body = await request.json();
    const { enabled } = readOnlyModeSchema.parse(body);
    await usersService.setReadOnlyMode(userId, enabled);
    return NextResponse.json({ read_only_mode: enabled });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const { userId } = await authenticateRequest();
    const enabled = await usersService.getReadOnlyMode(userId);
    return NextResponse.json({ read_only_mode: enabled });
  } catch (error) {
    return handleApiError(error);
  }
}
