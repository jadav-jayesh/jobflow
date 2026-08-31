import { useMemo } from 'react';
import { useApplications } from './useApplications';
import { useFollowups } from './useFollowups';
import { useAuth } from '../context/AuthContext';
import { getFollowupState } from '../utils/followupEngine';
import { getTodayISODate } from '../utils/dateUtils';
import { ApplicationStatus } from '../types/application';

export function useDashboardStats() {
  const { profile } = useAuth();
  const { applications, isLoading: appsLoading } = useApplications();
  const { followups, isLoading: followupsLoading } = useFollowups();

  const timezone = profile?.timezone || 'UTC';
  const today = getTodayISODate(timezone);

  const stats = useMemo(() => {
    const total = applications.length;

    // Counts by status
    const statusCounts: Record<ApplicationStatus, number> = {
      Applied: 0,
      'HR Contact': 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    let appsThisWeek = 0;
    let appsThisMonth = 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
      const appDate = new Date(app.applied_date);
      if (appDate >= sevenDaysAgo) appsThisWeek++;
      if (appDate >= thirtyDaysAgo) appsThisMonth++;
    });

    // Follow-ups breakdown
    let todayCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    const todayFollowupsList: typeof followups = [];
    const upcomingFollowupsList: typeof followups = [];
    const overdueFollowupsList: typeof followups = [];

    followups.forEach((f) => {
      const state = getFollowupState(
        f,
        f.applications?.status as ApplicationStatus,
        timezone
      );

      if (state === 'Today') {
        todayCount++;
        todayFollowupsList.push(f);
      } else if (state === 'Overdue') {
        overdueCount++;
        overdueFollowupsList.push(f);
      } else if (state === 'Upcoming') {
        upcomingCount++;
        upcomingFollowupsList.push(f);
      } else if (state === 'Completed') {
        completedCount++;
      }
    });

    // Performance Rates
    const responsesReceived = applications.filter(
      (a) => a.status !== 'Applied' && a.status !== 'Withdrawn'
    ).length;
    const responseRate = total > 0 ? Math.round((responsesReceived / total) * 100) : 0;

    const interviewsCount = statusCounts['Interview'] + statusCounts['Selected'];
    const interviewRate = total > 0 ? Math.round((interviewsCount / total) * 100) : 0;

    const selectedCount = statusCounts['Selected'];
    const selectionRate = total > 0 ? Math.round((selectedCount / total) * 100) : 0;

    // Status Chart Data
    const statusChartData = [
      { name: 'Applied', value: statusCounts['Applied'], color: '#0288d1' },
      { name: 'HR Contact', value: statusCounts['HR Contact'], color: '#ed6c02' },
      { name: 'Interview', value: statusCounts['Interview'], color: '#7b1fa2' },
      { name: 'Selected', value: statusCounts['Selected'], color: '#2e7d32' },
      { name: 'Rejected', value: statusCounts['Rejected'], color: '#d32f2f' },
      { name: 'Withdrawn', value: statusCounts['Withdrawn'], color: '#757575' },
    ].filter((item) => item.value > 0);

    // Applications per Month (last 6 months)
    const monthMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('en-US', { month: 'short' });
      monthMap.set(monthKey, 0);
    }

    applications.forEach((app) => {
      const d = new Date(app.applied_date);
      const monthKey = d.toLocaleString('en-US', { month: 'short' });
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
      }
    });

    const monthlyChartData = Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      applications: count,
    }));

    return {
      total,
      statusCounts,
      appsThisWeek,
      appsThisMonth,
      todayCount,
      overdueCount,
      upcomingCount,
      completedCount,
      responseRate,
      interviewRate,
      selectionRate,
      todayFollowupsList,
      upcomingFollowupsList,
      overdueFollowupsList,
      recentApplications: applications.slice(0, 5),
      statusChartData,
      monthlyChartData,
    };
  }, [applications, followups, timezone, today]);

  return {
    stats,
    isLoading: appsLoading || followupsLoading,
  };
}
