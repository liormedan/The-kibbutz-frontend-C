import { notImplemented, pendingRead } from "@/lib/api/pending";
import type { NdaDocument } from "@/types/project.types";

export async function createNda(input: {
  projectId: string;
  recipientId: string;
  confidentialityPeriod: string;
  formData?: Record<string, unknown>;
}): Promise<NdaDocument | null> {
  return notImplemented("חוזי סודיות (NDA)");
}

export async function signNda(ndaId: string): Promise<void> {
  return notImplemented("חוזי סודיות (NDA)");
}

export async function rejectNda(ndaId: string): Promise<void> {
  return notImplemented("חוזי סודיות (NDA)");
}

export async function fetchMyNdas(): Promise<NdaDocument[]> {
  return await pendingRead<NdaDocument[]>("חוזי סודיות (NDA)", []);
}

export async function fetchNda(id: string): Promise<NdaDocument | null> {
  return await pendingRead<NdaDocument | null>("חוזי סודיות (NDA)", null);
}
