import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as cartApi from '../api/cart'
import useAuthStore from '../store/authStore'

export const useCartQuery = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!user,
    initialData: { items: [], subtotal: 0 },
  })
}

export const useWishlistQuery = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: cartApi.getWishlist,
    enabled: !!user,
    initialData: [],
  })
}

function useInvalidateCart() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['cart'] })
}

export function useAddToCart() {
  const invalidate = useInvalidateCart()
  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      invalidate()
      toast.success('Added to cart')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not add to cart'),
  })
}

export function useUpdateCartItem() {
  const invalidate = useInvalidateCart()
  return useMutation({
    mutationFn: ({ id, quantity }) => cartApi.updateCartItem(id, quantity),
    onSuccess: invalidate,
  })
}

export function useRemoveCartItem() {
  const invalidate = useInvalidateCart()
  return useMutation({
    mutationFn: cartApi.removeCartItem,
    onSuccess: () => {
      invalidate()
      toast.success('Removed from cart')
    },
  })
}

export function useToggleWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cartApi.toggleWishlist,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success(data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist')
    },
    onError: () => toast.error('Please sign in to use your wishlist'),
  })
}
