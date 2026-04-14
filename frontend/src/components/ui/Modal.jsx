import { useEffect, useRef } from "react";

export default function Modal({ aberto, onFechar, titulo, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (aberto) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [aberto]);

  function handleClick(e) {
    if (e.target === dialogRef.current) {
      onFechar();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={onFechar}
      className="backdrop:bg-black/40 backdrop:backdrop-blur-sm bg-bg-elevated text-text-primary rounded-2xl border border-border p-0 shadow-2xl max-w-lg w-full"
    >
      <div className="p-6">
        {titulo && (
          <h2 className="text-lg font-semibold mb-4">{titulo}</h2>
        )}
        {children}
      </div>
    </dialog>
  );
}
