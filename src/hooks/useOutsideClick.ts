import { useEffect } from 'react';
import type { RefObject } from 'react';

function useOutsideClick(reference: RefObject<HTMLElement | null>, isActive: boolean, onOutsideClick: () => void) {
  useEffect(() => {
    if (!isActive) return;

    function handlePointerDown(event: PointerEvent) {
      if (reference.current && !reference.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [reference, isActive, onOutsideClick]);
}

export default useOutsideClick;
