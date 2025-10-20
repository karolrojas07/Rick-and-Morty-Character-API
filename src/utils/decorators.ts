/**
 * Method decorator that logs the execution time of a method
 * @param target The class prototype
 * @param propertyKey The method name
 * @param descriptor The property descriptor
 */
export function LogExecutionTime(
  _target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = performance.now();

    try {
      const result = await originalMethod.apply(this, args);
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      console.log(`[${propertyKey}] executed in ${executionTime}ms`);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      console.log(`[${propertyKey}] failed after ${executionTime}ms`);
      throw error;
    }
  };

  return descriptor;
}
