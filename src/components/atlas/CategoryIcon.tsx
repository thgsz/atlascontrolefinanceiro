import {
  Circle,
  Utensils,
  Car,
  Home,
  Heart,
  Gamepad2,
  GraduationCap,
  ShoppingBag,
  Wifi,
  Smartphone,
  Plane,
  Gift,
  Music,
  Coffee,
  Briefcase,
  DollarSign,
  CreditCard,
  Zap,
  Landmark,
  Wallet,
  Banknote,
  PiggyBank,
  Dumbbell,
  Bike,
  Sparkles,
  Camera,
  BookOpen,
  Sandwich,
  Pizza,
  Wine,
  ShoppingCart,
  Wrench,
  Sofa,
  Lightbulb,
  SprayCan,
  Bus,
  Train,
  Fuel,
  ParkingCircle,
  Tv,
  Cloud,
  Laptop,
  TabletSmartphone,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  circle: Circle,
  utensils: Utensils,
  car: Car,
  home: Home,
  heart: Heart,
  gamepad: Gamepad2,
  'graduation-cap': GraduationCap,
  shopping: ShoppingBag,
  wifi: Wifi,
  smartphone: Smartphone,
  plane: Plane,
  gift: Gift,
  music: Music,
  coffee: Coffee,
  briefcase: Briefcase,
  dollar: DollarSign,
  'credit-card': CreditCard,
  zap: Zap,
  // Finance
  bank: Landmark,
  wallet: Wallet,
  cash: Banknote,
  savings: PiggyBank,
  // Lifestyle
  gym: Dumbbell,
  bike: Bike,
  spa: Sparkles,
  camera: Camera,
  book: BookOpen,
  // Food
  burger: Sandwich,
  pizza: Pizza,
  drink: Wine,
  groceries: ShoppingCart,
  // Home
  tools: Wrench,
  sofa: Sofa,
  lightbulb: Lightbulb,
  cleaning: SprayCan,
  // Transport
  bus: Bus,
  train: Train,
  'gas-station': Fuel,
  parking: ParkingCircle,
  // Digital
  streaming: Tv,
  cloud: Cloud,
  laptop: Laptop,
  'mobile-app': TabletSmartphone,
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryIcon({ icon, color, size = 'md' }: CategoryIconProps) {
  const IconComponent = iconMap[icon] || Circle;

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center`}
      style={{
        backgroundColor: `${color}20`,
      }}
    >
      <IconComponent
        className={iconSizes[size]}
        style={{ color }}
      />
    </div>
  );
}
