import { HelperGeneral } from '../General';

describe('HelperGeneral', () => {
    describe('generateUID', () => {
        it('should generate a UID with the specified length and suffix', () => {
            const uid = HelperGeneral.generateUID('test', 10, 'X');
            expect(uid).toHaveLength(10);
            expect(uid.startsWith('X')).toBe(true);
        });

        it('should default to a length of 8 and suffix "U"', () => {
            const uid = HelperGeneral.generateUID('test');
            expect(uid).toHaveLength(8);
            expect(uid.startsWith('U')).toBe(true);
        });
    });

    describe('generateAcronym', () => {
        it('should generate an acronym with the specified length and prefix', () => {
            const acronym = HelperGeneral.generateAcronym(
                'Open Source Software',
                8,
                'OSS',
            );
            expect(acronym).toBe('OSSOpeSouSo');
        });

        it('should default to a length of 6 and prefix to current year', () => {
            const currentYear = new Date()
                .getFullYear()
                .toString()
                .substring(2);

            const acronym = HelperGeneral.generateAcronym(
                'Open Source Software',
            );
            expect(acronym).toBe(`${currentYear}OpSoSo`);
        });

        it('should return an empty string if text is not provided', () => {
            const acronym = HelperGeneral.generateAcronym('');
            expect(acronym).toBe('');
        });
    });

    describe('sleep', () => {
        jest.useFakeTimers();

        it('should resolve after the specified milliseconds', async () => {
            const ms = 1000;
            const promise = HelperGeneral.sleep(ms);
            jest.advanceTimersByTime(ms);
            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('deepClone', () => {
        it('should deep clone an object', () => {
            const obj = { a: 1, b: { c: 2 } };
            const clone = HelperGeneral.deepClone(obj);
            expect(clone).toEqual(obj);
            expect(clone).not.toBe(obj);
            expect(clone.b).not.toBe(obj.b);
        });

        it('should deep clone an array', () => {
            const arr = [1, { a: 2 }, 3];
            const clone = HelperGeneral.deepClone(arr);
            expect(clone).toEqual(arr);
            expect(clone).not.toBe(arr);
            expect(clone[1]).not.toBe(arr[1]);
        });

        it('should return the same primitive value', () => {
            expect(HelperGeneral.deepClone(1)).toBe(1);
            expect(HelperGeneral.deepClone('test')).toBe('test');
        });
    });

    describe('containsMarkdown', () => {
        it('should return true if text contains markdown symbols', () => {
            expect(HelperGeneral.containsMarkdown('This is **bold**')).toBe(
                true,
            );

            expect(
                HelperGeneral.containsMarkdown(
                    'This is a [link](http://example.com)',
                ),
            ).toBe(true);
        });

        it('should return false if text does not contain markdown symbols', () => {
            expect(HelperGeneral.containsMarkdown('This is plain text')).toBe(
                false,
            );
        });
    });

    describe('isEmoji', () => {
        it('should return true if the string is an emoji', () => {
            expect(HelperGeneral.isEmoji('😊')).toBe(true);
        });

        it('should return false if the string is not an emoji', () => {
            expect(HelperGeneral.isEmoji('test')).toBe(false);
        });
    });
});
