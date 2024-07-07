/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from 'src/interfaces/ILogger';
import ProxyHandler from '../ProxyHandler';

/**
 * Extends the ProxyHandler class for testing
 * to get access to the protected properties and methods.
 */
class TestProxyHandler<T extends object> extends ProxyHandler<T> {
    public get proxyMap(): WeakMap<object, unknown> {
        return (this as any)._proxyMap;
    }

    private _proxyMapSize = 0;

    public get proxyMapSize(): number {
        return this._proxyMapSize;
    }

    public updateKeyValueDelegate(
        updateKeyValue: (key: string, value: unknown) => void,
    ): void {
        (this as any)._updateKeyValue = updateKeyValue;
    }

    public updateLogger(logger: ILogger | undefined): void {
        (this as any).logger = logger;
    }

    constructor(
        logger: ILogger | undefined,
        updateKeyValue: (key: string, value: unknown) => void,
    ) {
        super(logger, updateKeyValue);

        ((this as any).addProxyToMapOriginal as (
            obj: Partial<T>,
            proxy: Partial<T>,
        ) => void) = (this as any).addProxyToMap as (
            obj: Partial<T>,
            proxy: Partial<T>,
        ) => void;

        ((this as any).addProxyToMap as (
            obj: Partial<T>,
            proxy: Partial<T>,
        ) => void) = this.addProxyToMapWrapper;
    }

    protected addProxyToMapWrapper(obj: Partial<T>, proxy: Partial<T>): void {
        this._proxyMapSize++;

        (
            (this as any).addProxyToMapOriginal as (
                obj: Partial<T>,
                proxy: Partial<T>,
            ) => void
        )(obj, proxy);
    }
}

class TestObjectClass {
    // ...

    private _test: string;

    public get test(): string {
        return this._test + ' getter';
    }

    public set test(value: string) {
        this._test = value + ' setter';
    }
}

