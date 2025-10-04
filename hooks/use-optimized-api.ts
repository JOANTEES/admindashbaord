import { useState, useEffect, useCallback, useRef } from 'react'
import { optimizedApiClient } from '@/lib/api-cache'

interface UseApiOptions {
  cacheTime?: number
  staleTime?: number
  retryCount?: number
  retryDelay?: number
  skipCache?: boolean
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchInterval?: number
}

interface UseApiResult<T> {
  data: T | null
  error: string | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  refetch: () => Promise<void>
  invalidate: () => void
}

export function useOptimizedApi<T = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    cacheTime,
    staleTime,
    retryCount,
    retryDelay,
    skipCache = false,
    enabled = true,
    refetchOnWindowFocus = true,
    refetchInterval,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      setIsError(false)

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      const response = await optimizedApiClient.get<T>(endpoint, {
        cacheTime,
        staleTime,
        retryCount,
        retryDelay,
        skipCache,
      })

      if (abortControllerRef.current.signal.aborted) {
        return
      }

      if (response.error) {
        throw new Error(response.error)
      }

      setData(response.data)
      setIsSuccess(true)
      setIsError(false)
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setIsError(true)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, cacheTime, staleTime, retryCount, retryDelay, skipCache, enabled])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {
    optimizedApiClient.invalidateCache(endpoint)
    setData(null)
    setIsSuccess(false)
  }, [endpoint])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, refetchOnWindowFocus])

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return

    intervalRef.current = setInterval(() => {
      fetchData()
    }, refetchInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData, refetchInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    refetch,
    invalidate,
  }
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions {
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
  invalidateQueries?: string[]
}

interface UseMutationResult<T> {
  mutate: (data?: unknown) => Promise<T | null>
  isLoading: boolean
  error: string | null
  isError: boolean
  isSuccess: boolean
}

export function useOptimizedMutation<T = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: UseMutationOptions = {}
): UseMutationResult<T> {
  const { onSuccess, onError, invalidateQueries = [] } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const mutate = useCallback(async (data?: unknown): Promise<T | null> => {
    try {
      setIsLoading(true)
      setError(null)
      setIsError(false)
      setIsSuccess(false)

      let response: { data: T; error?: string }

      switch (method) {
        case 'POST':
          response = await optimizedApiClient.post<T>(endpoint, data)
          break
        case 'PUT':
          response = await optimizedApiClient.put<T>(endpoint, data)
          break
        case 'DELETE':
          response = await optimizedApiClient.delete<T>(endpoint)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      if (response.error) {
        throw new Error(response.error)
      }

      // Invalidate related queries
      invalidateQueries.forEach(query => {
        optimizedApiClient.invalidateCache(query)
      })

      setIsSuccess(true)
      onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setIsError(true)
      onError?.(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, method, onSuccess, onError, invalidateQueries])

  return {
    mutate,
    isLoading,
    error,
    isError,
    isSuccess,
  }
}
