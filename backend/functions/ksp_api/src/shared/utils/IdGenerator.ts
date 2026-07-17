export function generateId(prefix: string): string {
  const shortUuid = crypto.randomUUID().split('-')[0];
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${shortUuid.toUpperCase()}`;
}
