import SearchParser from '../SearchParser';

describe('SearchQuery', () => {
    it('should match text correctly for a single term', () => {
        const query = SearchParser.parse('term1');
        expect(query.matches('This is a text with term1')).toBe(true);
        expect(query.matches('This is a text without the term')).toBe(false);
    });

    it('should match text correctly for multiple terms with default AND operator', () => {
        const query = SearchParser.parse('term1 term2');
        expect(query.matches('This is a text with term1 and term2')).toBe(true);

        expect(query.matches('This is a text with term1 but not term 2')).toBe(
            false,
        );
    });

    it('should match text correctly for negated terms', () => {
        const query = SearchParser.parse('!term1 term2');

        expect(query.matches('This is a text with term2 but not term 1')).toBe(
            true,
        );

        expect(query.matches('This is a text with term1 and term2')).toBe(
            false,
        );
    });

    it('should match text correctly for quoted terms', () => {
        const query = SearchParser.parse('"term1 term2"');
        expect(query.matches('This is a text with term1 term2')).toBe(true);

        expect(query.matches('This is a text with term1 and term2')).toBe(
            false,
        );
    });

    it('should match text correctly for complex queries', () => {
        const query = SearchParser.parse('"term1 term2" & !term3 | term4');
        expect(query.matches('This text has term1 term2 and term4')).toBe(true);

        expect(query.matches('This text has term1 term2 but not term 3')).toBe(
            true,
        );
        expect(query.matches('This text has term3 but not term 4')).toBe(false);
    });

    it('should match text correctly with special characters', () => {
        const query = SearchParser.parse('term1@term2#term3');

        expect(query.matches('This is a text with term1@term2#term3')).toBe(
            true,
        );

        expect(query.matches('This is a text with term1 term2 term3')).toBe(
            false,
        );
    });

    it('should handle empty search text gracefully', () => {
        const query = SearchParser.parse('');
        expect(query.matches('Any text')).toBe(false);
    });

    it('should match text correctly for multiple spaces', () => {
        const query = SearchParser.parse('term1   term2');
        expect(query.matches('This is a text with term1 and term2')).toBe(true);
        expect(query.matches('This is a text with term1')).toBe(false);
    });

    it('should match text correctly for terms with escaped quotes', () => {
        const query = SearchParser.parse('"term1 \\"escaped\\" term2" term3');

        expect(
            query.matches(
                'This is a text with term1 "escaped" term2 and term3',
            ),
        ).toBe(true);

        expect(
            query.matches('This is a text with term1 escaped term2 and term3'),
        ).toBe(false);
    });

    it('should match text correctly for mixed quotes', () => {
        const query = SearchParser.parse('\'term1 term2\' "term3 term4"');

        expect(
            query.matches('This is a text with term1 term2 and term3 term4'),
        ).toBe(true);

        expect(query.matches('This is a text with term1 term2 and term3')).toBe(
            false,
        );
    });
});
