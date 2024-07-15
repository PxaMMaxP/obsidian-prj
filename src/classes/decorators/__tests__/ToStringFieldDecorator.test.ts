/* eslint-disable @typescript-eslint/no-explicit-any */
import { toStringField, ToStringFieldSymbol } from '../ToStringFieldDecorator';

describe('toStringField Decorator Function', () => {
    it('should add propertyKey to the constructor using the ToStringFieldSymbol', () => {
        class TestClass {}
        toStringField(TestClass.prototype, 'field1');
        toStringField(TestClass.prototype, 'field2');

        const fields = (TestClass as any)[ToStringFieldSymbol];
        expect(fields).toBeDefined();
        expect(fields).toContain('field1');
        expect(fields).toContain('field2');
        expect(fields.length).toBe(2);
    });

    it('should not include properties that are not decorated', () => {
        class TestClass {}
        toStringField(TestClass.prototype, 'includedField');

        const fields = (TestClass as any)[ToStringFieldSymbol];
        expect(fields).toBeDefined();
        expect(fields).toContain('includedField');
        expect(fields).not.toContain('notIncludedField');
    });

    it('should create the ToStringFieldSymbol array if it does not exist', () => {
        class TestClass {}
        toStringField(TestClass.prototype, 'field1');

        const fields = (TestClass as any)[ToStringFieldSymbol];
        expect(fields).toBeDefined();
        expect(fields.length).toBe(1);
        expect(fields).toContain('field1');
    });
});
