import React, { useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { CardLoadingSkeleton } from './LoadingSkeleton';

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
      rootMargin: '200px',
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

        {/* Pure Card Skeletons when fetching next page */}
        {isLoadingMore && (
          <Box sx={{ mt: 0.5 }}>
            <CardLoadingSkeleton cards={2} />
          </Box>
        )}

        {/* Sentinel element for infinite scroll */}
        <Box
          ref={sentinelRef}
          sx={{
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 24,
          }}
        >
          {!isLoadingMore && hasMore && onLoadMore ? (
            <Button
              variant="outlined"
              size="small"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={onLoadMore}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2 }}
            >
              Load more ({cardItems.length} of {totalCount})
            </Button>
          ) : !hasMore && cardItems.length > 0 ? (
            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
              All {totalCount} items loaded
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
