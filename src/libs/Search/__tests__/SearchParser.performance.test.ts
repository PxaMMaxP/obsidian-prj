import SearchParser from '../SearchParser';

describe('SearchParser Performance', () => {
    it('should handle large input efficiently', () => {
        const largeInput = 'term '.repeat(10000).trim();
        const start = performance.now();
        const query = SearchParser.parse(largeInput);
        const end = performance.now();

        expect(query.getElements()).toHaveLength(19999);
        // eslint-disable-next-line no-console
        console.log(`Parsing large input took ${end - start} ms`);
        expect(end - start).toBeLessThan(100); // 100 ms is speculative
    });
});
