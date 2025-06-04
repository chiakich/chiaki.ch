import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'

interface R18DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cancelRef: React.RefObject<HTMLButtonElement>
}

const R18Dialog: React.FC<R18DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelRef,
}) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
    isCentered
  >
    <AlertDialogOverlay>
      <AlertDialogContent bg="gray.800" color="white">
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          成人內容確認
        </AlertDialogHeader>
        <AlertDialogBody>
          此內容包含成人內容，僅限18歲以上觀看。
          <br />
          您是否已滿18歲？
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            ref={cancelRef}
            onClick={onClose}
            variant="ghost"
            colorScheme="gray"
          >
            取消
          </Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3}>
            確認已滿18歲
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
)

export default R18Dialog
