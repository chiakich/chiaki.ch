import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from 'components/ui/controls'
import { useI18n } from 'i18n'

interface R18DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cancelRef: React.RefObject<HTMLButtonElement | null>
}

const R18Dialog: React.FC<R18DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelRef,
}) => {
  const { t } = useI18n()

  return <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
    isCentered
  >
    <AlertDialogOverlay>
      <AlertDialogContent bg="gray.800" color="white">
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          {t('characterPage.r18Title')}
        </AlertDialogHeader>
        <AlertDialogBody>
          {t('characterPage.r18Description')}
          <br />
          {t('characterPage.r18Question')}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            ref={cancelRef}
            onClick={onClose}
            variant="ghost"
            colorScheme="gray"
          >
            {t('characterPage.cancel')}
          </Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3}>
            {t('characterPage.confirmAge')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
}

export default R18Dialog
