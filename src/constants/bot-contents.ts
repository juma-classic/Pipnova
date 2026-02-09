type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    FREE_BOTS: 0,
    DASHBOARD: 1,
    BOT_BUILDER: 2,
    NOVA_ANALYSIS: 3,
    ANALYSIS_TOOL: 4,
    CHART: 5,
    TUTORIAL: 6,
    SIGNALS: 7,
    PATEL_SIGNALS: 8,
    PATEL_SIGNAL_CENTER: 9,
    ADVANCED_ALGO: 10,
    SIGNAL_SAVVY: 11,
    FAST_LANE: 12,
    ZEN: 13,
    ELVIS_ZONE: 14,
    TICKSHARK: 15,
    COPY_TRADING: 16,
    ACCUMULATOR: 17,
    DIGIT_HACKER: 18,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-free-bots',
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-nova-analysis',
    'id-analysis-tool',
    'id-charts',
    'id-tutorials',
    'id-signals',
    'id-patel-signals',
    'id-patel-signal-center',
    'id-advanced-algo',
    'id-signal-savvy',
    'id-fast-lane',
    'id-zen',
    'id-elvis-zone',
    'id-tickshark',
    'id-copy-trading',
    'id-accumulator',
    'id-digit-hacker',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
