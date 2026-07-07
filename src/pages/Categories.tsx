import { useState } from 'react';
import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { CategoryIcon } from '@/components/atlas/CategoryIcon';
import { ColorPicker } from '@/components/atlas/ColorPicker';
import { useCategories, useAddCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const colorOptions = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#22c55e',
  '#eab308', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6',
  // Expanded
  '#7c3aed', '#4f46e5', '#0ea5e9', '#10b981', '#84cc16',
  '#f59e0b', '#f43f5e', '#fb7185', '#0d9488', '#64748b',
  '#737373',
];

const iconOptions = [
  // Original
  'utensils', 'car', 'home', 'heart', 'gamepad',
  'graduation-cap', 'shopping', 'wifi', 'smartphone', 'plane',
  'gift', 'music', 'coffee', 'briefcase', 'zap',
  // Finance
  'bank', 'credit-card', 'wallet', 'cash', 'savings',
  // Lifestyle
  'gym', 'bike', 'spa', 'camera', 'book',
  // Food
  'burger', 'pizza', 'drink', 'groceries',
  // Home
  'tools', 'sofa', 'lightbulb', 'cleaning',
  // Transport
  'bus', 'train', 'gas-station', 'parking',
  // Digital
  'streaming', 'cloud', 'laptop', 'mobile-app',
];

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);

  const { data: categories = [], isLoading } = useCategories();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }
    try {
      await addCategory.mutateAsync({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
      toast.success('Categoria criada!');
      setOpen(false);
      resetForm();
    } catch {
      toast.error('Erro ao criar categoria');
    }
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error('Categorias padrão não podem ser removidas');
      return;
    }
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Categoria removida');
    } catch {
      toast.error('Erro ao remover categoria');
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedColor(colorOptions[0]);
    setSelectedIcon(iconOptions[0]);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações por categoria
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="atlas-btn-primary">
              <Plus className="w-5 h-5" />
              Nova Categoria
            </button>
          </DialogTrigger>

          <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Nova Categoria
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Investimentos"
                  className="atlas-input"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {colorOptions.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all duration-150 ${
                        selectedColor === color
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <ColorPicker value={selectedColor} onChange={setSelectedColor} />
                </div>
              </div>

              {/* Icons */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Ícone
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {iconOptions.map((icon) => (
                  <motion.button
                    key={icon}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedIcon(icon)}
                    aria-label={`Selecionar ícone ${icon}`}
                    className={`p-2 rounded-lg transition-all duration-150 ${
                      selectedIcon === icon
                        ? 'bg-primary/20 ring-1 ring-primary/40'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                      <CategoryIcon icon={icon} color={selectedColor} size="sm" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-4 pt-2">
                <p className="text-sm text-muted-foreground">Preview:</p>
                <motion.div
                  layout
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                  style={{ transition: 'background-color 150ms ease' }}
                >
                  <CategoryIcon icon={selectedIcon} color={selectedColor} />
                  <span className="font-medium">{name || 'Categoria'}</span>
                </motion.div>
              </div>

              <button
                type="submit"
                disabled={addCategory.isPending}
                className="atlas-btn-primary w-full"
              >
                {addCategory.isPending ? 'Criando...' : 'Criar Categoria'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Carregando...
          </div>
        ) : (
          categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="atlas-card p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <CategoryIcon icon={category.icon} color={category.color} size="md" />
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.is_default && (
                    <p className="text-xs text-muted-foreground">Padrão</p>
                  )}
                </div>
              </div>
              {!category.is_default && (
                <button
                  onClick={() => handleDelete(category.id, category.is_default)}
                  aria-label={`Remover categoria ${category.name}`}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
