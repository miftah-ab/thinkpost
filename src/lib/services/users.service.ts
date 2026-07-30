// ThinkPost AI — Users Service
// Business logic for user management.

import * as usersRepo from '@/lib/db/users.repo';
import { serverError } from '@/lib/errors/app-error';

/**
 * Get the read_only_mode setting.
 */
export async function getReadOnlyMode(userId: string): Promise<boolean> {
  try {
    return await usersRepo.getReadOnlyMode(userId);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Set the read_only_mode setting.
 */
export async function setReadOnlyMode(userId: string, enabled: boolean): Promise<void> {
  try {
    await usersRepo.setReadOnlyMode(userId, enabled);
  } catch (error) {
    throw serverError(error);
  }
}

/**
 * Delete user account. CASCADE handles all related data.
 * FRD: Immediate, no grace period.
 */
export async function deleteAccount(userId: string): Promise<void> {
  try {
    await usersRepo.deleteUser(userId);
  } catch (error) {
    throw serverError(error);
  }
}
