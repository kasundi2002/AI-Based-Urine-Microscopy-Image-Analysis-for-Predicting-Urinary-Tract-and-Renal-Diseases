import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, Toolbar, List, CssBaseline, Typography, Divider, IconButton, 
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, 
  Drawer as MuiDrawer, AppBar as MuiAppBar, useMediaQuery 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BiotechIcon from '@mui/icons-material/Biotech';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  borderRadius: 0,
  borderRight: '1px solid rgba(0,0,0,0.12)',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  borderRadius: 0,
  borderRight: '1px solid rgba(0,0,0,0.12)',
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  borderRadius: 0,
  background: theme.palette.background.paper,
  backgroundImage: 'none',
  boxShadow: theme.shadows[1],
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

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(true); // Desktop state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile state
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    if (isMobile) {
        setMobileOpen(!mobileOpen);
    } else {
        setOpen(!open);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const drawerContent = (
      <>
        <DrawerHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2, justifyContent: open ? 'space-between' : 'center' }}>
                {open && (
                    <Typography variant="h4" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 0 }}>
                    Uro.Al
                    </Typography>
                )}
                 {!isMobile && (
                     <IconButton onClick={handleDrawerToggle}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                 )}
            </Box>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mb: 1,
                borderRadius: 0,
                '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 229, 255, 0.08)',
                    borderRight: open ? `4px solid ${theme.palette.primary.main}` : 'none',
                    '&:hover': { backgroundColor: 'rgba(0, 229, 255, 0.12)' }
                },
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 'bold' : 'medium',
                    fontSize: '1rem' 
                }}
                sx={{ opacity: open ? 1 : 0 }} 
              />
            </ListItemButton>
          ))}
        </List>
      </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open && !isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
              ...( (open && !isMobile) && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* User Profile Menu */}
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                {user?.name?.charAt(0) || <AccountCircle />}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>{user?.name} ({user?.role})</MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon> <LogoutIcon fontSize="small" /> </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer (Temporary) */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </MuiDrawer>

      {/* Desktop Drawer (Permanent / Varied Width) */}
      <Drawer 
            variant="permanent" 
            open={open} 
            sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
