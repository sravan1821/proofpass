export function createAuditEvent(actionType: string, entityType: string, entityId: string) {
  return {
    actionType,
    entityType,
    entityId,
    createdAt: new Date().toISOString(),
  };
}
