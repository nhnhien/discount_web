import { Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const SaveBar = ({
  onSave,
  onDiscard,
  saveText = 'Lưu',
  discardText = 'Hủy',
  title = 'Chỉnh sửa sản phẩm',
  visible,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className='fixed top-0 left-[40%] max-w-[90%] w-[500px] bg-white p-4 h-auto min-h-[90px] shadow-lg flex flex-col md:flex-row justify-between items-center rounded-xl z-50 border border-gray-200'
        >
          <span className='text-gray-800 font-semibold text-center md:text-left text-lg break-words'>{title}</span>
          <div className='space-x-3 mt-2 md:mt-0'>
            <Button onClick={onDiscard} className='bg-gray-400 text-white hover:bg-gray-500 shadow-md' shape='round'>
              {discardText}
            </Button>
            <Button onClick={onSave} className='bg-blue-600 text-white hover:bg-blue-700 shadow-md' shape='round'>
              {saveText}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveBar;
