/** Message of anything that was thrown (not everything thrown is an Error). */
export function errorMessage(error: unknown): string {
   return error instanceof Error ? error.message : String(error);
}
