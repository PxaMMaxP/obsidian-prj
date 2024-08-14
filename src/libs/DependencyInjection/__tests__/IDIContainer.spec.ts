/* eslint-disable deprecation/deprecation */
import { IDIContainer_, IDIContainer } from '../interfaces/IDIContainer';

/**
 * Test the implementation of a DIContainer
 * @param Container The DIContainer implementation to test.
 * Must implement {@link IDIContainer}, {@link IDIContainer_}
 */
export function test_IDIContainer(Container: IDIContainer_): void {
    describe('IDIContainer Implementation Tests', () => {
        let container: IDIContainer;

        beforeEach(() => {
            container = Container.getInstance();
        });

        it('should register and resolve a dependency', () => {
            const identifier = 'myDependency';
            const dependency = { value: 42 };

            container.register(identifier, dependency);

            const resolvedDependency =
                container.resolve<typeof dependency>(identifier);
            expect(resolvedDependency).toBe(dependency);
        });

        it('should throw an error when resolving a non-registered dependency', () => {
            const identifier = 'nonExistentDependency';

            expect(() => container.resolve<unknown>(identifier)).toThrow();
        });

        // Add more tests as necessary
    });
}
