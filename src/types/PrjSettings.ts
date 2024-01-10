export interface PrjSettings {
    logLevel: string;
    language: string;
    user: {
        name: string;
        shortName: string;
        email: string;
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    dateFormat: string;
    dateFormatShort: string;
    defaultMaxShow: number;
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
        "shortName": "",
        "email": "",
        "street": "",
        "city": "",
        "zip": "",
        "country": "",
    },
    "defaultMaxShow": 200,
    documentSettings: {
        "symbol": "📄",
        "hideSymbol": "🗞️",
        "clusterSymbol": "🗂️"
    },
    baseTag: 'PRJ',
    templateFolder: 'Vorlagen/'
};
