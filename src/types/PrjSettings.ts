export interface PrjSettings {
    logLevel: string;
    language: string;
    user: {
        name: string;
        email: string;
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    dateFormat: string;
    dateFormatShort: string;
    documentSettings: {
        symbol: string;
        hideSymbol: string;
        clusterSymbol: string;
    };
    baseTag: string;
    templateFolder: string;
}

export const DEFAULT_SETTINGS: PrjSettings = {
    logLevel: "none",
    language: "en",
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
        "clusterSymbol": "🗂️"
    },
    baseTag: 'PRJ',
    templateFolder: 'Vorlagen/'
};
