import type { Breakpoint } from '@mui/material/styles';
import type { CreateTradeRequest } from 'src/types/trade';
import type { NavItemProps, NavSectionProps } from 'src/components/nav-section';
import type { MainSectionProps, HeaderSectionProps, LayoutSectionProps } from '../core';

import useSWR from 'swr';
import { toast } from 'sonner';
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { TradingCalculatorDialog } from 'src/components/trading-calculator';

import { useMockedUser } from 'src/auth/hooks';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../nav-config-account';
import { MenuButton } from '../components/menu-button';
import { AccountDrawer } from '../components/account-drawer';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { MainSection, layoutClasses, HeaderSection, LayoutSection } from '../core';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();

  const { user } = useMockedUser();

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const { value: calculatorOpen, onFalse: onCalculatorClose, onTrue: onCalculatorOpen } = useBoolean();

  const navData = slotProps?.nav?.data ?? dashboardNavData;

  // Fetch coins and strategies for trading calculator
  const { data: coinsData, isLoading: coinsLoading, mutate: mutateCoins } = useSWR('/api/coins', () =>
    CoinsService.getAll()
  );
  const { data: strategiesData, isLoading: strategiesLoading, mutate: mutateStrategies } = useSWR(
    '/api/strategies',
    () => StrategiesService.getAll()
  );

  const coins = coinsData?.coins || [];
  const strategies = strategiesData?.strategies || [];

  const handleTakeTrade = async (data: CreateTradeRequest) => {
    try {
      await TradesService.create(data);
      toast.success('Trade created successfully!');
      onCalculatorClose();
      router.push('/dashboard/trades');
    } catch (error) {
      toast.error('Failed to create trade');
      throw error;
    }
  };

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const canDisplayItemByRole = (allowedRoles: NavItemProps['allowedRoles']): boolean =>
    !allowedRoles?.includes(user?.role);

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={layoutQuery}
          cssVars={navVars.section}
          checkPermissions={canDisplayItemByRole}
        />
      ) : null,
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            checkPermissions={canDisplayItemByRole}
          />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Logo
              sx={{
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {/** @slot Divider */}
          {isNavHorizontal && (
            <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />
          )}

          {/* @slot Workspace popover */}
          {/* <WorkspacesPopover
            data={_workspaces}
            sx={{ ...(isNavHorizontal && { color: 'var(--layout-nav-text-primary-color)' }) }}
          /> */}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/* @slot Searchbar */}
          {/* <Searchbar data={navData} /> */}

          {/* @slot Language popover */}
          {/* <LanguagePopover
            data={[
              { value: 'en', label: 'English', countryCode: 'GB' },
              { value: 'fr', label: 'French', countryCode: 'FR' },
              { value: 'vi', label: 'Vietnamese', countryCode: 'VN' },
              { value: 'cn', label: 'Chinese', countryCode: 'CN' },
              { value: 'ar', label: 'Arabic', countryCode: 'SA' },
            ]}
          /> */}

          {/* @slot Notifications popover */}
          {/* <NotificationsDrawer data={_notifications} /> */}

          {/* @slot Contacts popover */}
          {/* <ContactsPopover data={_contacts} /> */}

          {/* @slot Settings button */}
          {/* <SettingsButton /> */}

          {/** @slot Account drawer */}
          <AccountDrawer data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      checkPermissions={canDisplayItemByRole}
      slots={{ bottomArea: null }}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderFooter = () => null;

  const renderMain = () => (
    <>
      <MainSection {...slotProps?.main}>{children}</MainSection>

      {/* Trading Calculator FAB */}
      <Tooltip title="Trading Calculator" placement="left">
        <Fab
          color="primary"
          onClick={onCalculatorOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Iconify icon="solar:bill-list-bold" width={24} />
        </Fab>
      </Tooltip>

      {/* Trading Calculator Dialog */}
      <TradingCalculatorDialog
        open={calculatorOpen}
        onClose={onCalculatorClose}
        coins={coins}
        strategies={strategies}
        coinsLoading={coinsLoading}
        strategiesLoading={strategiesLoading}
        onTakeTrade={handleTakeTrade}
        onCoinCreated={() => mutateCoins()}
        onStrategyCreated={() => mutateStrategies()}
      />
    </>
  );

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
