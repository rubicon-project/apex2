/* eslint-env jest */
import deepMerge from 'src/lib/deepmerge';

describe('src/lib/deepmerge', () => {
  test(
    'should merge simple objects',
    () => {
      const target = { a: 1, b: 2, c: 5 };
      const source = { a: 1, b: 3, e: 7 };

      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 5, e: 7 });
    }
  );

  test(
    'should merge nested objects',
    () => {
      const target = { a: 1, b: 2, c: { c1: 'a', c2: 'b' } };
      const source = { a: 1, b: 3, c: { c1: 'd', c3: 'x' } };

      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: { c1: 'd', c2: 'b', c3: 'x' } });
    }
  );

  test(
    'should merge nested objects with empty sub-objects',
    () => {
      const target = { a: 1, b: 2, c: { c1: {}, c2: 'b' } };
      const source = { a: 1, b: 3, c: { c1: 'd', c3: {} } };

      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: { c1: 'd', c2: 'b', c3: {} } });
    }
  );

  test(
    'keep objects unchanged',
    () => {
      const target = { a: {}, b: 2, c: { c1: { x: '1' }, c2: 'b', dx: 999 }, dz: 777 };
      const source = { a: 1, b: { x: 1 }, c: { c1: { x: '2', ax: { zx: 5 } }, c3: { y: 2 } } };
      const savedTarget = JSON.stringify(target);
      const savedSource = JSON.stringify(source);

      expect(deepMerge(target, source)).toEqual({ a: 1, b: { x: 1 }, c: { c1: { x: '2', ax: { zx: 5 } }, c2: 'b', c3: { y: 2 }, dx: 999 }, dz: 777 });
      expect(target).toEqual(JSON.parse(savedTarget));
      expect(source).toEqual(JSON.parse(savedSource));
    }
  );

  test(
    'should merge nested objects with arrays',
    () => {
      const target = { a: 1, b: 2 };
      const source = { a: 1, b: 3, c: [{ c1: 'd', c3: {} }] };

      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: [{ c1: 'd', c3: {} }] });
    }
  );

  test(
    'should merge nested objects with arrays in both source and target',
    () => {
      const target = { a: 1, b: 2, c: [{ c1: 'c1' }] };
      const source = { a: 1, b: 3, c: [{ c1: 'd', c3: {} }] };

      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: [{ c1: 'd', c3: {} }, { c1: 'c1' }] });
    }
  );
});
