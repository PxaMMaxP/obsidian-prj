import SearchParser from '../SearchParser';

describe('SearchQuery Performance', () => {
    it('should match large text efficiently', () => {
        const query = SearchParser.parse('term1 & term2 | !term3');

        const largeText =
            'This is a large text containing term1 and term2 but not term3. '.repeat(
                10000,
            );

        const start = performance.now();
        const result = query.matches(largeText);
        const end = performance.now();

        expect(result).toBe(true);

        // eslint-disable-next-line no-console
        console.log(`Matching large text took ${end - start} ms`);

        expect(end - start).toBeLessThan(50); // 50 ms is speculative
    });
});
