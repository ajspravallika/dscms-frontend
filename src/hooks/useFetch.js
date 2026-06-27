import { useState, useEffect, useCallback } from 'react';

/**
 * Runs an async fetcher function and tracks { data, isLoading, error }.
 * `extract` pulls the relevant slice out of the backend's standard
 * { success, message, data } envelope, e.g. (res) => res.data.data.students
 *
 * `deps` controls when the fetch re-runs, same semantics as useEffect deps.
 */
export function useFetch(fetcher, extract, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(extract(res));
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, setData };
}
