import { useMutation } from '@tanstack/react-query'
import { getProductRepository } from '@/shared/api'
import type { OrderPayload } from '@/shared/model'

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: OrderPayload) => getProductRepository().createOrder(payload),
  })
}
