interface EngineSettings {
    readonly vsync: boolean;
    readonly resolution: { width: number; height: number };
    readonly maxStaticObjects: number;
}

export const defaultSettings: EngineSettings = {
    vsync: false,
    resolution: { width: 1024, height: 768 },
    maxStaticObjects: 2048
};

export const settingsVsyncOn: EngineSettings = {
    vsync: true,
    resolution: { width: 1024, height: 768 },
    maxStaticObjects: 2048
};
