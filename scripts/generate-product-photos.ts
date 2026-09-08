import { writeFileSync } from 'node:fs'
import { products } from '../src/shared/api/mock/generate-catalog'
import type { Category } from '../src/shared/model'

const CATEGORY_ORDER: Category[] = [
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

function suggestPhotoCount(slug: string, category: Category): number {
  switch (category) {
    case 'gpu':
      return /rtx-5090|rtx-5080|rtx-5070-ti|rx-7900-xtx|rx-9070-xt|rog-strix-geforce-rtx-5080/.test(
        slug,
      )
        ? 3
        : 2
    case 'cpu':
      return /9800x3d|9950x|core-ultra-9-285k/.test(slug) ? 2 : 1
    case 'cooling':
      return /galahad|kraken|coreliquid|ls720/.test(slug) ? 2 : 1
    case 'ram':
      return /rgb/.test(slug) ? 2 : 1
    case 'case':
      return /o11|h6-flow|5000d|north|air-903/.test(slug) ? 2 : 1
    case 'peripherals':
      return /superlight|viper-v3|27gs95qe|pg27aqn|arctis-nova/.test(slug) ? 2 : 1
    default:
      return 1
  }
}

interface PhotoRow {
  n: number
  slug: string
  name: string
  category: Category
  suggestedCount: number
}

const sorted = [...products].sort((a, b) => {
  const categoryDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  if (categoryDiff !== 0) {
    return categoryDiff
  }
  return a.name.localeCompare(b.name, 'ru')
})

const rows: PhotoRow[] = sorted.map((product, index) => ({
  n: index + 1,
  slug: product.slug,
  name: product.name,
  category: product.category,
  suggestedCount: suggestPhotoCount(product.slug, product.category),
}))

function buildMarkdown(): string {
  const lines: string[] = [
    '# Фотографии товаров — список для заполнения',
    '',
    'Файлы кладутся в `public/products/` и называются по номеру `№` из таблицы:',
    '',
    '- первый кадр товара: `public/products/<N>.jpg`;',
    '- дополнительные кадры: `public/products/<N>-2.jpg`, `<N>-3.jpg` и так далее (максимум 4 кадра);',
    '- колонка **Фото** — рекомендуемое количество кадров. Если добавите больше или меньше —',
    '  загрузчик покажет все реально добавленные файлы;',
    '- формат: `.jpg` (можно `.webp`); рекомендуемый размер ~1000 px по ширине, качество 70–80,',
    '  ориентир 80–200 КБ на файл.',
    '',
    '| № | Категория | Товар | Фото |',
    '|---|---|---|---|',
  ]
  for (const row of rows) {
    lines.push(
      `| ${row.n} | ${row.category} | ${row.name.replaceAll('|', '/')} | ${row.suggestedCount} |`,
    )
  }
  return `${lines.join('\n')}\n`
}

function buildIndex(): string {
  const lines: string[] = [
    "import type { Category } from '../model/product'",
    '',
    'export interface ProductPhoto {',
    '  n: number',
    '  slug: string',
    '  category: Category',
    '  suggestedCount: number',
    '}',
    '',
    '// Порядок совпадает с docs/product-photos.md (категория → имя).',
    '// Файл генерируется скриптом scripts/generate-product-photos.ts.',
    'export const PRODUCT_PHOTOS: ProductPhoto[] = [',
  ]
  for (const row of rows) {
    lines.push(
      `  { n: ${row.n}, slug: '${row.slug}', category: '${row.category}', suggestedCount: ${row.suggestedCount} },`,
    )
  }
  lines.push(']')
  lines.push('')
  lines.push('const photoBySlug = new Map<string, ProductPhoto>()')
  lines.push('const photoByNumber = new Map<number, ProductPhoto>()')
  lines.push('for (const photo of PRODUCT_PHOTOS) {')
  lines.push('  photoBySlug.set(photo.slug, photo)')
  lines.push('  photoByNumber.set(photo.n, photo)')
  lines.push('}')
  lines.push('')
  lines.push('export function getProductPhoto(slug: string): ProductPhoto | null {')
  lines.push('  return photoBySlug.get(slug) ?? null')
  lines.push('}')
  lines.push('')
  lines.push('export function getProductPhotoByNumber(n: number): ProductPhoto | null {')
  lines.push('  return photoByNumber.get(n) ?? null')
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

const markdown = buildMarkdown()
writeFileSync('docs/product-photos.md', markdown)
writeFileSync('src/shared/lib/product-photo-index.ts', buildIndex())
console.log(
  `Сгенерировано: ${rows.length} товаров → docs/product-photos.md, src/shared/lib/product-photo-index.ts`,
)
