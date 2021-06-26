import React from 'react';
import { useSelector } from 'react-redux';
import { selectLoaderById } from 'saga-query';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

import { State } from '@app/types';
import { createList } from '@app/lists';
import { selectHasTokenExpired } from '@app/token';

import { CreateList } from './create-list';
import { useLoaderSuccess } from './hooks';
import { IntroView } from './intro';

export function CreateListModal({ onClose }: { onClose: () => any }) {
  const hasExpired = useSelector(selectHasTokenExpired);
  const loader = useSelector((s: State) =>
    selectLoaderById(s, { id: `${createList}` }),
  );
  useLoaderSuccess(loader, () => {
    onClose();
  });
  return (
    <Modal
      size="2xl"
      isOpen
      onClose={onClose}
      motionPreset="none"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent borderRadius={0}>
        <ModalHeader>Create a new list</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={[1, 6]}>
          {hasExpired ? <IntroView /> : <CreateList />}
        </ModalBody>

        <ModalFooter>
          <Button variant="rainbow" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
