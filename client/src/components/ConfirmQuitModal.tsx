interface ConfirmQuitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmQuitModal = ({ onConfirm, onCancel }: ConfirmQuitModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#192233] text-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Leave the game?</h2>
        <p className="text-sm text-[#92A4C9] mb-6">
          If you leave now, you'll forfeit the match and your opponent will win.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmQuitModal;