import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Applications', path: '/applications', icon: <WorkOutlineOutlinedIcon /> },
  { label: 'Follow-ups', path: '/followups', icon: <NotificationsActiveOutlinedIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', pt: 2 }}>
      <Typography
        variant="caption"
        sx={{
          px: 3,
          mb: 1,
          display: 'block',
          fontWeight: 700,
          color: 'text.secondary',
          letterSpacing: '0.05em',
        }}
      >
        MENU
      </Typography>
      <List sx={{ px: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const isSelected = location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (onItemClick) onItemClick();
                }}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
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
                    minWidth: 36,
                    color: isSelected ? '#ffffff' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 700 : 500,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
