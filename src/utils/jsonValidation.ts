import AJV from 'ajv';
import StackedError from '../adapters/StackedError';

/**
 * Json schema validator
 *
 * @param schema
 * @param json
 */
export function validate(
  schema: Record<string, unknown>,
  json: any,
) {
  const ajv = new AJV();
  const ajvValidate = ajv.compile(schema);
  const valid = ajvValidate(json);

  if (!valid) {
    throw new StackedError('Schema not valid', ajvValidate.errors);
  }
}
