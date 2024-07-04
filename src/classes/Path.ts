export class Path {
    /**
     * Joins all given path segments into a single path.
     * Replaces all backslashes with slashes, removes double slashes and leading/trailing slashes.
     * @param paths - An array of path segments
     * @returns The combined path
     * @remarks This function is used because Node.js's 'path' module is not available in Obsidian Mobile.
     */
    public static join(...paths: string[]): string {
        return paths
            .map((part, index) => {
                // Replaces all backslashes with slashes
                let normalizedPart = part.replace(/\\/g, '/');

                // Removes leading slashes from all parts except the first
                if (index > 0) {
                    normalizedPart = normalizedPart.replace(/^\//, '');
                }

                return normalizedPart;
            })
            .filter((part) => part.length > 0) // Removes empty parts
            .join('/') // Joins the parts using a slash as a separator
            .replace(/\/{2,}/g, '/'); // Removes double slashes
    }

    /**
     * Sanitizes a filename by removing any characters that are not
     * - alphanumeric,
     * - hyphen,
     * - underscore,
     * - period,
     * - space
     * - or umlauts.
     *
     * @param filename - The filename to sanitize.
     * @returns The sanitized filename.
     */
    public static sanitizeFilename(filename: string): string {
        return filename.replace(/[^a-zA-Z0-9-_. äöüÄÖÜß§]/g, '');
    }
}
