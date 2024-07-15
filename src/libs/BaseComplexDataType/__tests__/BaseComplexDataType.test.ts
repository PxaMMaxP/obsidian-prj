import BaseComplexDataType from '../BaseComplexDataType';
import { isIBaseComplexDataType } from '../isIBaseComplexDataType';

// Concrete class for testing purposes
class TestComplexDataType extends BaseComplexDataType {
    getFrontmatterObject():
        | Record<string, unknown>
        | Array<unknown>
        | string
        | null
        | undefined {
        return { key: 'value' };
    }
}

describe('BaseComplexDataType', () => {
    describe('isInstanceOf', () => {
        it('should return true if object is an instance of the current class', () => {
            const testInstance = new TestComplexDataType();

            expect(
                BaseComplexDataType.isInstanceOf.call(
                    TestComplexDataType,
                    testInstance,
                ),
            ).toBe(true);
        });

        it('should return false if object is not an instance of the current class', () => {
            const notTestInstance = {};

            expect(
                BaseComplexDataType.isInstanceOf.call(
                    TestComplexDataType,
                    notTestInstance,
                ),
            ).toBe(false);
        });
    });

    describe('getFrontmatterObject', () => {
        it('should return a frontmatter object', () => {
            const testInstance = new TestComplexDataType();
            const frontmatterObject = testInstance.getFrontmatterObject();
            expect(frontmatterObject).toEqual({ key: 'value' });
        });
    });

    describe('Test `isIBaseComplexDataType`-function ', () => {
        it('should return true if object is an instance of the current class', () => {
            const testInstance = new TestComplexDataType();

            expect(isIBaseComplexDataType(testInstance)).toBe(true);
        });

        it('should return false if object is not an instance of the current class', () => {
            const notTestInstance = {};

            expect(isIBaseComplexDataType(notTestInstance)).toBe(false);
        });
    });
});
