import { notImplemented } from "@/lib/api/pending";

export interface InviteResult {
  id: string;
  projectId: string;
  userId: string;
  status: string;
  createdAt: string;
}

export async function createInvite(projectId: string, userId: string): Promise<InviteResult | null> {
  return notImplemented("הזמנות");
}

export async function acceptInvite(inviteId: string): Promise<void> {
  return notImplemented("הזמנות");
}

export async function rejectInvite(inviteId: string): Promise<void> {
  return notImplemented("הזמנות");
}
