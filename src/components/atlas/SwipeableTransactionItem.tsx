import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';
import { TransactionItem } from './TransactionItem';

interface SwipeableTransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableTransactionItem({ transaction, onEdit, onDelete }: SwipeableTransactionItemProps) {
  const [swiping, setSwiping] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);

  const editBg = useTransform(x, [0, SWIPE_THRESHOLD], ['rgba(34,197,94,0)', 'rgba(34,197,94,0.2)']);
  const editIconOpacity = useTransform(x, [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const deleteBg = useTransform(x, [-SWIPE_THRESHOLD, 0], ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0)']);
  const deleteIconOpacity = useTransform(x, [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0], [1, 0.5, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setSwiping(false);
    if (info.offset.x > SWIPE_THRESHOLD) {
      onEdit(transaction);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onDelete(transaction.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl" ref={constraintsRef}>
      {/* Edit background (swipe right) */}
      <motion.div
        className="absolute inset-0 flex items-center pl-5 rounded-xl"
        style={{ backgroundColor: editBg as any }}
      >
        <motion.div style={{ opacity: editIconOpacity }}>
          <Pencil className="w-5 h-5 text-green-400" />
        </motion.div>
      </motion.div>

      {/* Delete background (swipe left) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-5 rounded-xl"
        style={{ backgroundColor: deleteBg as any }}
      >
        <motion.div style={{ opacity: deleteIconOpacity }}>
          <Trash2 className="w-5 h-5 text-red-400" />
        </motion.div>
      </motion.div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.3}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10 cursor-grab active:cursor-grabbing"
      >
        <div
          onClick={() => { if (!swiping) onEdit(transaction); }}
          className="cursor-pointer"
        >
          <TransactionItem transaction={transaction} />
        </div>
      </motion.div>
    </div>
  );
}
