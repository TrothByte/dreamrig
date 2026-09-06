import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useProducts } from '@/entities/product'
import { AdminGate } from '@/features/admin-auth'
import { getAdminRepository } from '@/shared/api'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  cn,
  discountPercent,
  formatPrice,
  slugify,
} from '@/shared/lib'
import { type Category, type Product, type ProductInput, productInputSchema } from '@/shared/model'
import { Button, CATEGORY_ICONS, ProductVisual } from '@/shared/ui'

const inputClass =
  'w-full rounded-btn border border-border bg-background px-3 py-2.5 text-16 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-14 font-medium">{label}</span>
      {children}
      {error !== undefined && (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

interface SpecRow {
  id: number
  key: string
  value: string
}

function specRows(entries: Array<[string, string]>, nextId: { current: number }): SpecRow[] {
  return entries.map(([key, value]) => ({ id: nextId.current++, key, value }))
}

interface ProductFormModalProps {
  open: boolean
  product: Product | null
  isEdit: boolean
  onClose: () => void
}

function ProductFormModal({ open, product, isEdit, onClose }: ProductFormModalProps) {
  const queryClient = useQueryClient()
  const nextSpecId = useRef(1)
  const [category, setCategory] = useState<Category>('gpu')
  const [specs, setSpecs] = useState<SpecRow[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productInputSchema),
  })

  useEffect(() => {
    if (!open) {
      return
    }
    if (product !== null) {
      setCategory(product.category)
      setSpecs(specRows(Object.entries(product.specs), nextSpecId))
      reset({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        marketPrice: product.marketPrice,
        inStock: product.inStock,
        description: product.description,
        specs: product.specs,
      })
    } else {
      setCategory('gpu')
      setSpecs(specRows([['', '']], nextSpecId))
      reset({
        name: '',
        brand: '',
        category: 'gpu',
        price: 0,
        marketPrice: 0,
        inStock: 0,
        description: '',
        specs: {},
      })
    }
  }, [open, product, reset])

  if (!open) {
    return null
  }

  const updateSpec = (id: number, field: 'key' | 'value', value: string) => {
    setSpecs((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const onSubmit = handleSubmit(async (values) => {
    const cleanSpecs: Record<string, string> = {}
    for (const row of specs) {
      const trimmedKey = row.key.trim()
      if (trimmedKey !== '' && row.value.trim() !== '') {
        cleanSpecs[trimmedKey] = row.value.trim()
      }
    }
    const input: ProductInput = { ...values, category, specs: cleanSpecs }
    try {
      const repository = getAdminRepository()
      const slug = slugify(input.name) || 'product'
      if (isEdit && product !== null) {
        await repository.updateProduct(product.id, input, slug)
        toast.success('Товар обновлён')
      } else {
        await repository.createProduct(input, slug)
        toast.success('Товар добавлен')
      }
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      await queryClient.invalidateQueries({ queryKey: ['product'] })
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось сохранить товар')
    }
  })

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Товар">
      <button
        type="button"
        aria-label="Закрыть форму"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-5 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[85vh] sm:w-[560px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-20 font-semibold tracking-tight">
            {isEdit ? 'Редактировать товар' : 'Добавить товар'}
          </h2>
          <Button type="button" variant="ghost" size="icon" aria-label="Закрыть" onClick={onClose}>
            <X aria-hidden="true" strokeWidth={1.75} />
          </Button>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Название" error={errors.name?.message}>
              <input className={inputClass} {...register('name')} />
            </Field>
            <Field label="Бренд" error={errors.brand?.message}>
              <input className={inputClass} {...register('brand')} />
            </Field>
          </div>

          <Field label="Категория">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ORDER.map((item) => {
                const Icon = CATEGORY_ICONS[item]
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-14',
                      category === item
                        ? 'bg-accent-soft font-medium text-foreground'
                        : 'bg-surface-2 text-muted hover:text-foreground',
                    )}
                  >
                    <Icon aria-hidden="true" strokeWidth={1.75} className="size-4" />
                    {CATEGORY_LABELS[item]}
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Цена, ₽" error={errors.price?.message}>
              <input
                type="number"
                className={inputClass}
                {...register('price', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Рыночная цена, ₽" error={errors.marketPrice?.message}>
              <input
                type="number"
                className={inputClass}
                {...register('marketPrice', { valueAsNumber: true })}
              />
            </Field>
            <Field label="В наличии, шт" error={errors.inStock?.message}>
              <input
                type="number"
                className={inputClass}
                {...register('inStock', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field label="Описание" error={errors.description?.message}>
            <textarea rows={3} className={inputClass} {...register('description')} />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-14 font-medium">Характеристики</legend>
            {specs.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  aria-label="Название характеристики"
                  placeholder="Например, Видеопамять"
                  value={row.key}
                  onChange={(event) => updateSpec(row.id, 'key', event.target.value)}
                  className={inputClass}
                />
                <input
                  aria-label="Значение характеристики"
                  placeholder="Например, 12 ГБ GDDR6X"
                  value={row.value}
                  onChange={(event) => updateSpec(row.id, 'value', event.target.value)}
                  className={inputClass}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить характеристику"
                  disabled={specs.length === 1}
                  onClick={() =>
                    setSpecs((current) => current.filter((item) => item.id !== row.id))
                  }
                >
                  <X aria-hidden="true" strokeWidth={1.75} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setSpecs((current) => [
                  ...current,
                  { id: nextSpecId.current++, key: '', value: '' },
                ])
              }
            >
              <Plus aria-hidden="true" strokeWidth={1.75} />
              Добавить характеристику
            </Button>
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<{ product: Product | null; isEdit: boolean } | null>(null)

  const { data, isPending } = useProducts({
    page,
    pageSize: 50,
    search: search.trim() || undefined,
    category,
    sort: 'popular',
  })
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / 50))

  const openDuplicate = (product: Product) => {
    setDraft({
      product: { ...product, name: `${product.name} (копия)` },
      isEdit: false,
    })
  }

  const handleDelete = (product: Product) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) {
      return
    }
    void getAdminRepository()
      .deleteProduct(product.id)
      .then(async () => {
        toast.success('Товар удалён')
        await queryClient.invalidateQueries({ queryKey: ['products'] })
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Не удалось удалить товар')
      })
  }

  return (
    <AdminGate>
      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-24 font-semibold tracking-tight sm:text-32">Товары</h1>
              <p className="mt-1 text-14 text-muted">Найдено {data?.total ?? '…'} позиций</p>
            </div>
            <Button onClick={() => setDraft({ product: null, isEdit: false })}>
              <Plus aria-hidden="true" strokeWidth={1.75} />
              Добавить товар
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative max-w-md flex-1">
              <Search
                aria-hidden="true"
                strokeWidth={1.75}
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <label htmlFor="admin-search" className="sr-only">
                Поиск по названию
              </label>
              <input
                id="admin-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Поиск по названию…"
                className="w-full rounded-btn border border-border bg-surface py-2 pl-9 pr-3 text-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <select
              aria-label="Фильтр по категории"
              value={category ?? ''}
              onChange={(event) => {
                setCategory((event.target.value as Category | '') || undefined)
                setPage(1)
              }}
              className="cursor-pointer rounded-btn border border-border bg-surface px-3 py-2 text-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="">Все категории</option>
              {CATEGORY_ORDER.map((item) => (
                <option key={item} value={item}>
                  {CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
            <table className="w-full min-w-[760px] text-14">
              <thead>
                <tr className="border-b border-border text-left text-12 uppercase tracking-widest text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Товар
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Категория
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Цена
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Скидка
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Остаток
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {isPending
                  ? [0, 1, 2, 3, 4].map((row) => (
                      <tr key={row}>
                        <td colSpan={6}>
                          <div className="skeleton mx-4 my-3 h-8 rounded-md" />
                        </td>
                      </tr>
                    ))
                  : items.map((product) => {
                      const discount = discountPercent(product.price, product.marketPrice)
                      return (
                        <tr key={product.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <ProductVisual
                                category={product.category}
                                className="w-12 shrink-0 rounded-lg border border-border"
                              />
                              <div className="min-w-0">
                                <p className="line-clamp-1 font-medium">{product.name}</p>
                                <p className="text-12 text-muted">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {CATEGORY_LABELS[product.category]}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-mono tabular-nums">{formatPrice(product.price)}</p>
                            <p className="font-mono text-12 tabular-nums text-muted line-through">
                              {formatPrice(product.marketPrice)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-accent">
                            {discount > 0 ? `−${discount}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-12',
                                product.inStock > 0
                                  ? 'bg-success/15 text-success'
                                  : 'bg-surface-2 text-muted',
                              )}
                            >
                              {product.inStock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Редактировать ${product.name}`}
                                onClick={() => setDraft({ product, isEdit: true })}
                              >
                                <Pencil aria-hidden="true" strokeWidth={1.75} className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Дублировать ${product.name}`}
                                onClick={() => openDuplicate(product)}
                              >
                                <Copy aria-hidden="true" strokeWidth={1.75} className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Удалить ${product.name}`}
                                onClick={() => handleDelete(product)}
                                className="text-muted hover:text-danger"
                              >
                                <Trash2 aria-hidden="true" strokeWidth={1.75} className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Назад
              </Button>
              <span className="font-mono text-14 tabular-nums text-muted">
                {page} / {pageCount}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => value + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </div>
      </section>

      <ProductFormModal
        open={draft !== null}
        product={draft?.product ?? null}
        isEdit={draft?.isEdit ?? false}
        onClose={() => setDraft(null)}
      />
    </AdminGate>
  )
}
