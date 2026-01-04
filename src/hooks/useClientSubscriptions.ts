import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  DatabaseMonitoredSite,
  DatabaseHealthCheck,
  DatabaseHealthEvent,
  DatabaseIncident,
  DatabaseErrorLog,
  MonitoredSite,
  HealthCheck,
  HealthEvent,
  Incident,
  ErrorLog,
  transformMonitoredSite,
  transformHealthCheck,
  transformHealthEvent,
  transformIncident,
  transformErrorLog,
  monitoredSiteToDatabase,
  HealthCheckType,
  CheckResult,
} from '../types/database';

interface SiteWithLastCheck extends DatabaseMonitoredSite {
  last_check_result?: CheckResult;
}

export function useClientSubscriptions(autoRefreshInterval = 30000) {
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all monitored sites with their latest check result
  const fetchSites = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('monitored_sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;

      // For each site, get the latest health event result
      const sitesWithStatus = await Promise.all(
        (sitesData as DatabaseMonitoredSite[]).map(async (site) => {
          // Get health check IDs for this site first
          const { data: checksData } = await supabase
            .from('health_checks')
            .select('id')
            .eq('site_id', site.id)
            .limit(10);

          const transformed = transformMonitoredSite(site);
          
          if (checksData && checksData.length > 0) {
            const checkIds = checksData.map((c) => c.id);
            // Get the most recent health event for any of this site's checks
            const { data: eventData } = await supabase
              .from('health_events')
              .select('result')
              .in('check_id', checkIds)
              .order('checked_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (eventData) {
              transformed.lastCheckResult = (eventData as { result: CheckResult }).result;
            }
          }
          
          return transformed;
        })
      );

      setSites(sitesWithStatus);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sites'));
      console.error('Error fetching sites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchSites();

    if (autoRefreshInterval > 0) {
      const interval = setInterval(fetchSites, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSites, autoRefreshInterval]);

  // Add a new site
  const addSite = async (
    site: Omit<MonitoredSite, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckResult'>
  ): Promise<MonitoredSite> => {
    try {
      const dbSite = monitoredSiteToDatabase(site);
      const { data, error: insertError } = await supabase
        .from('monitored_sites')
        .insert([dbSite])
        .select()
        .single();

      if (insertError) throw insertError;

      const newSite = transformMonitoredSite(data as DatabaseMonitoredSite);
      setSites((prev) => [newSite, ...prev]);
      return newSite;
    } catch (err) {
      console.error('Error adding site:', err);
      throw err;
    }
  };

  // Update a site
  const updateSite = async (
    id: string,
    updates: Partial<Omit<MonitoredSite, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckResult'>>
  ): Promise<MonitoredSite> => {
    try {
      const dbUpdates: Partial<DatabaseMonitoredSite> = {};

      if (updates.siteId !== undefined) dbUpdates.site_id = updates.siteId;
      if (updates.siteName !== undefined) dbUpdates.site_name = updates.siteName;
      if (updates.primaryDomain !== undefined) dbUpdates.primary_domain = updates.primaryDomain;
      if (updates.environment !== undefined) dbUpdates.environment = updates.environment;
      if (updates.subscriptionTier !== undefined) dbUpdates.subscription_tier = updates.subscriptionTier;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.siteSecret !== undefined) dbUpdates.site_secret = updates.siteSecret ?? null;
      if (updates.clientEmail !== undefined) dbUpdates.client_email = updates.clientEmail ?? null;
      if (updates.internalEmail !== undefined) dbUpdates.internal_email = updates.internalEmail;
      if (updates.deploySuppressionMinutes !== undefined) dbUpdates.deploy_suppression_minutes = updates.deploySuppressionMinutes;
      if (updates.trialStartDate !== undefined) dbUpdates.trial_start_date = updates.trialStartDate ?? null;
      if (updates.trialEndDate !== undefined) dbUpdates.trial_end_date = updates.trialEndDate ?? null;
      if (updates.cmsTable !== undefined) dbUpdates.cms_table = updates.cmsTable ?? null;
      if (updates.formsTable !== undefined) dbUpdates.forms_table = updates.formsTable ?? null;

      const { data, error: updateError } = await supabase
        .from('monitored_sites')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedSite = transformMonitoredSite(data as DatabaseMonitoredSite);
      setSites((prev) => prev.map((s) => (s.id === id ? { ...updatedSite, lastCheckResult: s.lastCheckResult } : s)));
      return updatedSite;
    } catch (err) {
      console.error('Error updating site:', err);
      throw err;
    }
  };

  // Delete a site
  const deleteSite = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('monitored_sites')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSites((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting site:', err);
      throw err;
    }
  };

  // Add health checks for a site
  const addHealthChecks = async (
    siteUuid: string,
    checks: Array<{ checkType: HealthCheckType; target: string; enabled?: boolean; intervalMinutes?: number }>
  ): Promise<HealthCheck[]> => {
    try {
      const dbChecks = checks.map((check) => ({
        site_id: siteUuid,
        check_type: check.checkType,
        target: check.target,
        enabled: check.enabled ?? true,
        interval_minutes: check.intervalMinutes ?? 5,
      }));

      const { data, error: insertError } = await supabase
        .from('health_checks')
        .insert(dbChecks)
        .select();

      if (insertError) throw insertError;

      return (data as DatabaseHealthCheck[]).map(transformHealthCheck);
    } catch (err) {
      console.error('Error adding health checks:', err);
      throw err;
    }
  };

  // Generate a secure secret
  const generateSecret = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Test connection to a site's health endpoint
  const testConnection = async (domain: string): Promise<{ ok: boolean; status?: string; error?: string }> => {
    try {
      const response = await fetch(`${domain}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { ok: true, status: data.status };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Connection failed' };
    }
  };

  return {
    sites,
    loading,
    error,
    refetch: fetchSites,
    addSite,
    updateSite,
    deleteSite,
    addHealthChecks,
    generateSecret,
    testConnection,
  };
}

// Hook for fetching site details (events, incidents, errors)
export function useSiteDetails(siteUuid: string | null, autoRefreshInterval = 30000) {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!siteUuid) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch health checks for this site
      const { data: checksData, error: checksError } = await supabase
        .from('health_checks')
        .select('*')
        .eq('site_id', siteUuid)
        .order('created_at', { ascending: true });

      if (checksError) throw checksError;

      const checks = (checksData as DatabaseHealthCheck[]).map(transformHealthCheck);
      setHealthChecks(checks);

      // Get check IDs for fetching events
      const checkIds = checks.map((c) => c.id);

      // Fetch recent health events (last 50)
      if (checkIds.length > 0) {
        const { data: eventsData, error: eventsError } = await supabase
          .from('health_events')
          .select('*, health_checks(check_type, target)')
          .in('check_id', checkIds)
          .order('checked_at', { ascending: false })
          .limit(50);

        if (eventsError) throw eventsError;

        const events = (eventsData as Array<DatabaseHealthEvent & { health_checks: { check_type: HealthCheckType; target: string } }>).map((e) => ({
          ...transformHealthEvent(e),
          checkType: e.health_checks?.check_type,
          target: e.health_checks?.target,
        }));
        setHealthEvents(events);
      } else {
        setHealthEvents([]);
      }

      // Fetch incidents for this site
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .eq('site_id', siteUuid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (incidentsError) throw incidentsError;

      setIncidents((incidentsData as DatabaseIncident[]).map(transformIncident));

      // Fetch error logs for this site
      const { data: errorsData, error: errorsError } = await supabase
        .from('error_logs')
        .select('*')
        .eq('site_id', siteUuid)
        .order('received_at', { ascending: false })
        .limit(50);

      if (errorsError) throw errorsError;

      setErrorLogs((errorsData as DatabaseErrorLog[]).map(transformErrorLog));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch site details'));
      console.error('Error fetching site details:', err);
    } finally {
      setLoading(false);
    }
  }, [siteUuid]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchDetails();

    if (autoRefreshInterval > 0 && siteUuid) {
      const interval = setInterval(fetchDetails, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDetails, autoRefreshInterval, siteUuid]);

  return {
    healthEvents,
    incidents,
    errorLogs,
    healthChecks,
    loading,
    error,
    refetch: fetchDetails,
  };
}

