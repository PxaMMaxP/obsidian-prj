import { Wikilink } from '../Wikilink';

describe('Wikilink', () => {
    const testCases = [
        // 1
        {
            input: '[[2021.01.01 - file.txt|Display text]]',
            expected: {
                date: new Date('2021-01-01'),
                basename: '2021.01.01 - file',
                extension: 'txt',
                filename: '2021.01.01 - file.txt',
                displayText: 'Display text',
            },
        },
        // 2
        {
            input: '[[2021.01.01 - file.txt]]',
            expected: {
                date: new Date('2021-01-01'),
                basename: '2021.01.01 - file',
                extension: 'txt',
                filename: '2021.01.01 - file.txt',
                displayText: undefined,
            },
        },
        // 3
        {
            input: '[[2021.01.01 - file|Display text]]',
            expected: {
                date: new Date('2021-01-01'),
                basename: '2021.01.01 - file',
                extension: 'md',
                filename: '2021.01.01 - file.md',
                displayText: 'Display text',
            },
        },
        // 4
        {
            input: '[[2021.01.01 - file]]',
            expected: {
                date: new Date('2021-01-01'),
                basename: '2021.01.01 - file',
                extension: 'md',
                filename: '2021.01.01 - file.md',
                displayText: undefined,
            },
        },
        // 5
        {
            input: '[[file.txt|Display text]]',
            expected: {
                date: undefined,
                basename: 'file',
                extension: 'txt',
                filename: 'file.txt',
                displayText: 'Display text',
            },
        },
        // 6
        {
            input: '[[file.txt]]',
            expected: {
                date: undefined,
                basename: 'file',
                extension: 'txt',
                filename: 'file.txt',
                displayText: undefined,
            },
        },
        // 7
        {
            input: '[[file|Display text]]',
            expected: {
                date: undefined,
                basename: 'file',
                extension: 'md',
                filename: 'file.md',
                displayText: 'Display text',
            },
        },
        // 8
        {
            input: '[[file]]',
            expected: {
                date: undefined,
                basename: 'file',
                extension: 'md',
                filename: 'file.md',
                displayText: undefined,
            },
        },
        // 9
        {
            input: '[[2021.01.01.md|Display text]]',
            expected: {
                date: new Date('2021-01-01'),
                basename: '2021.01.01',
                extension: 'md',
                filename: '2021.01.01.md',
                displayText: 'Display text',
            },
        },
        // 10
        {
            input: '[[2021.01.01.md]]',
            expected: {
                date: new Date('2021-01-01'),
                basename: '2021.01.01',
                extension: 'md',
                filename: '2021.01.01.md',
                displayText: undefined,
            },
        },
        // 11
        {
            input: 'invalid format',
            expected: {
                date: undefined,
                basename: undefined,
                extension: undefined,
                filename: undefined,
                displayText: undefined,
            },
        },
        // 12
        {
            input: undefined,
            expected: {
                date: undefined,
                basename: undefined,
                extension: undefined,
                filename: undefined,
                displayText: undefined,
            },
        },
    ];

    testCases.forEach((testCase, index) => {
        it(`should correctly parse wikilink - test case ${index + 1}`, () => {
            const wikilink = new Wikilink(testCase.input);
            expect(wikilink.date).toEqual(testCase.expected.date);
            expect(wikilink.basename).toEqual(testCase.expected.basename);
            expect(wikilink.extension).toEqual(testCase.expected.extension);
            expect(wikilink.filename).toEqual(testCase.expected.filename);
            expect(wikilink.displayText).toEqual(testCase.expected.displayText);
        });
    });
});
