import React, { useMemo, useRef, useState } from 'react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RLink } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Heading,
  Input,
  Link,
  Text,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';

import {
  PluginOnMount,
  PluginModule,
  PluginTabProps,
  ApiFetchListSuggestionsResponse,
  PluginActionProps,
  State,
  ListSuggestion,
} from '@app/types';
import {
  approveSuggestion,
  createSuggestion,
  fetchSuggestions,
  rejectSuggestion,
  selectSuggestionsByListId,
} from '@app/plugin-suggestions';
import {
  Loaders,
  selectLoaderById,
  updateSuggestionLoader,
} from '@app/loaders';
import { selectHasTokenExpired, selectUser } from '@app/token';
import { loginUrl, profileUrl, registerUrl } from '@app/routes';
import { formatDate, isoToDate } from '@app/date';
import { selectUserById } from '@app/users';
import { selectListById } from '@app/lists';

import { Typeahead, useTypeahead } from '../typeahead';
import { RainbowRuler } from '../atoms';
import { useLoaderSuccess } from '../hooks';

async function onListMount({ list, dispatch }: PluginOnMount) {
  dispatch(fetchSuggestions({ listId: list.id }));
}

const SuggestionItem = ({
  suggestion,
  canEdit,
}: {
  suggestion: ListSuggestion;
  canEdit: boolean;
}) => {
  const dispatch = useDispatch();
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: updateSuggestionLoader(suggestion.id) }),
  );
  const updatedAt = useMemo(() => formatDate(isoToDate(suggestion.updatedAt)), [
    suggestion.updatedAt,
  ]);
  const user = useSelector((state: State) =>
    selectUserById(state, { id: suggestion.userId }),
  );

  const approve = () => {
    if (!canEdit) {
      return;
    }

    dispatch(
      approveSuggestion({
        suggestionId: suggestion.id,
        listId: suggestion.listId,
      }),
    );
  };

  const reject = () => {
    if (!canEdit) {
      return;
    }

    dispatch(
      rejectSuggestion({
        suggestionId: suggestion.id,
        listId: suggestion.listId,
      }),
    );
  };

  return (
    <Box>
      <Flex key={suggestion.id} align="center" justify="space-between">
        <Box>
          <Box flex={1}>{suggestion.text}</Box>
          <Box>
            by{' '}
            <Link as={RLink} to={profileUrl(user.username)}>
              {user.username}
            </Link>{' '}
            on {updatedAt}
          </Box>
        </Box>
        <Box maxW="200px">
          {canEdit ? (
            <ButtonGroup>
              <Button
                isLoading={loader.isLoading}
                onClick={approve}
                colorScheme="green"
                size="sm"
              >
                Approve
              </Button>
              <Button
                size="sm"
                isLoading={loader.isLoading}
                onClick={reject}
                colorScheme="pink"
              >
                Reject
              </Button>
            </ButtonGroup>
          ) : null}
        </Box>
      </Flex>
      <Divider my={2} />
    </Box>
  );
};

const CompletedSuggestion = ({
  suggestion,
}: {
  suggestion: ListSuggestion;
}) => {
  const updatedAt = useMemo(() => formatDate(isoToDate(suggestion.updatedAt)), [
    suggestion.updatedAt,
  ]);
  const user = useSelector((state: State) =>
    selectUserById(state, { id: suggestion.userId }),
  );
  return (
    <Box>
      <Box>{suggestion.text}</Box>
      <Box>
        by{' '}
        <Link as={RLink} to={profileUrl(user.username)}>
          {user.username}
        </Link>{' '}
        on {updatedAt}
      </Box>
      <Divider my={2} />
    </Box>
  );
};

