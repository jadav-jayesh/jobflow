import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onItemClick,
  isMobile = false,
}) => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
    { label: 'Applications', path: '/applications', icon: <WorkOutlineOutlinedIcon /> },
    { label: 'Follow-ups', path: '/followups', icon: <NotificationsActiveOutlinedIcon /> },
    { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
    ...(profile?.role === 'admin'
      ? [{ label: 'Admin Console', path: '/admin', icon: <AdminPanelSettingsOutlinedIcon /> }]
      : []),
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        pt: isMobile ? 'max(16px, env(safe-area-inset-top))' : 2,
        pb: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : 1.5,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {/* Mobile Header Bar with Logo and Close Button */}
        {isMobile && (
          <Box sx={{ px: 2, pb: 1.5, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <BrandLogo size={32} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem' }}>
                  CareerPulse
                </Typography>
              </Box>
              <IconButton size="small" onClick={onItemClick} sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mt: 1.5 }} />
          </Box>
        )}

        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              px: 3,
              mb: 1.5,
              display: 'block',
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: '0.05em',
            }}
          >
            MENU
          </Typography>
        )}

        <List sx={{ px: collapsed ? 1 : 1.5, py: 0 }}>
          {navItems.map((item) => {
            const isSelected = location.pathname.startsWith(item.path);

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.75 }}>
                <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      navigate(item.path);
                      if (onItemClick) onItemClick();
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      px: collapsed ? 1.5 : 2,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      minHeight: 44,
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#ffffff',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 36,
                        justifyContent: 'center',
                        color: isSelected ? '#ffffff' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: '0.9rem',
                              fontWeight: isSelected ? 700 : 500,
                              whiteSpace: 'nowrap',
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Collapse Toggle at Bottom for Desktop */}
      {!isMobile && onToggleCollapse && (
        <Box sx={{ px: 1.5, pt: 1 }}>
          <Divider sx={{ mb: 1.5 }} />
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right" arrow>
            <ListItemButton
              onClick={onToggleCollapse}
              sx={{
                borderRadius: 2,
                py: 1,
                px: collapsed ? 1.5 : 2,
                justifyContent: collapsed ? 'center' : 'space-between',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {collapsed ? (
                  <ChevronRightIcon fontSize="small" />
                ) : (
                  <>
                    <ChevronLeftIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Collapse Sidebar
                    </Typography>
                  </>
                )}
              </Box>
            </ListItemButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
