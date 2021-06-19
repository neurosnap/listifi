import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  useToast,
  FormLabel,
  VStack,
  Box,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';

import { updateList, deleteList } from '@app/lists';
import { ListClient, State } from '@app/types';
import { Loaders, selectLoaderById, resetLoaderById } from '@app/loaders';
import { selectUser } from '@app/token';
import { profileUrl } from '@app/routes';
import { validListName } from '@app/validate';
import { selectPluginsAsList } from '@app/plugins';

import { useValidator } from '../hooks';

const DestroyButton = ({
  confirm,
  children,
  isLoading,
}: {
  confirm: () => any;
  children: React.ReactNode;
  isLoading: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        variant="outline"
        colorScheme="pink"
        isLoading={isLoading}
        onClick={onOpen}
      >
        Delete list
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Discard Changes?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{children}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button colorScheme="red" ml={3} onClick={confirm}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const ListSettings = ({ list }: { list: ListClient }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const [nextList, setNextList] = useState(list);
  const nextPlugins = useMemo(() => new Set([...nextList.plugins]), [nextList]);
  const update = (li: Partial<ListClient> = {}) => {
    setNextList({ ...nextList, ...li });
  };
  const user = useSelector(selectUser);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.updateList }),
  );
  const plugins = useSelector(selectPluginsAsList);

  const nameValidator = useValidator(validListName);
  const save = (e: any) => {
    e.preventDefault();
    const result = nameValidator.validate(nextList.name);
    if (!result.isValid) {
      return;
    }
    dispatch(updateList(nextList));
  };
  const cancel = () => {
    dispatch(resetLoaderById(Loaders.updateList));
    setNextList(list);
  };

  const remove = () => {
    dispatch(deleteList({ listId: list.id }));
    navigate(profileUrl(user.username));
    toast({
      title: 'List has been deleted!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  const deleteLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.deleteList }),
  );

  useEffect(() => {
    setNextList(list);
  }, [list]);

  return (
    <form onSubmit={save}>
      <VStack spacing={8} align="stretch" py={4}>
        <FormControl id="list-public">
          <Checkbox
            name="list-public"
            variant="flushed"
            isChecked={nextList.public}
            onChange={(e) => update({ public: e.target.checked })}
          >
            Explorable
          </Checkbox>
          <FormHelperText>
            This setting determines if a list is discoverable through our
            explore section. Regardless if a list is set to explorable or not,
            the list will be accessible via URL.
          </FormHelperText>
        </FormControl>
        <FormControl id="list-plugins">
          <FormLabel>Plugins</FormLabel>
          {plugins.map((plugin) => (
            <Checkbox
              key={plugin.id}
              name={`plugin-${plugin.id}`}
              variant="flushed"
              isChecked={nextList.plugins.includes(plugin.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  nextPlugins.add(plugin.id);
                } else {
                  nextPlugins.delete(plugin.id);
                }
                update({ plugins: [...nextPlugins] });
              }}
            >
              {plugin.name} - {plugin.description}
            </Checkbox>
          ))}
          <FormHelperText>
            Enable plugins to supercharge your list
          </FormHelperText>
        </FormControl>
        <Flex align="center" w="100%">
          <ButtonGroup flex={1} spacing="6">
            <Button
              type="submit"
              isLoading={loader.isLoading}
              variant="rainbow"
            >
              Save
            </Button>
            <Button variant="link" onClick={cancel}>
              cancel
            </Button>
          </ButtonGroup>
        </Flex>
        <Box rounded={2} bg="red.50" p={4}>
          <DestroyButton confirm={remove} isLoading={deleteLoader.isLoading}>
            Are you sure you want to permenantly delete this list?
          </DestroyButton>
        </Box>
      </VStack>
    </form>
  );
};
