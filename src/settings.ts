interface EngineSettings {
    vsync: boolean,
    resolution: {width: number, height: number}
}

export const defaultSettings: EngineSettings = {
    vsync: false,
    resolution: {width: 1024, height: 768}
}