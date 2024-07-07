/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from 'src/interfaces/ILogger';
import ProxyHandler from '../ProxyHandler';

interface TestObject {
    publicField: string;
    nested?: {
        deepNested?: {
            value: string;
        };
    };
    arrayField?: string[];
}

class TestObjectImplementation implements TestObject {
    public publicField: string;
    constructor(publicField: string) {
        this.publicField = publicField;
    }
}

describe('ProxyHandler Performance', () => {
    const runPerformanceTests = (
        description: string,
        logger: ILogger | undefined,
    ) => {
        describe(description, () => {
            let updateKeyValueMock: jest.Mock;
            let proxyHandler: ProxyHandler<TestObject>;

            beforeEach(() => {
                updateKeyValueMock = jest.fn();

                proxyHandler = new ProxyHandler<TestObject>(
                    logger,
                    updateKeyValueMock,
                );
            });

            const performProxyTest = (iterations: number) => {
                const obj = new TestObjectImplementation('initialValue');
                const proxy = proxyHandler.createProxy(obj);

                for (let i = 0; i < iterations; i++) {
                    proxy.publicField = `newValue${i}`;
                }

                return proxy.publicField;
            };

            const performDirectTest = (iterations: number) => {
                const obj = new TestObjectImplementation('initialValue');

                for (let i = 0; i < iterations; i++) {
                    obj.publicField = `newValue${i}`;
                }

                return obj.publicField;
            };

            test('performance: proxy vs direct access', () => {
                const iterations = 1000;

                // Measure proxy performance
                const startProxy = performance.now();
                const proxyResult = performProxyTest(iterations);
                const endProxy = performance.now();
                const proxyDuration = endProxy - startProxy;

                // Measure direct access performance
                const startDirect = performance.now();
                const directResult = performDirectTest(iterations);
                const endDirect = performance.now();
                const directDuration = endDirect - startDirect;

                console.log(
                    `Proxy duration (${iterations} iter., ${description}): ${proxyDuration}ms`,
                );

                console.log(
                    `Direct access duration (${iterations} iter., ${description}): ${directDuration}ms`,
                );

                expect(proxyResult).toBe(`newValue${iterations - 1}`);
                expect(directResult).toBe(`newValue${iterations - 1}`);
            });

            test('performance: nested object access and update', () => {
                const iterations = 1000;

                const performProxyNestedTest = (iterations: number) => {
                    const obj = {
                        nested: {
                            deepNested: {
                                value: 'initialValue',
                            },
                        },
                    } as Partial<TestObject>;
                    const proxy = proxyHandler.createProxy(obj);

                    for (let i = 0; i < iterations; i++) {
                        proxy.nested!.deepNested!.value = `newValue${i}`;
                    }

                    return proxy.nested!.deepNested!.value;
                };

                const performDirectNestedTest = (iterations: number) => {
                    const obj = {
                        nested: {
                            deepNested: {
                                value: 'initialValue',
                            },
                        },
                    } as TestObject;

                    for (let i = 0; i < iterations; i++) {
                        obj.nested!.deepNested!.value = `newValue${i}`;
                    }

                    return obj.nested!.deepNested!.value;
                };

                // Measure proxy performance
                const startProxy = performance.now();
                const proxyResult = performProxyNestedTest(iterations);
                const endProxy = performance.now();
                const proxyDuration = endProxy - startProxy;

                // Measure direct access performance
                const startDirect = performance.now();
                const directResult = performDirectNestedTest(iterations);
                const endDirect = performance.now();
                const directDuration = endDirect - startDirect;

                console.log(
                    `Proxy nested duration (${iterations} iter., ${description}): ${proxyDuration}ms`,
                );

                console.log(
                    `Direct nested access duration (${iterations} iter., ${description}): ${directDuration}ms`,
                );

                expect(proxyResult).toBe(`newValue${iterations - 1}`);
                expect(directResult).toBe(`newValue${iterations - 1}`);
            });

            test('performance: array manipulation', () => {
                const iterations = 1000;

                const performProxyArrayTest = (iterations: number) => {
                    const obj = {
                        arrayField: [],
                    } as Partial<TestObject>;
                    const proxy = proxyHandler.createProxy(obj);

                    for (let i = 0; i < iterations; i++) {
                        proxy.arrayField!.push(`value${i}`);
                    }

                    return proxy.arrayField!.length;
                };

                const performDirectArrayTest = (iterations: number) => {
                    const obj = {
                        arrayField: [],
                    } as unknown as TestObject;

                    for (let i = 0; i < iterations; i++) {
                        obj.arrayField!.push(`value${i}`);
                    }

                    return obj.arrayField!.length;
                };

                // Measure proxy performance
                const startProxy = performance.now();
                const proxyResult = performProxyArrayTest(iterations);
                const endProxy = performance.now();
                const proxyDuration = endProxy - startProxy;

                // Measure direct access performance
                const startDirect = performance.now();
                const directResult = performDirectArrayTest(iterations);
                const endDirect = performance.now();
                const directDuration = endDirect - startDirect;

                console.log(
                    `Proxy array duration (${iterations} iter., ${description}): ${proxyDuration}ms`,
                );

                console.log(
                    `Direct array access duration (${iterations} iter., ${description}): ${directDuration}ms`,
                );

                expect(proxyResult).toBe(iterations);
                expect(directResult).toBe(iterations);
            });
        });
    };

    // Run tests with logger
    runPerformanceTests('with logger', {
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        trace: jest.fn(),
        debug: jest.fn(),
    });

    // Run tests without logger
    runPerformanceTests('without logger', undefined);
});
