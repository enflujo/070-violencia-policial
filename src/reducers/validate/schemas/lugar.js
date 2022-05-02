import { isObject, isString } from 'typanion';

export default isObject({
  name: isString(),
  localidad: isString(),
  latitude: isString(),
  longitude: isString(),
});
