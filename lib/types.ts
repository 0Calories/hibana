type SuccessType = string | { message: string };

export type ActionResult<T = SuccessType> = Promise<
  { success: true; data: T } | { success: false; error: Error }
>;
