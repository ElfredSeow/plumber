import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Text,
} from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'
import { useRef } from 'react'

interface RunNowConfirmationDialogProps {
  flowName: string
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export default function RunNowConfirmationDialog(
  props: RunNowConfirmationDialogProps,
) {
  const { flowName, isOpen, isLoading, onClose, onConfirm } = props
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      closeOnOverlayClick={!isLoading}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Run {flowName} now?</AlertDialogHeader>
          <AlertDialogBody>
            <Text textStyle="body-1" color="base.content.medium">
              Every step runs for real. For example, emails are sent and rows
              are created in your tiles.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="clear"
              colorScheme="secondary"
              ref={cancelRef}
              onClick={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={onConfirm} ml={3} isLoading={isLoading}>
              Run now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
