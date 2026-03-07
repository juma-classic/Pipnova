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
    BOT_BUILDER: 0,
    DASHBOARD: 1,
    CHART: 2,
    TUTORIAL: 3,
    HEDGE_STRATEGY: 4,
    ANALYSIS_TOOL: 5,
    SIGNALS: 6,
    XDTRADER: 7,
    COPY_TRADING: 8,
    FREE_BOTS: 9,
    NOVA_ANALYSIS: 10,
    PATEL_SIGNALS: 11,
    PATEL_SIGNAL_CENTER: 12,
    ADVANCED_ALGO: 13,
    SIGNAL_SAVVY: 14,
    FAST_LANE: 15,
    ZEN: 16,
    ELVIS_ZONE: 17,
    TICKSHARK: 18,
    ACCUMULATOR: 19,
    DIGIT_HACKER: 20,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-bot-builder',
    'id-dbot-dashboard',
    'id-charts',
    'id-tutorials',
    'id-hedge-strategy',
    'id-analysis-tool',
    'id-signals',
    'id-xdtrader',
    'id-copy-trading',
    'id-free-bots',
    'id-nova-analysis',
    'id-patel-signals',
    'id-patel-signal-center',
    'id-advanced-algo',
    'id-signal-savvy',
    'id-fast-lane',
    'id-zen',
    'id-elvis-zone',
    'id-tickshark',
    'id-accumulator',
    'id-digit-hacker',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
