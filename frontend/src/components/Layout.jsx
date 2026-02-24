import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { 
  Box, Toolbar, List, CssBaseline, Typography, Divider, IconButton, 
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, 
  Drawer as MuiDrawer, AppBar as MuiAppBar, useMediaQuery, 
  Divider as MuiDivider, Tooltip, Chip, Badge
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BiotechIcon from '@mui/icons-material/Biotech';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  borderRadius: 0,
  borderRight: 'none',
  background: 'linear-gradient(180deg, #0a0f1e 0%, #111827 50%, #0f172a 100%)',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
  borderRadius: 0,
  borderRight: 'none',
  background: 'linear-gradient(180deg, #0a0f1e 0%, #111827 50%, #0f172a 100%)',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  borderRadius: 0,
  background: theme.palette.background.paper,
  backgroundImage: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  borderBottom: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.08),
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const getRoleBadge = (role) => {
  switch (role) {
    case 'MLT': return { label: 'Lab Technician', color: '#00bcd4' };
    case 'CLINICIAN': return { label: 'Clinician', color: '#7c4dff' };
    case 'PATIENT': return { label: 'Patient', color: '#66bb6a' };
    default: return { label: role, color: '#9e9e9e' };
  }
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    if (isMobile) { setMobileOpen(!mobileOpen); } 
    else { setOpen(!open); }
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); navigate('/login'); };

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'MLT':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/mlt-dashboard?view=dashboard' },
          { text: 'Analysis', icon: <BiotechIcon />, path: '/mlt-dashboard?view=analysis' },
          { text: 'Results', icon: <AssignmentIcon />, path: '/mlt-dashboard?view=results' }, 
          { text: 'Patients', icon: <PersonIcon />, path: '/mlt-dashboard?view=patients' },
        ];
      case 'CLINICIAN':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/clinician-dashboard?view=dashboard' },
          { text: 'Patient Management', icon: <PersonIcon />, path: '/clinician-dashboard?view=patients' },
          { text: 'Diagnostic Review', icon: <AssignmentIcon />, path: '/clinician-dashboard?view=review' },
        ];
      case 'PATIENT':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/patient-portal?view=dashboard' },
          { text: 'Analysis', icon: <BiotechIcon />, path: '/patient-portal?view=analysis' },
          { text: 'Results', icon: <AssignmentIcon />, path: '/patient-portal?view=results' }, 
        ];
      default: return [];
    }
  };

  const menuItems = getMenuItems();
  const roleBadge = getRoleBadge(user?.role);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Header */}
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: open ? 2.5 : 1, justifyContent: open ? 'space-between' : 'center' }}>
          {open && (
            <Box>
              <Typography variant="h6" noWrap sx={{ color: '#00bcd4', fontWeight: 850, fontSize: '1.75rem', letterSpacing: -0.5, lineHeight: 1.2, mt: 1, mb: -1 }}>
                Uro.AI
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                Diagnostics
              </Typography>
            </Box>
          )}
          {!open && (
            <Typography sx={{ color: '#00bcd4', fontWeight: 900, fontSize: '1rem' }}>U</Typography>
          )}
          {!isMobile && open && (
            <IconButton 
              onClick={handleDrawerToggle} 
              sx={{ 
                color: alpha('#fff', 0.4), width: 28, height: 28,
                '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.06) } 
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </DrawerHeader>

      {/* Subtle separator */}
      {/* <Box sx={{ mx: open ? 2.5 : 1.5, my: 0.5, height: 1, bgcolor: alpha('#fff', 0.06), borderRadius: 1 }} /> */}

      {/* Section label */}
      {open && (
        <Typography variant="caption" sx={{ 
          px: 3, pt: 2, pb: 1, color: alpha('#fff', 0.3), fontSize: '0.65rem', 
          fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase'
        }}>
          Navigation
        </Typography>
      )}

      {/* Nav Items */}
      <List sx={{ px: open ? 1.5 : 1, mt: open ? 0 : 1, flex: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname + location.search === item.path;
          return (
            <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                selected={isSelected}
                sx={{
                  minHeight: 44,
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 2 : 1.5,
                  mb: 0.5,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    backgroundColor: alpha('#00bcd4', 0.1),
                    '&:hover': { backgroundColor: alpha('#00bcd4', 0.14) },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      height: '60%',
                      width: 3,
                      borderRadius: '0 3px 3px 0',
                      background: 'linear-gradient(180deg, #00bcd4, #0097a7)',
                      boxShadow: '0 0 8px rgba(0,188,212,0.4)',
                    }
                  },
                  '&:hover': { backgroundColor: alpha('#fff', 0.04) },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isSelected ? '#00bcd4' : alpha('#fff', 0.45),
                    transition: 'color 0.2s',
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.85rem',
                    color: isSelected ? '#fff' : alpha('#fff', 0.65),
                    letterSpacing: isSelected ? 0 : -0.1,
                  }}
                  sx={{ opacity: open ? 1 : 0, transition: 'opacity 0.2s' }} 
                />
                {isSelected && open && (
                  <Box sx={{ 
                    width: 6, height: 6, borderRadius: '50%', 
                    bgcolor: '#00bcd4', 
                    boxShadow: '0 0 6px rgba(0,188,212,0.6)' 
                  }} />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: 'auto' }}>
        {/* Help & Settings */}
        {open && (
          <Typography variant="caption" sx={{ 
            px: 3, pt: 1, pb: 0.5, color: alpha('#fff', 0.3), fontSize: '0.65rem', 
            fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block'
          }}>
            Support
          </Typography>
        )}
        <List sx={{ px: open ? 1.5 : 1, pb: 0.5 }}>
          {[
            { text: 'Settings', icon: <SettingsIcon /> },
            { text: 'Help Center', icon: <HelpOutlineIcon /> },
          ].map(item => (
            <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
              <ListItemButton sx={{ 
                minHeight: 40, justifyContent: open ? 'initial' : 'center',
                px: open ? 2 : 1.5, mb: 0.3, borderRadius: 2,
                '&:hover': { bgcolor: alpha('#fff', 0.04) }
              }}>
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center', color: alpha('#fff', 0.35) }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500, color: alpha('#fff', 0.5) }}
                  sx={{ opacity: open ? 1 : 0 }} 
                />
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* Separator */}
        {/* <Box sx={{ mx: open ? 2.5 : 1.5, height: 1, bgcolor: alpha('#fff', 0.06), borderRadius: 1 }} /> */}

        {/* User Profile Card */}
        <Box sx={{ p: open ? 2 : 1.5, pb: open ? 2.5 : 2 }}>
          <Box 
            onClick={handleMenu}
            sx={{ 
              display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
              p: open ? 1.5 : 1, borderRadius: 2.5,
              bgcolor: alpha('#fff', 0.03),
              border: '1px solid', borderColor: alpha('#fff', 0.06),
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha('#fff', 0.06), borderColor: alpha('#fff', 0.1) },
              justifyContent: open ? 'flex-start' : 'center'
            }}
          >
            <Avatar sx={{ 
              width: 34, height: 34, fontSize: '0.8rem', fontWeight: 800,
              background: `linear-gradient(135deg, ${roleBadge.color}, ${alpha(roleBadge.color, 0.7)})`,
              boxShadow: `0 2px 8px ${alpha(roleBadge.color, 0.3)}`,
            }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            {open && (
              <>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.3 }} noWrap>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: roleBadge.color, fontWeight: 600, fontSize: '0.65rem' }}>
                    {roleBadge.label}
                  </Typography>
                </Box>
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: alpha('#fff', 0.3) }} />
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open && !isMobile} elevation={0}>
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <IconButton
            color="black"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ marginRight: 3, ...((open && !isMobile) && { display: 'none' }), }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notification Bell */}
          <IconButton sx={{ mr: 1, color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) } }}>
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
              <NotificationsNoneIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {/* User Avatar in AppBar */}
          <Box 
            onClick={handleMenu}
            sx={{ 
              display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
              py: 0.5, px: 1.5, borderRadius: 3,
              transition: 'all 0.15s',
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) }
            }}
          >
            <Avatar sx={{ 
              width: 32, height: 32, fontSize: '0.75rem', fontWeight: 800,
              background: `linear-gradient(135deg, ${roleBadge.color}, ${alpha(roleBadge.color, 0.7)})`,
            }}>
              {user?.name?.charAt(0) || <AccountCircle />}
            </Avatar>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1, borderRadius: 2.5, minWidth: 200,
                border: '1px solid', borderColor: 'divider',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'visible',
                '&::before': {
                  content: '""', display: 'block', position: 'absolute',
                  top: -6, right: 20, width: 12, height: 12,
                  bgcolor: 'background.paper', transform: 'rotate(45deg)',
                  border: '1px solid', borderColor: 'divider',
                  borderBottom: 'none', borderRight: 'none',
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="caption" sx={{ color: roleBadge.color, fontWeight: 600 }}>{roleBadge.label}</Typography>
            </Box>
            <MenuItem 
              onClick={() => { handleClose(); navigate('/profile'); }} 
              sx={{ mx: 1, my: 0.5, borderRadius: 1.5, fontSize: '0.85rem' }}
            >
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              My Profile
            </MenuItem>
            <MuiDivider sx={{ mx: 1.5 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{ mx: 1, my: 0.5, borderRadius: 1.5, fontSize: '0.85rem', color: '#ef5350' }}
            >
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ef5350' }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', width: drawerWidth, 
            background: 'linear-gradient(180deg, #0a0f1e 0%, #111827 50%, #0f172a 100%)', 
            borderRight: 'none' 
          },
        }}
      >
        {drawerContent}
      </MuiDrawer>

      {/* Desktop Drawer */}
      <Drawer variant="permanent" open={open} sx={{ display: { xs: 'none', md: 'block' } }}>
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
