# Изображения товаров: источники

Фото подтягиваются **напрямую с Wikimedia Commons** (стабильный CDN
`upload.wikimedia.org`) по схеме «семейство продукта → изображение». Контракт данных не менялся:
мэппинг строится по `slug` товара и работает одинаково в mock- и Supabase-режимах
(идентичные slug из сидера каталога).

- `src/shared/lib/product-images.ts` — категорийные изображения + точечные правила для семейств
  (AMD Radeon, Intel Arc, DDR4, SATA-накопители, мыши, гарнитуры, мониторы).
- Если `slug` не попал под правило — используется изображение категории.
- В UI картинка рисуется поверх фирменного `ProductVisual`: `loading="lazy"`,
  `decoding="async"`, fade-in, фиксированное соотношение сторон (без CLS) и **автоматический
  fallback на графический visual**, если CDN недоступен или файл удалён.

Примечание: фото репрезентативные — соответствуют линейке/семейству, а не конкретному SKU
(например, RTX 4090 для карточек серии RTX). Точные SKU-снимки подставляются правкой мэппинга.

## Файлы Wikimedia Commons (лицензии)

| Роль | Файл | Лицензия |
| --- | --- | --- |
| CPU (категория) | [AMD Ryzen 7 5800X3D.jpg](https://commons.wikimedia.org/wiki/File:AMD_Ryzen_7_5800X3D.jpg) | CC BY-SA 4.0 |
| GPU GeForce (категория) | [Size comparison between RTX 3090 and RTX 4090.jpg](https://commons.wikimedia.org/wiki/File:Size_comparison_between_RTX_3090_and_RTX_4090.jpg) | CC BY-SA 4.0 |
| GPU Radeon | [Sapphire AMD Radeon RX 7900 XTX.jpg](https://commons.wikimedia.org/wiki/File:Sapphire_AMD_Radeon_RX_7900_XTX.jpg) | CC BY-SA 4.0 |
| GPU Intel Arc | [Intel Arc A770 front.jpg](https://commons.wikimedia.org/wiki/File:Intel_Arc_A770_front.jpg) | CC0 |
| RAM RGB (категория) | [2023 Pamięci Corsair Vengeance RGB.jpg](https://commons.wikimedia.org/wiki/File:2023_Pami%C4%99ci_Corsair_Vengeance_RGB.jpg) | CC BY-SA 4.0 |
| RAM DDR4 | [16 GiB-DDR4-RAM-Riegel RAM019FIX Small Crop 90 PCNT.png](https://commons.wikimedia.org/wiki/File:16_GiB-DDR4-RAM-Riegel_RAM019FIX_Small_Crop_90_PCNT.png) | CC BY 4.0 |
| NVMe (категория) | [Western Digital SN850X NVME solid state drive 8TB front side.jpg](https://commons.wikimedia.org/wiki/File:Western_Digital_SN850X_NVME_solid_state_drive_8TB_front_side.jpg) | CC BY 4.0 |
| SATA SSD | [Dual SSD SATA adapter with Samsung 860 EVO SSD and 2.5-inch enclosure.jpg](https://commons.wikimedia.org/wiki/File:Dual_SSD_SATA_adapter_with_Samsung_860_EVO_SSD_and_2.5-inch_enclosure.jpg) | CC BY-SA 4.0 |
| Материнская плата (категория) | [Ryzen 7 7800 X3D, unlocked.jpg](https://commons.wikimedia.org/wiki/File:Ryzen_7_7800_X3D,_unlocked.jpg) | CC BY 2.0 |
| Блок питания (категория) | [Full modular ATX power supply unit.jpg](https://commons.wikimedia.org/wiki/File:Full_modular_ATX_power_supply_unit.jpg) | CC BY-SA 4.0 |
| Охлаждение (категория) | [NH-D15 with classic fans.jpg](https://commons.wikimedia.org/wiki/File:NH-D15_with_classic_fans.jpg) | CC BY 2.0 |
| Корпус (категория) | [2025 Wnętrze komputera PC.jpg](https://commons.wikimedia.org/wiki/File:2025_Wn%C4%99trze_komputera_PC.jpg) | CC BY-SA 4.0 |
| Клавиатура (категория периферии) | [Mechanical Keyboard.jpg](https://commons.wikimedia.org/wiki/File:Mechanical_Keyboard.jpg) | CC BY-SA 4.0 |
| Мышь | [2023 Mysz komputerowa Logitech G903 Lightspeed.jpg](https://commons.wikimedia.org/wiki/File:2023_Mysz_komputerowa_Logitech_G903_Lightspeed.jpg) | CC BY-SA 4.0 |
| Гарнитура | [RGB gaming headset on desk with ambient lighting.jpg](https://commons.wikimedia.org/wiki/File:RGB_gaming_headset_on_desk_with_ambient_lighting.jpg) | CC0 |
| Монитор | [ASUS ROG Strix XG32VQR monitor.jpg](https://commons.wikimedia.org/wiki/File:ASUS_ROG_Strix_XG32VQR_monitor.jpg) | CC BY-SA 4.0 |

Полные данные авторов и условий — на страницах файлов по ссылкам.
