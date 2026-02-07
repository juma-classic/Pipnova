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
    DTRADER: 5,
    CHART: 6,
    TUTORIAL: 7,
    SIGNALS: 8,
    PATEL_SIGNALS: 9,
    PATEL_SIGNAL_CENTER: 10,
    ADVANCED_ALGO: 11,
    SIGNAL_SAVVY: 12,
    FAST_LANE: 13,
    ZEN: 14,
    ELVIS_ZONE: 15,
    TICKSHARK: 16,
    COPY_TRADING: 17,
    ACCUMULATOR: 18,
    DIGIT_HACKER: 19,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-free-bots',
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-nova-analysis',
    'id-analysis-tool',
    'id-dtrader',
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