const SuggestionsMenu = ({ listId }: PluginTabProps) => {
  const suggestions = useSelector((state: State) =>
    selectSuggestionsByListId(state, { listId }),
  );
  const list = useSelector((state: State) =>
    selectListById(state, { id: listId }),
  );
  const user = useSelector(selectUser);
  const canEdit = list.ownerId === user.id;
  const alreadyApproved = useMemo(() => suggestions.filter((s) => !!s.itemId), [
    suggestions,
  ]);
  const alreadyRejected = useMemo(() => suggestions.filter((s) => s.rejected), [
    suggestions,
  ]);
  const requiresApproval = useMemo(
    () => suggestions.filter((s) => s.itemId === '' && !s.rejected),
    [suggestions],
  );

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="sm" color="yellow.500">
            Requires approval
          </Heading>
          <RainbowRuler size="sm" />
          {requiresApproval.map((suggestion) => {
            return (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                canEdit={canEdit}
              />
            );
          })}
          {requiresApproval.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              There are no suggestions that require approval.
            </Alert>
          ) : null}
        </Box>
        <Box>
          <Heading size="sm" color="green.500">
            Approved
          </Heading>
          <RainbowRuler size="sm" />
          {alreadyApproved.map((s) => {
            return <CompletedSuggestion key={s.id} suggestion={s} />;
          })}
          {alreadyApproved.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              There are no approved suggestions.
            </Alert>
          ) : null}
        </Box>
        <Box>
          <Heading size="sm" color="red.500">
            Rejected
          </Heading>
          <RainbowRuler size="sm" />
          {alreadyRejected.map((s) => {
            return <CompletedSuggestion key={s.id} suggestion={s} />;
          })}
          {alreadyRejected.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              There are no rejected suggestions.
            </Alert>
          ) : null}
        </Box>
      </VStack>
    </Box>
  );
};

const MakeSuggestion = ({
  list,
  userId,
}: PluginActionProps<ApiFetchListSuggestionsResponse>) => {
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);
  const [text, setText] = useState('');
  const isOwner = userId === list.ownerId;
  const toast = useToast();
  const hasTokenExpired = useSelector(selectHasTokenExpired);

  const suggestItem = () => {
    dispatch(createSuggestion({ text, listId: list.id, userId }));
  };
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: Loaders.createSuggestion }),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const typeahead = useTypeahead(text);
  const keydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        suggestItem();
        break;
      case 'Esc':
      case 'Escape':
        setOpen(false);
        break;
      default:
        break;
    }
  };
  const refocusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  };

  useLoaderSuccess(loader, () => {
    toast({
      title: 'Your suggestion has been sent to the owner of this list!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setText('');
    setOpen(false);
  });

  if (hasTokenExpired) {
    return (
      <Box>
        <Text fontSize="sm">
          <Link as={RLink} to={loginUrl()}>
            Login
          </Link>{' '}
          or{' '}
          <Link as={RLink} to={registerUrl()}>
            Sign up
          </Link>{' '}
          to make a suggestion
        </Text>
      </Box>
    );
  }

  if (!isOpen) {
    return (
      <Tooltip label="Suggest an item to add to this list and the owner can approve">
        <Button
          variant="rainbow"
          onClick={() => setOpen(true)}
          isDisabled={isOwner}
        >
          Make a suggestion
        </Button>
      </Tooltip>
    );
  }

  return (
    <Box mt={4}>
      <Box>
        <Input
          variant="flushed"
          id="item-text"
          name="text"
          value={text}
          ref={inputRef}
          onKeyDown={keydown}
          placeholder="Type your new list item"
          onChange={(e) => setText(e.currentTarget.value)}
        />
        <Typeahead
          typeahead={typeahead}
          onSelect={setText}
          refocus={refocusInput}
        />
      </Box>

      <ButtonGroup mt={4} spacing={4}>
        <Button
          onClick={suggestItem}
          variant="rainbow"
          disabled={text === ''}
          isLoading={loader.isLoading}
        >
          Suggest item
        </Button>
        <Button
          variant="link"
          onClick={() => setOpen(false)}
          isDisabled={loader.isLoading}
        >
          cancel
        </Button>
      </ButtonGroup>
    </Box>
  );
};

const plugin: PluginModule = {
  name: 'suggestions',
  Icon: () => <CheckCircleIcon />,
  onListMount,
  tabMenuLabel: 'Suggestions',
  TabMenu: SuggestionsMenu,
  ActionItem: MakeSuggestion,
};

export default plugin;
