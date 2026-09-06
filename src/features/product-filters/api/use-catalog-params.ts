import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  applyCatalogPatch,
  type CatalogParams,
  DEFAULT_CATALOG_PARAMS,
  isCatalogDefault,
  parseCatalogParams,
  serializeCatalogParams,
} from '../model/catalog-params'

export interface CatalogParamsController {
  params: CatalogParams
  hasActiveFilters: boolean
  updateParams: (patch: Partial<CatalogParams>, resetPage?: boolean) => void
  resetFilters: () => void
}

export function useCatalogParams(): CatalogParamsController {
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useMemo(() => parseCatalogParams(searchParams), [searchParams])

  const updateParams = useCallback(
    (patch: Partial<CatalogParams>, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = applyCatalogPatch(parseCatalogParams(current), patch, resetPage)
          return serializeCatalogParams(next)
        },
        { preventScrollReset: true },
      )
    },
    [setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(serializeCatalogParams({ ...DEFAULT_CATALOG_PARAMS, sort: params.sort }), {
      preventScrollReset: true,
    })
  }, [params.sort, setSearchParams])

  return {
    params,
    hasActiveFilters: !isCatalogDefault(params),
    updateParams,
    resetFilters,
  }
}
