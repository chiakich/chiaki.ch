import { useState, useRef, useCallback } from 'react'

export function useR18Dialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [imageIndex, setImageIndex] = useState<number | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const openDialog = useCallback((index: number) => {
    setImageIndex(index)
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setImageIndex(null)
  }, [])

  const confirmDialog = useCallback(
    (onConfirm: (index: number) => void) => {
      if (imageIndex !== null) {
        onConfirm(imageIndex)
        closeDialog()
      }
    },
    [imageIndex, closeDialog]
  )

  return {
    isOpen,
    imageIndex,
    cancelRef,
    openDialog,
    closeDialog,
    confirmDialog,
  }
}
