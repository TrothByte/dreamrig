import type { Category } from '../model/product'

interface ProductImageEntry {
  src: string
}

export const CATEGORY_PRODUCT_IMAGES: Record<Category, string> = {
  cpu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/AMD_Ryzen_7_5800X3D.jpg/1280px-AMD_Ryzen_7_5800X3D.jpg',
  gpu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Size_comparison_between_RTX_3090_and_RTX_4090.jpg/1280px-Size_comparison_between_RTX_3090_and_RTX_4090.jpg',
  ram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/2023_Pami%C4%99ci_Corsair_Vengeance_RGB.jpg/960px-2023_Pami%C4%99ci_Corsair_Vengeance_RGB.jpg',
  storage:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Western_Digital_SN850X_NVME_solid_state_drive_8TB_front_side.jpg/1280px-Western_Digital_SN850X_NVME_solid_state_drive_8TB_front_side.jpg',
  motherboard:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ryzen_7_7800_X3D%2C_unlocked.jpg/1280px-Ryzen_7_7800_X3D%2C_unlocked.jpg',
  psu: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Full_modular_ATX_power_supply_unit.jpg/1280px-Full_modular_ATX_power_supply_unit.jpg',
  cooling:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/NH-D15_with_classic_fans.jpg/960px-NH-D15_with_classic_fans.jpg',
  case: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/2025_Wn%C4%99trze_komputera_PC.jpg/1280px-2025_Wn%C4%99trze_komputera_PC.jpg',
  peripherals:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mechanical_Keyboard.jpg/960px-Mechanical_Keyboard.jpg',
}

const AMD_GPU_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sapphire_AMD_Radeon_RX_7900_XTX.jpg/960px-Sapphire_AMD_Radeon_RX_7900_XTX.jpg',
}

const INTEL_ARC_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Intel_Arc_A770_front.jpg/960px-Intel_Arc_A770_front.jpg',
}

const DDR4_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/16_GiB-DDR4-RAM-Riegel_RAM019FIX_Small_Crop_90_PCNT.png/960px-16_GiB-DDR4-RAM-Riegel_RAM019FIX_Small_Crop_90_PCNT.png',
}

const SATA_SSD_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Dual_SSD_SATA_adapter_with_Samsung_860_EVO_SSD_and_2.5-inch_enclosure.jpg/960px-Dual_SSD_SATA_adapter_with_Samsung_860_EVO_SSD_and_2.5-inch_enclosure.jpg',
}

const MOUSE_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg/960px-2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg',
}

const HEADSET_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/RGB_gaming_headset_on_desk_with_ambient_lighting.jpg/960px-RGB_gaming_headset_on_desk_with_ambient_lighting.jpg',
}

const MONITOR_IMAGE: ProductImageEntry = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/ASUS_ROG_Strix_XG32VQR_monitor.jpg/960px-ASUS_ROG_Strix_XG32VQR_monitor.jpg',
}

const FAMILY_OVERRIDES: Array<{ match: RegExp; image: ProductImageEntry }> = [
  { match: /(^|-)rx-|radeon/, image: AMD_GPU_IMAGE },
  { match: /arc-(b|a)[0-9]/, image: INTEL_ARC_IMAGE },
  { match: /ddr4/, image: DDR4_IMAGE },
  { match: /bx500|870-evo|sa510|ultra-3d/, image: SATA_SSD_IMAGE },
  { match: /g305|g502|g-pro-x-superlight|viper-v3|keris-ii|deathadder/, image: MOUSE_IMAGE },
  { match: /cloud-ii|cloud-iii|arctis|g435/, image: HEADSET_IMAGE },
  {
    match: /g274qpf|vg27aq3a|odyssey-g5|m27q|pg27aqn|27gs95qe/,
    image: MONITOR_IMAGE,
  },
]

export function resolveProductImage(slug: string, category: Category): string | null {
  for (const override of FAMILY_OVERRIDES) {
    if (override.match.test(slug)) {
      return override.image.src
    }
  }
  return CATEGORY_PRODUCT_IMAGES[category]
}
