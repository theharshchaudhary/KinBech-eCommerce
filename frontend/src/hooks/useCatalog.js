import { useQuery } from '@tanstack/react-query'
import * as catalog from '../api/catalog'
import * as misc from '../api/misc'

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: catalog.getCategories, staleTime: 5 * 60 * 1000 })

export const useBrands = () =>
  useQuery({ queryKey: ['brands'], queryFn: catalog.getBrands, staleTime: 5 * 60 * 1000 })

export const useProducts = (params) =>
  useQuery({ queryKey: ['products', params], queryFn: () => catalog.getProducts(params), placeholderData: (prev) => prev })

export const useProduct = (slug) =>
  useQuery({ queryKey: ['product', slug], queryFn: () => catalog.getProduct(slug), enabled: !!slug })

export const useRelatedProducts = (slug) =>
  useQuery({ queryKey: ['related-products', slug], queryFn: () => catalog.getRelatedProducts(slug), enabled: !!slug })

export const usePublicSettings = () =>
  useQuery({ queryKey: ['public-settings'], queryFn: misc.getPublicSettings, staleTime: 10 * 60 * 1000 })
