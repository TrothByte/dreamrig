import type { Category } from '../model/product'

export const CATEGORY_LABELS: Record<Category, string> = {
  cpu: 'Процессоры',
  gpu: 'Видеокарты',
  ram: 'Оперативная память',
  storage: 'Накопители',
  motherboard: 'Материнские платы',
  psu: 'Блоки питания',
  cooling: 'Охлаждение',
  case: 'Корпуса',
  peripherals: 'Периферия',
}

export const CATEGORY_ORDER: Category[] = [
  'cpu',
  'gpu',
  'ram',
  'storage',
  'motherboard',
  'psu',
  'cooling',
  'case',
  'peripherals',
]
