/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    fieldConfig,
    FieldConfigSymbol,
} from 'src/classes/decorators/FieldConfigDecorator';

describe('fieldConfig Decorator Function', () => {
    it('should add propertyKey and defaultValue to the constructor using the FieldConfigSymbol', () => {
        class TestClass {}
        fieldConfig('default1')(TestClass.prototype, 'field1');
        fieldConfig('default2')(TestClass.prototype, 'field2');

        const fields = (TestClass as any)[FieldConfigSymbol];
        expect(fields).toBeDefined();

        expect(fields).toContainEqual({
            key: 'field1',
            defaultValue: 'default1',
        });

        expect(fields).toContainEqual({
            key: 'field2',
            defaultValue: 'default2',
        });
        expect(fields.length).toBe(2);
    });

    it('should not include properties that are not decorated', () => {
        class TestClass {}
        fieldConfig('includedValue')(TestClass.prototype, 'includedField');

        const fields = (TestClass as any)[FieldConfigSymbol];
        expect(fields).toBeDefined();

        expect(fields).toContainEqual({
            key: 'includedField',
            defaultValue: 'includedValue',
        });

        expect(fields).not.toContainEqual({
            key: 'notIncludedField',
            defaultValue: 'someValue',
        });
    });

    it('should create the FieldConfigSymbol array if it does not exist', () => {
        class TestClass {}
        fieldConfig('defaultValue')(TestClass.prototype, 'field1');

        const fields = (TestClass as any)[FieldConfigSymbol];
        expect(fields).toBeDefined();
        expect(fields.length).toBe(1);

        expect(fields).toContainEqual({
            key: 'field1',
            defaultValue: 'defaultValue',
        });
    });

    it('should handle undefined defaultValue correctly', () => {
        class TestClass {}
        fieldConfig()(TestClass.prototype, 'field1');

        const fields = (TestClass as any)[FieldConfigSymbol];
        expect(fields).toBeDefined();
        expect(fields.length).toBe(1);

        expect(fields).toContainEqual({
            key: 'field1',
            defaultValue: undefined,
        });
    });
});
