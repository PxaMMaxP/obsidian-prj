export interface PrjSettings {
    logLevel: string;
    user: Record<string, string>;
    dateFormat: string;
    dateFormatShort: string;
    documentSettings: Record<string, string>;
    baseTag: string;
    templateFolder: string;
}

export const DEFAULT_SETTINGS: PrjSettings = {
    logLevel: "none",
    dateFormat: "DD.MM.YYYY",
    dateFormatShort: "DD.MM.YY",
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
