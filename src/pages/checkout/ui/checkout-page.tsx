import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2, ShoppingCart } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { selectCartTotals, useCartStore } from '@/entities/cart'
import { useCreateOrder } from '@/entities/order'
import { useAuthStore } from '@/entities/user'
import { formatPrice } from '@/shared/lib'
import {
  type CheckoutContact,
  type CheckoutDelivery,
  checkoutContactSchema,
  checkoutDeliverySchema,
} from '@/shared/model/checkout'
import { Button } from '@/shared/ui'
import { CheckoutSteps } from '@/widgets/checkout-steps'

const inputClass =
  'w-full rounded-btn border border-border bg-background px-3 py-2.5 text-16 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'

interface FieldProps {
  label: string
  optional?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

function Field({ label, optional = false, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-14 font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(необязательно)</span>}
      </span>
      {children}
      {error !== undefined ? (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      ) : hint !== undefined ? (
        <p className="text-12 text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

interface ContactStepProps {
  defaultValues: CheckoutContact
  onSubmit: (data: CheckoutContact) => void
}

function ContactStep({ defaultValues, onSubmit }: ContactStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutContact>({ resolver: zodResolver(checkoutContactSchema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field label="Имя и фамилия" error={errors.name?.message}>
        <input
          type="text"
          autoComplete="name"
          placeholder="Иван Иванов"
          className={inputClass}
          {...register('name')}
        />
      </Field>
      <Field label="Телефон" error={errors.phone?.message} hint="Позвоним для подтверждения заказа">
        <input
          type="tel"
          autoComplete="tel"
          placeholder="+7 900 000-00-00"
          className={inputClass}
          {...register('phone')}
        />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.ru"
          className={inputClass}
          {...register('email')}
        />
      </Field>
      <div className="mt-2 flex justify-end">
        <Button type="submit">
          Далее
          <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </Button>
      </div>
    </form>
  )
}

interface DeliveryStepProps {
  defaultValues: CheckoutDelivery
  onSubmit: (data: CheckoutDelivery) => void
  onBack: () => void
}

function DeliveryStep({ defaultValues, onSubmit, onBack }: DeliveryStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutDelivery>({ resolver: zodResolver(checkoutDeliverySchema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field label="Город" error={errors.city?.message}>
        <input
          type="text"
          autoComplete="address-level2"
          placeholder="Москва"
          className={inputClass}
          {...register('city')}
        />
      </Field>
      <Field label="Адрес" error={errors.address?.message}>
        <input
          type="text"
          autoComplete="street-address"
          placeholder="Улица, дом, квартира"
          className={inputClass}
          {...register('address')}
        />
      </Field>
      <Field label="Комментарий" optional error={errors.comment?.message}>
        <textarea
          rows={3}
          placeholder="Курьеру или по доставке…"
          className={inputClass}
          {...register('comment')}
        />
      </Field>
      <div className="mt-2 flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden="true" strokeWidth={1.75} />
          Назад
        </Button>
        <Button type="submit">
          Далее
          <ArrowRight aria-hidden="true" strokeWidth={1.75} />
        </Button>
      </div>
    </form>
  )
}

interface ConfirmProps {
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
  error: string | null
}

function ConfirmStep({ onSubmit, onBack, submitting, error }: ConfirmProps) {
  const lines = useCartStore((state) => state.lines)
  const totals = useCartStore(useShallow(selectCartTotals))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center justify-between gap-4 text-14">
            <span className="min-w-0 truncate">
              {line.name} <span className="text-muted">× {line.qty}</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums">
              {formatPrice(line.priceAtPurchase * line.qty)}
            </span>
          </div>
        ))}
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4 text-14">
          <div className="flex items-center justify-between">
            <span className="text-muted">Товары</span>
            <span className="font-mono tabular-nums">{totals.count} шт</span>
          </div>
          {totals.savings > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted">Ваша выгода</span>
              <span className="font-mono tabular-nums text-success">
                −{formatPrice(totals.savings)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-16">
            <span className="font-medium">Итого</span>
            <span className="font-mono text-24 font-semibold tabular-nums">
              {formatPrice(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {error !== null && (
        <p
          role="alert"
          className="rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-14 text-danger"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
          <ArrowLeft aria-hidden="true" strokeWidth={1.75} />
          Назад
        </Button>
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Оформляем заказ…' : 'Подтвердить заказ'}
        </Button>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const lines = useCartStore((state) => state.lines)
  const totals = useCartStore(useShallow(selectCartTotals))
  const clearCart = useCartStore((state) => state.clear)
  const profile = useAuthStore((state) => state.profile)
  const createOrder = useCreateOrder()
  const [step, setStep] = useState(1)
  const [contact, setContact] = useState<CheckoutContact>(() => ({
    name: profile === null ? '' : `${profile.firstName} ${profile.lastName}`.trim(),
    phone: '',
    email: profile?.email ?? '',
  }))
  const [delivery, setDelivery] = useState<CheckoutDelivery>({ city: '', address: '', comment: '' })
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitOrder = async () => {
    setSubmitError(null)
    try {
      const payload = {
        customer: contact,
        delivery: {
          city: delivery.city,
          address: delivery.address,
          comment: delivery.comment,
        },
        items: lines.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          priceAtPurchase: line.priceAtPurchase,
        })),
      }
      const result = await createOrder.mutateAsync(payload)
      setOrderId(result.id)
      clearCart()
      toast.success(`Заказ №${result.id} оформлен`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось оформить заказ')
    }
  }

  if (orderId !== null) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <CheckCircle2
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-16 animate-pop-in text-success"
        />
        <h1 className="text-24 font-semibold tracking-tight sm:text-32">
          Заказ №{orderId} оформлен
        </h1>
        <p className="max-w-md text-14 text-muted">
          Мы позвоним для подтверждения. Статус заказа пришлём на указанную почту.
        </p>
        <Button asChild className="mt-2">
          <Link to="/catalog">Продолжить покупки</Link>
        </Button>
      </section>
    )
  }

  if (lines.length === 0) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
        <span
          aria-hidden="true"
          className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface"
        >
          <ShoppingCart strokeWidth={1.5} className="size-7 text-muted" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-24 font-semibold tracking-tight sm:text-32">В корзине пусто</h1>
          <p className="max-w-md text-14 text-muted">Добавьте товары, чтобы оформить заказ.</p>
        </div>
        <Button asChild>
          <Link to="/cart">Вернуться в корзину</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-24 font-semibold tracking-tight sm:text-32">Оформление заказа</h1>
        <p className="mt-1 text-14 text-muted">Итого: {formatPrice(totals.total)}</p>

        <div className="mt-6 rounded-card border border-border bg-surface p-5 sm:p-6">
          <CheckoutSteps current={step} />
          <div className="mt-8">
            {step === 1 && (
              <ContactStep
                defaultValues={contact}
                onSubmit={(data) => {
                  setContact(data)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && (
              <DeliveryStep
                defaultValues={delivery}
                onSubmit={(data) => {
                  setDelivery(data)
                  setStep(3)
                }}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <ConfirmStep
                onSubmit={() => void handleSubmitOrder()}
                onBack={() => setStep(2)}
                submitting={createOrder.isPending}
                error={submitError}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
