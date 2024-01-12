export interface PrjSettings {
    logLevel: string;
    mobile: boolean;
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
    batchSizeShow: number;
    documentSettings: {
        symbol: string;
        hideSymbol: string;
        clusterSymbol: string;
        defaultFolder: string;
    };
    prjSettings: {
        topicSymbol: string;
        projectSymbol: string;
        taskSymbol: string;
    };
    baseTag: string;
    templateFolder: string;
}

export const DEFAULT_SETTINGS: PrjSettings = {
    logLevel: "none",
    mobile: false,
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
    "batchSizeShow": 25,
    documentSettings: {
        "symbol": "file-text",
        "hideSymbol": "file-minus-2",
        "clusterSymbol": "library",
        "defaultFolder": ""
    },
    prjSettings: {
        "topicSymbol": "album",
        "projectSymbol": "layout-list",
        "taskSymbol": "clipboard"
    },
    baseTag: 'PRJ',
    templateFolder: 'Vorlagen/'
};
