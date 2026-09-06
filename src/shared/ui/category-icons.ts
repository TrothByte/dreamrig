import {
  Box,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Keyboard,
  type LucideIcon,
  MemoryStick,
  Microchip,
  Zap,
} from 'lucide-react'
import type { Category } from '@/shared/model'

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  cpu: Cpu,
  gpu: Microchip,
  ram: MemoryStick,
  storage: HardDrive,
  motherboard: CircuitBoard,
  psu: Zap,
  cooling: Fan,
  case: Box,
  peripherals: Keyboard,
}
