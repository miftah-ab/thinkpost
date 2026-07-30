// ThinkPost AI — Account Deletion REST API
// DELETE /api/account — Delete account (cascades all data, immediate, no grace period)

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import * as usersService from '@/lib/services/users.service';
import { handleApiError } from '@/lib/errors/error-handler';

export async function DELETE() {
  try {
    const { userId } = await authenticateRequest();
    await usersService.deleteAccount(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
