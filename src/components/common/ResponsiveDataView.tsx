import React, { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface ResponsiveDataViewProps<T> {
  items: T[];
  mobileItems?: T[];
  totalCount: number;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  page: number;
  rowsPerPage: number;
  hasMore?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onLoadMore?: () => void;
  renderTable: () => React.ReactNode;
  renderCard: (item: T, index: number) => React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function ResponsiveDataView<T>({
  items,
  mobileItems,
  totalCount,
  isLoading = false,
  isLoadingMore = false,
  page,
  rowsPerPage,
  hasMore = false,
  onPageChange,
  onRowsPerPageChange,
  onLoadMore,
  renderTable,
  renderCard,
  emptyComponent,
}: ResponsiveDataViewProps<T>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cardItems = mobileItems || items;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '160px',
      threshold: 0.1,
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [handleObserver, hasMore, onLoadMore]);

  if (items.length === 0 && cardItems.length === 0 && !isLoading) {
    return <>{emptyComponent || null}</>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Desktop View (md and up): Full table layout */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {renderTable()}
      </Box>

      {/* 2. Mobile & Tablet View (xs, sm): Card grid with Infinite Scroll */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {cardItems.map((item, index) => renderCard(item, index))}

        {/* Sentinel element for infinite scroll */}
        <Box
          ref={sentinelRef}
          sx={{
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
          }}
        >
          {isLoadingMore ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={20} color="primary" />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Loading more items...
              </Typography>
            </Box>
          ) : hasMore && onLoadMore ? (
            <Button
              variant="outlined"
              size="small"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={onLoadMore}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Load more ({cardItems.length} of {totalCount})
            </Button>
          ) : cardItems.length > 0 ? (
            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
              All {totalCount} items loaded
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
