export interface PrjSettings {
    user: Record<string, string>;
    documentSettings: Record<string, string>;
    baseTag: string;
    templateFolder: string;
}

export const DEFAULT_SETTINGS: PrjSettings = {
    user: {
        "name": "",
        "email": "",
        "street": "",
        "city": "",
        "zip": "",
        "country": "",
    },
    documentSettings: {
        "symbol": "📄",
        "hideSymbol": "🗞️",
        "clusterSymbol": "🗂️",
        "from": "from:",
        "to": "to:",
    },
    baseTag: 'PRJ',
    templateFolder: 'Vorlagen/'
};
