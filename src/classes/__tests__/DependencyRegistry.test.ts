import DependencyRegistry from '../DependencyRegistry';

describe('DependencyRegistry', () => {
    let dependencyRegistry: DependencyRegistry;

    beforeEach(() => {
        dependencyRegistry = DependencyRegistry.getInstance();
    });

    test('should register and resolve an instance', () => {
        const instance = { name: 'John Doe' };
        dependencyRegistry.registerInstance('user', instance);

        const resolvedInstance = dependencyRegistry.resolve('user');

        expect(resolvedInstance).toBe(instance);
    });

    test('should register and resolve a class', () => {
        class MyClass {
            getName(): string {
                return 'MyClass';
            }
        }
        dependencyRegistry.registerClass('myClass', MyClass);

        const resolvedClass = dependencyRegistry.resolve<MyClass>('myClass');

        expect(resolvedClass).toBeInstanceOf(MyClass);
        expect(resolvedClass.getName()).toBe('MyClass');
    });

    test('should throw an error when resolving an unknown dependency', () => {
        expect(() => {
            dependencyRegistry.resolve('unknownDependency');
        }).toThrow('Dependency unknownDependency not found');
    });

    test('should resolve a provided dependency', () => {
        const providedDependency = { value: 42 };

        const resolvedDependency = DependencyRegistry.isDependencyProvided(
            'providedDependency',
            providedDependency,
        );

        expect(resolvedDependency).toBe(providedDependency);
    });

    test('should resolve a dependency when not provided', () => {
        class MyDependency {
            getValue(): number {
                return 42;
            }
        }
        dependencyRegistry.registerClass('myDependency', MyDependency);

        const resolvedDependency = DependencyRegistry.isDependencyProvided(
            'myDependency',
            undefined,
        ) as unknown as MyDependency;

        expect(resolvedDependency).toBeInstanceOf(MyDependency);
        expect(resolvedDependency.getValue()).toBe(42);
    });

    test('should throw an error when resolving a dependency that is not provided or resolved', () => {
        expect(() => {
            DependencyRegistry.isDependencyProvided(
                'unknownDependency',
                undefined,
            );
        }).toThrow('Dependency unknownDependency not found');
    });
});