describe('ProxyHandler', () => {
    let updateKeyValueMock: jest.Mock;
    let proxyHandler: TestProxyHandler<object>;

    beforeEach(() => {
        updateKeyValueMock = jest.fn();

        proxyHandler = new TestProxyHandler<object>(
            undefined,
            updateKeyValueMock,
        );
    });

    //#region General Tests

    test('Should create a proxy of an anonymous object ', () => {
        const testObject = {
            test: 'test',
        };
        const proxy = proxyHandler.createProxy(testObject);
        expect(proxy).toEqual(testObject);
    });

    test('Should change the value of a public property', () => {
        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test = 'new value';

        expect(proxy.test).toBe('new value');

        expect(updateKeyValueMock).toHaveBeenCalledWith('test', 'new value');
    });

    test('Should change the value of a property trough a setter', () => {
        type TestObject = {
            _test: string;
            set test(value: string);
            get test(): string;
        };

        const testObject = {
            _test: 'value',
            set test(value: string) {
                this._test = value;
            },
            get test() {
                return this._test;
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test = 'new value';

        expect(proxy.test).toBe('new value');

        expect(updateKeyValueMock).toHaveBeenCalledWith('test', 'new value');
    });

    test('Should change the value of a property trough a setter and get a changed value trough a getter', () => {
        type TestObject = {
            _test: string;
            set test(value: string);
            get test(): string;
        };

        const testObject = {
            _test: 'value',
            set test(value: string) {
                this._test = value + ' changed';
            },
            get test() {
                return this._test;
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test = 'new value';

        expect(proxy.test).toBe('new value changed');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test',
            'new value changed',
        );
    });

    test('Should change the value of a private property trough a setter and get a changed value trough a getter', () => {
        const testObject = new TestObjectClass();
        const proxy = proxyHandler.createProxy(testObject) as TestObjectClass;

        proxy.test = 'new value';

        expect(proxy.test).toBe('new value setter getter');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test',
            'new value setter getter',
        );
    });

    //#endregion General Tests

    //#region Array of strings

    test('Should work with an array of strings: new array', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value 0', 'value 1', 'value 2'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test = ['value 0', 'value 1', 'value 2'];

        proxy.test.forEach((value, index) => {
            expect(value).toBe(`value ${index}`);
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith('test', [
            'value 0',
            'value 1',
            'value 2',
        ]);
    });

    test('Should work with an array of strings: push', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.push('new value');

        expect(proxy.test).toEqual(['value', 'new value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.1', 'new value');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.length', 2);
    });

    test('Should work with an array of strings: pop', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.pop();

        expect(proxy.test).toEqual([]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', null);
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.length', 0);
    });

    test('Should work with an array of strings: shift', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.shift();

        expect(proxy.test).toEqual([]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', null);
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.length', 0);
    });

    test('Should work with an array of strings: unshift', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.unshift('new value');

        expect(proxy.test).toEqual(['new value', 'value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', 'new value');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.1', 'value');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.length', 2);
    });

    test('Should work with an array of strings: splice', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.splice(0, 1, 'new value');

        expect(proxy.test).toEqual(['new value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', 'new value');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.length', 1);
    });

    test('Should work with an array of strings: reverse', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value', 'new value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.reverse();

        expect(proxy.test).toEqual(['new value', 'value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', 'new value');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.1', 'value');
    });

    test('Should work with an array of strings: sort', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['4', '0', '2', '1', '3'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.sort();

        expect(proxy.test).toEqual(['0', '1', '2', '3', '4']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', '0');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.1', '1');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.2', '2');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.3', '3');
        expect(updateKeyValueMock).toHaveBeenCalledWith('test.4', '4');
    });

    test('Should work with an array of strings: fill', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.fill('new value');

        expect(proxy.test).toEqual(['new value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', 'new value');
    });

    test('Should work with an array of strings: copyWithin', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value', 'new value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.copyWithin(0, 1);

        expect(proxy.test).toEqual(['new value', 'new value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', 'new value');
    });

    test('Should work with an array of strings: delete', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value', 'new value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        delete proxy.test[0];

        expect(proxy.test).toEqual([undefined, 'new value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.0', null);
    });

    test('Should work with an array of strings: delete last element', () => {
        type TestObject = {
            test: string[];
        };

        const testObject = {
            test: ['value', 'new value'],
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        delete proxy.test[1];

        expect(proxy.test).toEqual(['value', undefined]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.1', null);
    });

    //#endregion Array of strings

    //#region Object with nested object

    test('Should work with an object with a nested object', () => {
        type TestObject = {
            test: {
                nested: string;
            };
        };

        const testObject = {
            test: {
                nested: 'value',
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested = 'new value';

        expect(proxy.test.nested).toBe('new value');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested',
            'new value',
        );
    });

    test('Should work with an object with a nested object and a nested array', () => {
        type TestObject = {
            test: {
                nested: string[];
            };
        };

        const testObject = {
            test: {
                nested: ['value'],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.push('new value');

        expect(proxy.test.nested).toEqual(['value', 'new value']);

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.1',
            'new value',
        );
    });

    test('Should work with an object with a nested object and a nested array of objects', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested[0].nestedValue = 'new value';

        expect(proxy.test.nested[0].nestedValue).toBe('new value');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.0.nestedValue',
            'new value',
        );
    });

    test('Should work with an object with a nested object and a nested array of objects: push', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.push({
            nestedValue: 'new value',
        });

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: 'value',
            },
            {
                nestedValue: 'new value',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.1', {
            nestedValue: 'new value',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.length',
            2,
        );
    });

    test('Should work with an object with a nested object and a nested array of objects: pop', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                    {
                        nestedValue: 'new value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.pop();

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: 'value',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.1', null);

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.length',
            1,
        );
    });

    test('Should work with an object with a nested object and a nested array of objects: shift', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                    {
                        nestedValue: 'new value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.shift();

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: 'new value',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.0', {
            nestedValue: 'new value',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.length',
            1,
        );
    });

    test('Should work with an object with a nested object and a nested array of objects: unshift', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.unshift({
            nestedValue: 'new value',
        });

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: 'new value',
            },
            {
                nestedValue: 'value',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.0', {
            nestedValue: 'new value',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.length',
            2,
        );
    });

    test('Should work with an object with a nested object and a nested array of objects: splice', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                    {
                        nestedValue: 'new value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.splice(0, 1, {
            nestedValue: 'new value',
        });

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: 'new value',
            },
            {
                nestedValue: 'new value',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.0', {
            nestedValue: 'new value',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'test.nested.length',
            2,
        );
    });

    test('Should work with an object with a nested object and a nested array of objects: reverse', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                    {
                        nestedValue: 'new value',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.reverse();

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: 'new value',
            },
            {
                nestedValue: 'value',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.0', {
            nestedValue: 'new value',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.1', {
            nestedValue: 'value',
        });
    });

    test('Should work with an object with a nested object and a nested array of objects: sort', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: '4',
                    },
                    {
                        nestedValue: '0',
                    },
                    {
                        nestedValue: '2',
                    },
                    {
                        nestedValue: '1',
                    },
                    {
                        nestedValue: '3',
                    },
                ],
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.sort((a, b) => {
            return a.nestedValue.localeCompare(b.nestedValue);
        });

        expect(proxy.test.nested).toEqual([
            {
                nestedValue: '0',
            },
            {
                nestedValue: '1',
            },
            {
                nestedValue: '2',
            },
            {
                nestedValue: '3',
            },
            {
                nestedValue: '4',
            },
        ]);

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.0', {
            nestedValue: '0',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.1', {
            nestedValue: '1',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.2', {
            nestedValue: '2',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.3', {
            nestedValue: '3',
        });

        expect(updateKeyValueMock).toHaveBeenCalledWith('test.nested.4', {
            nestedValue: '4',
        });
    });

    //#endregion Object with nested object

    //#region Existing proxy

    test('Should create a proxy and add it to the proxyMap', () => {
        type TestObject = {
            test: string;
        };

        const testObject = { test: 'value' } as TestObject;
        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(proxyHandler.proxyMap.has(testObject)).toBe(true);
        expect(proxyHandler.proxyMapSize).toBe(1); // Check the size of the proxyMap
    });

    test('Should create nested proxies and add them to the proxyMap', () => {
        type TestObject = {
            test: {
                nested: string;
            };
        };

        const testObject = {
            test: {
                nested: 'value',
            },
        } as TestObject;
        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        const devNull = proxy.test; // Access the nested object to create a proxy

        expect(proxyHandler.proxyMap.has(testObject)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test)).toBe(true);
        expect(proxyHandler.proxyMapSize).toBe(2); // Check the size of the proxyMap
    });

    test('Should create proxies for nested objects and arrays', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value',
                    },
                ],
            },
        } as TestObject;
        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        const devNull = proxy.test.nested[0]; // Access the nested object to create all proxies

        expect(proxyHandler.proxyMap.has(testObject)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test.nested)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test.nested[0])).toBe(true);
        expect(proxyHandler.proxyMapSize).toBe(4); // Check the size of the proxyMap
    });

    test('Should handle array operations and maintain proxies', () => {
        type TestObject = {
            test: {
                nested: {
                    nestedValue: string;
                }[];
            };
        };

        const testObject = {
            test: {
                nested: [
                    {
                        nestedValue: 'value1',
                    },
                    {
                        nestedValue: 'value2',
                    },
                ],
            },
        } as TestObject;
        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test.nested.push({
            nestedValue: 'value3',
        });

        proxy.test.nested.forEach((nested, index) => {
            const devNull = proxy.test.nested[index]; // Access the nested object to create all proxies
        });

        expect(proxyHandler.proxyMap.has(testObject)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test.nested)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test.nested[0])).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test.nested[1])).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.test.nested[2])).toBe(true);
        expect(proxyHandler.proxyMapSize).toBe(6); // Check the size of the proxyMap
    });

    test('Should handle deep nested structures and maintain proxies', () => {
        type TestObject = {
            level1: {
                level2: {
                    level3: {
                        level4: string;
                    };
                };
            };
        };

        const testObject = {
            level1: {
                level2: {
                    level3: {
                        level4: 'value',
                    },
                },
            },
        } as TestObject;
        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        const devNull_0 = proxy.level1.level2.level3.level4; // Access the nested object to create all proxies
        const devNull_1 = proxy.level1.level2.level3.level4; // Access the nested object again to test if the proxy is reused

        expect(proxyHandler.proxyMap.has(testObject)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.level1)).toBe(true);
        expect(proxyHandler.proxyMap.has(testObject.level1.level2)).toBe(true);

        expect(proxyHandler.proxyMap.has(testObject.level1.level2.level3)).toBe(
            true,
        );
        expect(proxyHandler.proxyMapSize).toBe(4); // Check the size of the proxyMap
    });

    //#endregion Existing proxy

    //#region Check Logger and Try-Catch

    test('Should log an error if the updateKeyValue delegate throws an error', () => {
        const logger: ILogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        const updateKeyValueError: (key: string, value: unknown) => void = (
            key,
            value,
        ) => {
            throw new Error('Test error');
        };

        proxyHandler.updateLogger(logger);
        proxyHandler.updateKeyValueDelegate(updateKeyValueError);

        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test = 'new value';

        expect(logger.error).toHaveBeenCalledWith(
            'Failed to update key-value pair for key test with value: Test error',
        );
    });

    test('Should not log (without logger) an error if the updateKeyValue delegate throws an error', () => {
        const updateKeyValueError: (key: string, value: unknown) => void = (
            key,
            value,
        ) => {
            throw new Error('Test error');
        };

        proxyHandler.updateKeyValueDelegate(updateKeyValueError);

        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test = 'new value';
    });

    test('Should log an error if the property is not writable', () => {
        const logger: ILogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        proxyHandler.updateLogger(logger);

        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const freezeObject = Object.freeze(testObject);

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(() => {
            proxy.test = 'new value';
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to set property'),
        );
    });

    test('Should not log (without logger) an error if the property is not writable', () => {
        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const freezeObject = Object.freeze(testObject);

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(() => {
            proxy.test = 'new value';
        }).toThrow();
    });

    test('Should log an error if the property is not readable', () => {
        const logger: ILogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        proxyHandler.updateLogger(logger);

        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const handler = {
            get(target: any, property: string) {
                if (property === 'test') {
                    throw new Error(
                        `Access to property ${property} is forbidden`,
                    );
                }

                return target[property];
            },
        };

        const testProxy = new Proxy(testObject, handler);

        const proxy = proxyHandler.createProxy(testProxy) as TestObject;

        const value = proxy.test;

        expect(value).toBeUndefined();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to get property'),
        );
    });

    test('Should not log (without logger) an error if the property is not readable', () => {
        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const handler = {
            get(target: any, property: string) {
                if (property === 'test') {
                    throw new Error(
                        `Access to property ${property} is forbidden`,
                    );
                }

                return target[property];
            },
        };

        const testProxy = new Proxy(testObject, handler);

        const proxy = proxyHandler.createProxy(testProxy) as TestObject;

        const value = proxy.test;

        expect(value).toBeUndefined();
    });

    test('Should log an error if the property is not deletable', () => {
        const logger: ILogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        proxyHandler.updateLogger(logger);

        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        Object.freeze(testObject);

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(() => {
            delete (proxy as any).test;
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to delete property'),
        );
    });

    test('Should not log (without logger) an error if the property is not deletable', () => {
        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        Object.freeze(testObject);

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(() => {
            delete (proxy as any).test;
        }).toThrow();
    });

    //#endregion Check Logger and Try-Catch

    //#region Edge Cases

    test('Should not create a proxy for a null object and log an error', () => {
        const logger: ILogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        proxyHandler.updateLogger(logger);

        const testObject = null;

        expect(() => {
            const proxy = proxyHandler.createProxy(
                testObject as unknown as object,
            );
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to create proxy for object'),
        );
    });

    test('Should not create a proxy for a null object and dont log an error', () => {
        const testObject = null;

        expect(() => {
            const proxy = proxyHandler.createProxy(
                testObject as unknown as object,
            );
        }).toThrow();
    });

    test('Should not create a proxy for an undefined object and log an error', () => {
        const logger: ILogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        proxyHandler.updateLogger(logger);

        const testObject = undefined;

        expect(() => {
            const proxy = proxyHandler.createProxy(
                testObject as unknown as object,
            );
        }).toThrow();

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to create proxy for object'),
        );
    });

    test('Should not create a proxy for an undefined object and dont log an error', () => {
        const testObject = undefined;

        expect(() => {
            const proxy = proxyHandler.createProxy(
                testObject as unknown as object,
            );
        }).toThrow();
    });

    test('Should handle setting non-existent paths gracefully', () => {
        type TestObject = {
            test: string;
        };

        const testObject = {
            test: 'value',
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        (proxy as any)['nonExistentPath'] = 'new value';

        expect((proxy as any)['nonExistentPath']).toBe('new value');

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'nonExistentPath',
            'new value',
        );
    });

    test('Should handle functions as values in the proxy', () => {
        type TestObject = {
            test: () => 'result';
        };

        const testObject = {
            test: () => {
                return 'result';
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(proxy.test).toBeInstanceOf(Function);
        expect(proxy.test()).toBe('result');
    });

    test('Should handle not available functions as values in the proxy', () => {
        type TestObject = {
            test: () => 'result';
        };

        const testObject = {};

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(proxy.test).toBeUndefined();

        expect(() => {
            proxy.test();
        }).toThrow();
    });

    test('Should handle private (underscore) properties on reading correct', () => {
        type TestObject = {
            _test: string;
            test: () => string;
        };

        const testObject = {
            _test: 'result',
            test() {
                return this._test ?? 'fail';
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        expect(proxy.test).toBeInstanceOf(Function);
        expect(proxy.test()).toBe('result');
    });

    test('Should handle private (underscore) properties on writing correct', () => {
        type TestObject = {
            _test: string;
            test: () => string;
        };

        const testObject = {
            _test: 'fail',
            test() {
                this._test = 'result';
            },
        } as TestObject;

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.test();

        expect(proxy.test).toBeInstanceOf(Function);
        expect(proxy._test).toBe('result');
    });

    test('Should handle circular references correctly', () => {
        type TestObject = {
            name: string;
            child?: TestObject;
        };

        const testObject: TestObject = {
            name: 'parent',
        };

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        proxy.child = proxy; // Creating a circular reference

        expect(proxy.child).toBe(proxy);

        expect(proxyHandler.proxyMapSize).toBe(1);
    });

    test('Should handle circular references correctly', () => {
        type TestObject = {
            name: string;
            child?: TestObject;
        };

        const testObject: TestObject = {
            name: 'parent',
        };

        const proxy = proxyHandler.createProxy(testObject) as TestObject;

        // Manually setting the child property to create a circular reference
        proxy.child = proxy;

        expect(proxy.name).toBe('parent');
        expect(proxy.child).toBe(proxy); // The child should reference the proxy itself

        proxy.name = 'new parent';
        expect(proxy.name).toBe('new parent');
        expect(proxy.child?.name).toBe('new parent'); // The child reference should be updated as well

        expect(updateKeyValueMock).toHaveBeenCalledWith(
            'child',
            expect.objectContaining({
                child: expect.any(Object),
                name: 'new parent',
            }),
        );
        expect(updateKeyValueMock).toHaveBeenCalledWith('name', 'new parent');

        expect(proxyHandler.proxyMapSize).toBe(1);
    });

    //#endregion Edge Cases
});
