/**
 * Represents a map of keys and values in a YAML file
 * for mapping the keys to the corresponding properties.
 * @remarks This is necessary if the property does not have the same name in the data class as in the YAML metadata.
 */
export type YamlKeyMap = Record<string, string>;
