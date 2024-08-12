import { Opts, OptsWrapper } from '../Opts';

describe('OptsWrapper', () => {
    it('should return true if the value is not null or undefined', () => {
        const wrapper = new OptsWrapper('test');
        expect(wrapper.is()).toBe(true);

        const nullWrapper = new OptsWrapper<string | null>(null);
        expect(nullWrapper.is()).toBe(false);

        const undefinedWrapper = new OptsWrapper<string | undefined>(undefined);
        expect(undefinedWrapper.is()).toBe(false);
    });

    it('should return true if the value is equal to the provided value', () => {
        const wrapper = new OptsWrapper('test');
        expect(wrapper.is('test')).toBe(true);
        expect(wrapper.is('wrong')).toBe(false);

        const numberWrapper = new OptsWrapper(42);
        expect(numberWrapper.is(42)).toBe(true);
        expect(numberWrapper.is(24)).toBe(false);
    });

    it('should return true if the value is not equal to the provided value', () => {
        const wrapper = new OptsWrapper('test');
        expect(wrapper.is('!=', 'wrong')).toBe(true);
        expect(wrapper.is('!=', 'test')).toBe(false);

        const numberWrapper = new OptsWrapper(42);
        expect(numberWrapper.is('!=', 24)).toBe(true);
        expect(numberWrapper.is('!=', 42)).toBe(false);
    });
});

describe('OptsInspector', () => {
    type Settings = {
        a: string;
        b: number;
        c: unknown;
        d?: unknown;
        x: boolean;
    };

    const settings: Settings = {
        a: 'alpha',
        b: 42,
        c: null,
        d: undefined,
        x: false,
    };

    const inspector = Opts.inspect(settings);

    it('should create an OptsWrapper for each key in the settings object', () => {
        expect(inspector.a).toBeInstanceOf(OptsWrapper);
        expect(inspector.b).toBeInstanceOf(OptsWrapper);
        expect(inspector.c).toBeInstanceOf(OptsWrapper);
        expect(inspector.d).toBeInstanceOf(OptsWrapper);
    });

    it('should correctly evaluate is() for each OptsWrapper', () => {
        expect(inspector.a.is('alpha')).toBe(true);
        expect(inspector.b.is(42)).toBe(true);
        expect(inspector.c.is()).toBe(false);
        expect(inspector.d?.is()).toBe(false);
    });

    it('should correctly evaluate isNot() for each OptsWrapper', () => {
        expect(inspector.a.is('!=', 'beta')).toBe(true);
        expect(inspector.b.is('!=', 24)).toBe(true);
        expect(inspector.c.is('!=', null)).toBe(false);
    });

    it('should handle optional original values correctly', () => {
        expect(inspector.x).toBe(false);
    });

    it('should handle optional and undefined values correctly', () => {
        expect(inspector.d?.is()).toBe(false); // undefined should return false for is()
    });

    it('should work with objects and arrays as values', () => {
        const obj = { key: 'value' };
        const arr = [1, 2, 3];
        const str = 'Abc';

        const objectSettings = {
            obj,
            arr,
            str,
        };

        const objectInspector = Opts.inspect(objectSettings);

        expect(objectInspector.obj.is(obj)).toBe(true);
        expect(objectInspector.arr.is(arr)).toBe(true);
        expect(objectInspector.str.is(str)).toBe(true);
        expect(objectInspector.str.is('Abc')).toBe(true);
        expect(objectInspector.arr.is([4, 5, 6])).toBe(false);
    });
});

describe('OptsInspector - is with operator', () => {
    const settings = {
        a: 'alpha',
        b: 42,
        c: null as unknown,
        d: undefined as unknown,
        e: [1, 2, 3],
    };

    const inspector = Opts.inspect(settings);

    inspector.a.is('alpha');

    it('should use === operator by default', () => {
        expect(inspector.a.is('alpha')).toBe(true);
        expect(inspector.b.is(42)).toBe(true);
        expect(inspector.c.is(null)).toBe(true);
        expect(inspector.e.is([1, 2, 3])).toBe(false); // different reference
    });

    it('should correctly use == operator', () => {
        expect(inspector.a.is('==', 'alpha')).toBe(true);
        expect(inspector.b.is('==', 42)).toBe(true); // loose comparison
        expect(inspector.c.is('==', undefined)).toBe(true); // null == undefined
    });

    it('should correctly use != operator', () => {
        expect(inspector.a.is('!=', 'beta')).toBe(true);
        expect(inspector.b.is('!=', 24)).toBe(true);
        expect(inspector.c.is('!=', null)).toBe(false);
    });

    it('should correctly use !== operator', () => {
        expect(inspector.a.is('!==', 'alpha')).toBe(false);
        expect(inspector.b.is('!==', 42)).toBe(false);
        expect(inspector.c.is('!==', null)).toBe(false);
    });

    it('should correctly use > operator', () => {
        expect(inspector.b.is('>', 24)).toBe(true);
        expect(inspector.b.is('>', 42)).toBe(false);
        expect(inspector.b.is('>', 50)).toBe(false);
    });

    it('should correctly use < operator', () => {
        expect(inspector.b.is('<', 50)).toBe(true);
        expect(inspector.b.is('<', 42)).toBe(false);
        expect(inspector.b.is('<', 24)).toBe(false);
    });

    it('should correctly use >= operator', () => {
        expect(inspector.b.is('>=', 42)).toBe(true);
        expect(inspector.b.is('>=', 50)).toBe(false);
        expect(inspector.b.is('>=', 24)).toBe(true);
    });

    it('should correctly use <= operator', () => {
        expect(inspector.b.is('<=', 42)).toBe(true);
        expect(inspector.b.is('<=', 50)).toBe(true);
        expect(inspector.b.is('<=', 24)).toBe(false);
    });

    it('should handle complex objects with === operator', () => {
        const obj = { key: 'value' };
        const wrapper = new OptsWrapper(obj);
        expect(wrapper.is(obj)).toBe(true); // === operator (same reference)
        expect(wrapper.is({ key: 'value' })).toBe(false); // === operator (different reference)
    });
});
