import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
      {
        title: 'Analytics',
        path: paths.dashboard.analytics,
        icon: ICONS.analytics,
      },
    ],
  },
  /**
   * Trading
   */
  {
    subheader: 'Trading',
    items: [
      {
        title: 'Trades',
        path: paths.dashboard.trades.root,
        icon: ICONS.banking,
      },
    ],
  },
  /**
   * Master Data
   */
  {
    subheader: 'Master Data',
    items: [
      {
        title: 'Coins',
        path: paths.dashboard.coins.root,
        icon: ICONS.ecommerce,
      },
      {
        title: 'Strategies',
        path: paths.dashboard.strategies.root,
        icon: ICONS.kanban,
      },
    ],
  },
  /**
   * Settings
   */
  {
    subheader: 'Account',
    items: [
      {
        title: 'Profile',
        path: paths.dashboard.profile,
        icon: ICONS.user,
      },
      {
        title: 'Settings',
        path: paths.dashboard.settings,
        icon: ICONS.params,
      },
    ],
  },
];
