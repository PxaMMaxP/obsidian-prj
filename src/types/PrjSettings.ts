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
    noneSymbol: string;
    documentSettings: {
        symbol: string;
        hideSymbol: string;
        clusterSymbol: string;
        defaultFolder: string;
        template: string;
        pdfFolder: string;
    };
    prjSettings: {
        topicSymbol: string;
        topicFolder: string;
        topicTemplate: string;
        projectSymbol: string;
        projectFolder: string;
        projectTemplate: string;
        taskSymbol: string;
        taskFolder: string;
        taskTemplate: string;
        subTaskTemplates: { label: string, template: string }[];
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
    noneSymbol: "diamond",
    documentSettings: {
        "symbol": "file-text",
        "hideSymbol": "file-minus-2",
        "clusterSymbol": "library",
        "defaultFolder": "",
        "template": "",
        "pdfFolder": "",
    },
    prjSettings: {
        "topicSymbol": "album",
        "topicFolder": "Topics/",
        "topicTemplate": "",
        "projectSymbol": "layout-list",
        "projectFolder": "Projects/",
        "projectTemplate": "",
        "taskSymbol": "clipboard",
        "taskFolder": "Tasks/",
        "taskTemplate": "",
        "subTaskTemplates": []
    },
    baseTag: 'PRJ',
    templateFolder: 'Templates/'
};
