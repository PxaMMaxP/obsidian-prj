import { Path } from '../Path';

describe('Path.join', () => {
    it('should join multiple segments correctly', () => {
        expect(Path.join('path', 'to', 'file')).toBe('path/to/file');
    });

    it('should handle leading slashes in segments', () => {
        expect(Path.join('/path', '/to', '/file')).toBe('/path/to/file');
        expect(Path.join('path', '/to', 'file')).toBe('path/to/file');
    });

    it('should handle trailing slashes in segments', () => {
        expect(Path.join('path/', 'to/', 'file/')).toBe('path/to/file/');
    });

    it('should remove double slashes', () => {
        expect(Path.join('path//', 'to//', 'file//')).toBe('path/to/file/');
        expect(Path.join('path', '//to', 'file')).toBe('path/to/file');
    });

    it('should replace backslashes with slashes', () => {
        expect(Path.join('path\\to', 'file')).toBe('path/to/file');
        expect(Path.join('path', 'to\\file')).toBe('path/to/file');
    });

    it('should handle mixed slashes and backslashes', () => {
        expect(Path.join('path/to', 'file\\name')).toBe('path/to/file/name');
        expect(Path.join('path\\to', '/file/name')).toBe('path/to/file/name');
    });

    it('should handle empty segments', () => {
        expect(Path.join('path', '', 'to', 'file')).toBe('path/to/file');
        expect(Path.join('', 'path', 'to', 'file')).toBe('path/to/file');
        expect(Path.join('path', 'to', 'file', '')).toBe('path/to/file');
    });

    it('should handle single segment', () => {
        expect(Path.join('path')).toBe('path');
        expect(Path.join('/path')).toBe('/path');
        expect(Path.join('path/')).toBe('path/');
    });

    it('should handle no segments', () => {
        expect(Path.join()).toBe('');
    });

    it('should handle segments with spaces', () => {
        expect(Path.join('path to', 'file name')).toBe('path to/file name');
    });

    it('should handle segments with special characters', () => {
        expect(Path.join('path@#$', 'to*&^%', 'file()[]')).toBe(
            'path@#$/to*&^%/file()[]',
        );
    });
});
