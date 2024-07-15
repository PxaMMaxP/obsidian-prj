import { Path } from '../Path';

describe('Path', () => {
    describe('join', () => {
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
            expect(Path.join('path/to', 'file\\name')).toBe(
                'path/to/file/name',
            );

            expect(Path.join('path\\to', '/file/name')).toBe(
                'path/to/file/name',
            );
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

    describe('sanitizeFilename', () => {
        it('should remove invalid characters from the filename', () => {
            const result = Path.sanitizeFilename('inva!@#lid$file%name.txt');
            expect(result).toBe('invalidfilename.txt');
        });

        it('should retain valid characters in the filename', () => {
            const result = Path.sanitizeFilename('valid-file_name.txt');
            expect(result).toBe('valid-file_name.txt');
        });

        it('should retain spaces and umlauts in the filename', () => {
            const result = Path.sanitizeFilename(
                'gültig dateiname äöüÄÖÜß§.txt',
            );
            expect(result).toBe('gültig dateiname äöüÄÖÜß§.txt');
        });

        it('should remove only the invalid characters and keep the valid ones', () => {
            const result = Path.sanitizeFilename('f!@#ile_n@am$e.tx#t');
            expect(result).toBe('file_name.txt');
        });

        it('should handle empty strings', () => {
            const result = Path.sanitizeFilename('');
            expect(result).toBe('');
        });

        it('should handle strings with only invalid characters', () => {
            const result = Path.sanitizeFilename('!@#$%^&*()');
            expect(result).toBe('');
        });
    });
});
