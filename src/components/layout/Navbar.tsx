import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useAuth } from '../../context/AuthContext';
import { useUIStore, ThemeMode } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenAddModal: () => void;
  onDrawerToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal, onDrawerToggle }) => {
  const { user, profile, signOut } = useAuth();
  const { themeMode, setThemeMode } = useUIStore();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleThemeMenuClose = (mode?: ThemeMode) => {
    if (mode) setThemeMode(mode);
    setThemeAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left Side: Drawer Toggle & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
              Job<span style={{ color: '#2563eb' }}>Flow</span>
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Quick Add, Theme switcher, Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={onOpenAddModal}
            sx={{
              fontWeight: 600,
              display: { xs: 'none', sm: 'inline-flex' },
              px: 2,
              py: 0.75,
            }}
          >
            Add Application
          </Button>

          <IconButton
            color="primary"
            onClick={onOpenAddModal}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <AddIcon />
          </IconButton>

          {/* Theme Selector Button */}
          <Tooltip title="Theme mode">
            <IconButton onClick={handleThemeMenuOpen} size="small" color="inherit">
              {themeMode === 'light' && <LightModeOutlinedIcon fontSize="small" />}
              {themeMode === 'dark' && <DarkModeOutlinedIcon fontSize="small" />}
              {themeMode === 'system' && <SettingsBrightnessOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={themeAnchorEl}
            open={Boolean(themeAnchorEl)}
            onClose={() => handleThemeMenuClose()}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleThemeMenuClose('light')} selected={themeMode === 'light'}>
              <ListItemIcon>
                <LightModeOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Light" />
            </MenuItem>
            <MenuItem onClick={() => handleThemeMenuClose('dark')} selected={themeMode === 'dark'}>
              <ListItemIcon>
                <DarkModeOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Dark" />
            </MenuItem>
            <MenuItem onClick={() => handleThemeMenuClose('system')} selected={themeMode === 'system'}>
              <ListItemIcon>
                <SettingsBrightnessOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="System default" />
            </MenuItem>
          </Menu>

          {/* User Profile Avatar */}
          {user && (
            <>
              <Tooltip title={displayName}>
                <IconButton onClick={handleProfileMenuOpen} size="small">
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      backgroundColor: 'primary.main',
                    }}
                  >
                    {initial}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate('/settings');
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Log out" sx={{ color: 'error.main' }} />
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
