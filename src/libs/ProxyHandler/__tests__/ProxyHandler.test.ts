/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from 'src/interfaces/ILogger';
import ProxyHandler from '../ProxyHandler';

interface NestedObject {
    value: string;
    nestedArray?: string[];
    nestedObject?: {
        deepValue: string;
    };
}

interface TestObject {
    publicField: string;
    get privateField(): string;
    set privateField(value: string);
    nested?: NestedObject;
    arrayField?: string[];
}

class TestObjectImplementation implements TestObject {
    public publicField: string;
    private _privateField: string;

    constructor(publicField: string, privateField: string) {
        this.publicField = publicField;
        this._privateField = privateField;
    }

    get privateField(): string {
        return this._privateField + '!';
    }

    set privateField(value: string) {
        this._privateField = value;
    }
}

describe('ProxyHandler', () => {
    let logger: ILogger;
    let updateKeyValueMock: jest.Mock;
    let proxyHandler: ProxyHandler<TestObject>;

    beforeEach(() => {
        logger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };
        updateKeyValueMock = jest.fn();
        proxyHandler = new ProxyHandler<TestObject>(logger, updateKeyValueMock);
    });

    test('should create a proxy and get public field', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        expect(proxy.publicField).toBe('publicValue');
    });

    test('should create a proxy and get private field through getter', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        expect(proxy.privateField).toBe('privateValue!');
    });

    test('should create a proxy and set public field', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        proxy.publicField = 'newPublicValue';
        expect(proxy.publicField).toBe('newPublicValue');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'publicField',
            'newPublicValue',
        );
    });

    test('should create a proxy and set private field through setter', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        proxy.privateField = 'newPrivateValue';
        expect(proxy.privateField).toBe('newPrivateValue!');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'privateField',
            'newPrivateValue!',
        );
    });

    test('should resolve proxy value for nested objects', () => {
        const obj = {
            nested: {
                value: 'nestedValue',
            },
        } as Partial<TestObjectImplementation>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.nested) {
            proxy.nested.value = 'newNestedValue';
        }
        expect(proxy.nested?.value).toBe('newNestedValue');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.value',
            'newNestedValue',
        );
    });

    test('should handle array properties in the proxy', () => {
        const obj = {
            arrayField: ['value1', 'value2'],
        } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.arrayField) {
            proxy.arrayField.push('value3');
        }
        expect(proxy.arrayField).toContain('value3');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'arrayField.2',
            'value3',
        );
        expect(updateKeyValueMock).toHaveBeenCalledWith('arrayField.length', 3);
    });

    test('should handle nested arrays within nested objects', () => {
        const obj = {
            nested: {
                value: 'nestedValue',
                nestedArray: ['nestedValue1', 'nestedValue2'],
            },
        } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.nested?.nestedArray) {
            proxy.nested.nestedArray.push('nestedValue3');
        }
        expect(proxy.nested?.nestedArray).toContain('nestedValue3');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.nestedArray.2',
            'nestedValue3',
        );

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.nestedArray.length',
            3,
        );
    });

    test('should handle deeply nested objects', () => {
        const obj = {
            nested: {
                value: 'nestedValue',
                nestedObject: {
                    deepValue: 'deepNestedValue',
                },
            },
        } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.nested?.nestedObject) {
            proxy.nested.nestedObject.deepValue = 'newDeepNestedValue';
        }

        expect(proxy.nested?.nestedObject?.deepValue).toBe(
            'newDeepNestedValue',
        );

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.nestedObject.deepValue',
            'newDeepNestedValue',
        );
    });

    test('should use existing proxy if already created', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy1 = proxyHandler.createProxy(obj);
        const proxy2 = proxyHandler.createProxy(obj);

        expect(proxy1).toBe(proxy2);
    });

    test('should access private field directly through getter', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        // Access directly through getter
        expect(proxy.privateField).toBe('privateValue!');
        expect(updateKeyValueMock).not.toHaveBeenCalled();
    });

    test('should update private field directly through setter', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        // Update directly through setter
        proxy.privateField = 'newPrivateValue';
        expect(proxy.privateField).toBe('newPrivateValue!');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'privateField',
            'newPrivateValue!',
        );
    });

    test('should resolve primitive values correctly', () => {
        const primitiveValue = 42;
        const resolvedValue = proxyHandler['resolveProxyValue'](primitiveValue);
        expect(resolvedValue).toBe(primitiveValue);
    });

    test('should resolve array values correctly', () => {
        const arrayValue = [1, 2, { nested: 'value' }];
        const resolvedValue = proxyHandler['resolveProxyValue'](arrayValue);
        expect(resolvedValue).toEqual([1, 2, { nested: 'value' }]);
    });

    test('should resolve object values correctly', () => {
        const objValue = {
            publicField: 'value1',
            key2: { nestedKey: 'nestedValue' },
        };
        const resolvedValue = proxyHandler['resolveProxyValue'](objValue);

        expect(resolvedValue).toEqual({
            publicField: 'value1',
            key2: { nestedKey: 'nestedValue' },
        });
    });

    test('should handle proxy map values correctly', () => {
        const objValue = { publicField: 'value' };
        const proxy = proxyHandler.createProxy(objValue as Partial<TestObject>);
        const resolvedValue = proxyHandler['resolveProxyValue'](proxy);
        expect(resolvedValue).toStrictEqual(proxy);
    });

    test('should return existing proxy for nested object from proxy map 1', () => {
        const obj = {
            nested: {
                value: 'nestedValue',
                nestedObject: {
                    deepValue: 'Origin deepNestedValue',
                },
            },
        } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.nested?.nestedObject) {
            proxy.nested.nestedObject.deepValue = 'Old/New DeepNestedValue';
        }

        const oldObj = proxy.nested?.nestedObject;

        if (proxy.nested?.nestedObject) {
            proxy.nested.nestedObject = {
                deepValue: 'New DeepNestedValue',
            };
        }

        if (proxy.nested?.nestedObject) {
            proxy.nested.nestedObject = oldObj;
        }

        expect(proxy.nested?.nestedObject?.deepValue).toBe(
            'Old/New DeepNestedValue',
        );

        expect(updateKeyValueMock).toHaveBeenNthCalledWith(
            1,
            'nested.nestedObject.deepValue',
            'Old/New DeepNestedValue',
        );

        expect(updateKeyValueMock).toHaveBeenNthCalledWith(
            2,
            'nested.nestedObject',
            { deepValue: 'New DeepNestedValue' },
        );

        expect(updateKeyValueMock).toHaveBeenNthCalledWith(
            3,
            'nested.nestedObject',
            { deepValue: 'Old/New DeepNestedValue' },
        );
    });

    test('should return existing proxy for nested object from proxy map 2', () => {
        const initialObj = {
            nested: {
                value: 'nestedValue',
                nestedObject: {
                    deepValue: 'Origin deepNestedValue',
                },
            },
        } as Partial<TestObject>;
        const initialProxy = proxyHandler.createProxy(initialObj);

        const newObj = {
            nested: {
                value: 'nestedValue',
                nestedObject: {
                    deepValue: 'New deepNestedValue',
                },
            },
        } as Partial<TestObject>;
        const newProxy = proxyHandler.createProxy(newObj);

        if (initialProxy.nested?.nestedObject) {
            initialProxy.nested.nestedObject.deepValue =
                'Make sure that a deep proxy is created.';
        }

        newProxy.nested = initialProxy.nested;

        expect(initialProxy.nested?.nestedObject?.deepValue).toBe(
            'Make sure that a deep proxy is created.',
        );

        expect(newProxy.nested?.nestedObject?.deepValue).toBe(
            'Make sure that a deep proxy is created.',
        );

        expect(updateKeyValueMock).toHaveBeenNthCalledWith(
            1,
            'nested.nestedObject.deepValue',
            'Make sure that a deep proxy is created.',
        );

        expect(updateKeyValueMock).toHaveBeenNthCalledWith(2, 'nested', {
            nestedObject: {
                deepValue: 'Make sure that a deep proxy is created.',
            },
            value: 'nestedValue',
        });
    });

    test('should handle null object in createProxy', () => {
        expect(() => proxyHandler.createProxy(null as any)).toThrow();
    });

    test('should handle undefined object in createProxy', () => {
        expect(() => proxyHandler.createProxy(undefined as any)).toThrow();
    });

    test('should handle null in resolveProxyValue', () => {
        const resolvedValue = proxyHandler['resolveProxyValue'](null);
        expect(resolvedValue).toBeNull();
    });

    test('should handle undefined in resolveProxyValue', () => {
        const resolvedValue = proxyHandler['resolveProxyValue'](undefined);
        expect(resolvedValue).toBeUndefined();
    });

    test('should create proxy with symbol keys', () => {
        const symbolKey = Symbol('symbolKey');
        const obj = { [symbolKey]: 'symbolValue' } as any;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any)[symbolKey]).toBe('symbolValue');
    });

    test('should handle private symbol keys', () => {
        const privateSymbol = Symbol('_privateSymbol');
        const obj = { [privateSymbol]: 'privateValue' } as any;
        const proxy = proxyHandler.createProxy(obj);

        (proxy as any)[privateSymbol] = 'newPrivateValue';
        expect((proxy as any)[privateSymbol]).toBe('newPrivateValue');
    });

    test('should handle addition of elements to arrays within objects', () => {
        const obj = { arrayField: ['value1'] } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.arrayField) {
            proxy.arrayField.push('value2');
        }
        expect(proxy.arrayField).toContain('value2');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'arrayField.1',
            'value2',
        );
        expect(updateKeyValueMock).toHaveBeenCalledWith('arrayField.length', 2);
    });

    test('should handle removal of elements from arrays within objects', () => {
        const obj = { arrayField: ['value1', 'value2'] } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        if (proxy.arrayField) {
            proxy.arrayField.pop();
        }
        expect(proxy.arrayField).not.toContain('value2');
        expect(updateKeyValueMock).toHaveBeenCalledWith('arrayField.length', 1);
    });

    test('should return the same proxy for the same object after modification', () => {
        const obj = { publicField: 'value1' } as Partial<TestObject>;
        const proxy1 = proxyHandler.createProxy(obj);

        proxy1.publicField = 'value2';
        const proxy2 = proxyHandler.createProxy(obj);

        expect(proxy1).toBe(proxy2);
        expect(proxy2.publicField).toBe('value2');
    });

    test('should handle accessing non-existent paths gracefully', () => {
        const obj = { publicField: 'value1' } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any)['nonExistentField']).toBeUndefined();
    });

    test('should handle setting non-existent paths gracefully', () => {
        const obj = { publicField: 'value1' } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        (proxy as any)['nonExistentField'] = 'newValue';
        expect((proxy as any)['nonExistentField']).toBe('newValue');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nonExistentField',
            'newValue',
        );
    });

    test('should handle functions as values in the proxy', () => {
        const obj = { method: () => 'result' } as any;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).method()).toBe('result');
    });

    test('should proxy nested objects with functions correctly', () => {
        const obj = {
            nested: {
                method: () => 'nestedResult',
            },
        } as any;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).nested.method()).toBe('nestedResult');
    });

    test('should set and reset private fields correctly', () => {
        const obj = new TestObjectImplementation('publicValue', 'privateValue');
        const proxy = proxyHandler.createProxy(obj);

        proxy.privateField = 'newPrivateValue';
        expect(proxy.privateField).toBe('newPrivateValue!');

        proxy.privateField = 'privateValue';
        expect(proxy.privateField).toBe('privateValue!');
    });

    test('should handle multiple nesting and un-nesting of objects', () => {
        const obj = {
            nested: {
                nestedObject: {
                    deepNestedObject: {
                        value: 'deepValue',
                    },
                },
            },
        } as any;
        const proxy = proxyHandler.createProxy(obj);

        (proxy as any).nested.nestedObject.deepNestedObject.value =
            'newDeepValue';

        expect((proxy as any).nested.nestedObject.deepNestedObject.value).toBe(
            'newDeepValue',
        );

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.nestedObject.deepNestedObject.value',
            'newDeepValue',
        );

        delete (proxy as any).nested.nestedObject.deepNestedObject;

        expect(
            (proxy as any).nested.nestedObject.deepNestedObject,
        ).toBeUndefined();
    });

    test('should log an error when setting a value on a non-writable property', () => {
        const obj = Object.freeze({ publicField: 'value1' }) as any;
        const proxy = proxyHandler.createProxy(obj);

        expect(() => {
            proxy.publicField = 'newValue';
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to set property'),
        );
    });

    test('should handle combined scenarios with nested arrays and symbols', () => {
        const symbolKey = Symbol('symbolKey');

        const obj = {
            nested: {
                arrayField: ['value1'],
                [symbolKey]: 'symbolValue',
            },
        } as any;
        const proxy = proxyHandler.createProxy(obj);

        (proxy as any).nested.arrayField.push('value2');
        (proxy as any).nested[symbolKey] = 'newSymbolValue';

        expect((proxy as any).nested.arrayField).toContain('value2');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.arrayField.1',
            'value2',
        );

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nested.arrayField.length',
            2,
        );
        expect((proxy as any).nested[symbolKey]).toBe('newSymbolValue');
    });

    test('should handle symbol keys in deeply nested objects', () => {
        const symbolKey = Symbol('symbolKey');

        const obj = {
            nested: {
                deepNested: {
                    [symbolKey]: 'symbolValue',
                },
            },
        } as any;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).nested?.deepNested[symbolKey]).toBe(
            'symbolValue',
        );
        (proxy as any).nested.deepNested[symbolKey] = 'newSymbolValue';

        expect((proxy as any).nested.deepNested[symbolKey]).toBe(
            'newSymbolValue',
        );
    });

    test.skip('should handle symbols as keys in arrays', () => {
        const symbolKey = Symbol('symbolKey');

        const obj = {
            arrayField: ['value1', { [symbolKey]: 'symbolValue' }],
        } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).arrayField?.[1][symbolKey]).toBe('symbolValue');
        (proxy as any).arrayField?.push({ [symbolKey]: 'newSymbolValue' });

        expect((proxy as any).arrayField?.[2][symbolKey]).toBe(
            'newSymbolValue',
        );
    });

    test('should log error when setting value on non-writable property', () => {
        const obj = {};

        Object.defineProperty(obj, 'nonWritable', {
            value: 'initialValue',
            writable: false,
        });
        const proxy = proxyHandler.createProxy(obj as any);

        expect(() => {
            (proxy as any).nonWritable = 'newValue';
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to set property nonWritable'),
        );
    });

    test('should handle deleting properties correctly', () => {
        const obj = { publicField: 'value1' } as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        delete (proxy as any).publicField;
        expect(proxy.publicField).toBeUndefined();

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'publicField',
            undefined,
        );
    });

    test('should function without updateKeyValue callback', () => {
        const noCallbackProxyHandler = new ProxyHandler<TestObject>(
            logger,
            undefined as any,
        );
        const obj = { publicField: 'value1' } as Partial<TestObject>;
        const proxy = noCallbackProxyHandler.createProxy(obj);

        proxy.publicField = 'newValue';
        expect(proxy.publicField).toBe('newValue');

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to update key-value pair for key'),
        );
    });

    test('should handle private symbol keys', () => {
        const privateSymbol = Symbol('_privateSymbol');
        const obj = { [privateSymbol]: 'privateValue' } as any;
        const proxy = proxyHandler.createProxy(obj);

        (proxy as any)[privateSymbol] = 'newPrivateValue';
        expect((proxy as any)[privateSymbol]).toBe('newPrivateValue');
    });

    test('should handle setting methods as properties', () => {
        const obj = {} as any;
        const proxy = proxyHandler.createProxy(obj);

        (proxy as any).method = () => 'result';
        expect((proxy as any).method()).toBe('result');
    });

    test('should handle circular references', () => {
        const obj: any = {};
        obj.self = obj;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).self).toBe(proxy);
    });

    test('should handle empty objects and arrays', () => {
        const emptyObj = {} as Partial<TestObject>;
        const emptyArray = [] as any[] as Partial<TestObject>;
        const proxyObj = proxyHandler.createProxy(emptyObj);
        const proxyArray = proxyHandler.createProxy(emptyArray);

        expect(Object.keys(proxyObj).length).toBe(0);
        expect((proxyArray as any).length).toBe(0);
    });

    test('should handle multiple proxies for the same object', () => {
        const obj = { publicField: 'value1' } as Partial<TestObject>;
        const proxy1 = proxyHandler.createProxy(obj);
        const proxy2 = proxyHandler.createProxy(obj);

        proxy1.publicField = 'value2';
        expect(proxy2.publicField).toBe('value2');
    });

    test('should handle changes in prototype', () => {
        const proto = { protoField: 'protoValue' };
        const obj = Object.create(proto) as Partial<TestObject>;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).protoField).toBe('protoValue');
        (obj as any).protoField = 'newProtoValue';
        expect((proxy as any).protoField).toBe('newProtoValue');
    });

    test('should handle properties with special descriptors', () => {
        const obj = {} as Partial<TestObject>;

        Object.defineProperty(obj, 'specialProperty', {
            value: 'specialValue',
            writable: true,
            enumerable: false,
            configurable: true,
        });
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).specialProperty).toBe('specialValue');
        (proxy as any).specialProperty = 'newSpecialValue';
        expect((proxy as any).specialProperty).toBe('newSpecialValue');
    });

    test('should handle function properties in nested objects', () => {
        const obj = {
            nested: {
                method: () => 'nestedResult',
            },
        } as any;
        const proxy = proxyHandler.createProxy(obj);

        expect((proxy as any).nested.method()).toBe('nestedResult');
    });
});
