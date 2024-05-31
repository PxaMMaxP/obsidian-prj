/**
 * Type representing the possible search operator values.
 * The operator can be one of the following values: '&', '|' or '!'.
 * @typedef {'&' | '|' | '!'} SearchOperatorType
 */
export type SearchOperatorType = '&' | '|' | '!';
export const SearchOperators: SearchOperatorType[] = ['&', '|', '!'];

/**
 * Type representing the possible search quote values.
 */
export type SearchQuoteType = '"' | "'";
export const SearchQuotes: SearchQuoteType[] = ['"', "'"];
