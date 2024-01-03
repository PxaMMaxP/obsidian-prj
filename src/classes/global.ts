import { PrjSettings } from "main";
import { App, Setting } from "obsidian";
import { getAPI } from "obsidian-dataview";
import { DvAPIInterface } from "obsidian-dataview/lib/typings/api";

export default class Global {
    static instance: Global;
    app: App;
    dv: DvAPIInterface;
    settings: PrjSettings;

    constructor(app: App, settings: PrjSettings) {
        // Obsidian App
        if (Global.instance) {
            return Global.instance;
        }
        this.app = app;

        // Settings
        this.settings = settings;
        
        // Dataview
        const dv = getAPI();
        if (!dv) {
            throw new Error("Dataview API not available");
        } else {
            this.dv = dv;
        }

        Global.instance = this;
    }

    static getInstance(app: App | null = null, settings: PrjSettings | null = null): Global {
        if (!Global.instance) {
            if (!app || !settings) {
                throw new Error("Global instance not initialized and no app provided");
            }
            Global.instance = new Global(app, settings);
        }
        return Global.instance;
    }
}