/**
 * Helper sleep function
 * @param milisecond
 * @returns
 */
export async function sleep(milisecond: number):Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milisecond));
}
