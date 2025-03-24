interface EngineSettings {
    readonly vsync: boolean;
    readonly resolution: { width: number; height: number };
}

export const defaultSettings: EngineSettings = {
    vsync: false,
    resolution: { width: 1024, height: 768 },
};

export const settingsVsyncOn: EngineSettings = {
    vsync: true,
    resolution: { width: 1024, height: 768 },
};
