import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Input,
  Button,
  Spinner,
  Tab,
  TabList,
  Tabs,
  TabPanel,
  TabPanels,
  List,
  ListItem,
  ListIcon,
  VStack,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';
import { AddIcon, LinkIcon } from '@chakra-ui/icons';
import { selectDataById, selectLoaderById } from 'saga-query';
import { listDetailUrl } from '@app/routes';
import { State } from '@app/types';
import { scrape } from '@app/scrape';
import { NAME_CHAR_LIMIT, validListName } from '@app/validate';
import { createList } from '@app/lists';
import { loginGuest } from '@app/auth';
import { selectHasTokenExpired } from '@app/token';

import { useValidator, useCreateListToast, useLoaderSuccess } from '../hooks';

type SetListFn = (l: string[]) => string[];

interface Props {
  list: string[];
  setList: (fn: SetListFn | string[]) => any;
  html: string;
  isLoading: boolean;
  lists: string[][];
}

const Visual = ({ setList, html }: Props) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [findPattern, setFindPattern] = useState(false);
  const [findIndi, setIndi] = useState(false);
  const loader = useSelector((state) =>
    selectLoaderById(state, { id: `${scrape}` }),
  );

  useEffect(() => {
    const onclick = (e: any) => {
      e.preventDefault();
      const text: string[] = [];
      if (ref.current) {
        const body = (ref.current.contentDocument as any).body as HTMLElement;
        if (e.target.className) {
          const res = body.getElementsByClassName(e.target.className);
          for (const el of res as any) {
            text.push(el.textContent);
          }
        }
      }

      setList((li) => [...li, ...text]);
    };

    const mouseover = (e: any) => {
      if (ref.current) {
        const body = (ref.current.contentDocument as any).body as HTMLElement;
        if (e.target.className) {
          const res = body.getElementsByClassName(e.target.className);
          for (const el of res as any) {
            el.style.border = '1px solid red';
          }
        }
      }
    };

    const mouseout = (e: any) => {
      if (ref.current) {
        const body = (ref.current.contentDocument as any).body as HTMLElement;
        if (e.target.className) {
          const res = body.getElementsByClassName(e.target.className);
          for (const el of res as any) {
            el.style.border = 'none';
          }
        }
      }
    };
    if (ref.current && findPattern) {
      const body = (ref.current.contentDocument as any).body as HTMLElement;
      body.addEventListener('mouseover', mouseover);
      body.addEventListener('mouseout', mouseout);
      body.addEventListener('click', onclick);
    }

    return () => {
      if (ref.current) {
        const body = (ref.current.contentDocument as any).body as HTMLElement;
        body.removeEventListener('mouseover', mouseover);
        body.removeEventListener('mouseout', mouseout);
        body.removeEventListener('click', onclick);
      }
    };
  }, [findPattern]);

  useEffect(() => {
    const mouseover = (e: any) => {
      const el = e.target;
      el.style.border = '1px solid red';
    };

    const mouseout = (e: any) => {
      const el = e.target;
      el.style.border = 'none';
    };

    const onclick = (e: any) => {
      e.preventDefault();
      setList((li) => [...li, e.target.textContent]);
    };

    if (ref.current && findIndi) {
      const body = (ref.current.contentDocument as any).body as HTMLElement;
      body.addEventListener('mouseover', mouseover);
      body.addEventListener('mouseout', mouseout);
      body.addEventListener('click', onclick);
    }

    return () => {
      if (ref.current) {
        const body = (ref.current.contentDocument as any).body as HTMLElement;
        body.removeEventListener('mouseover', mouseover);
        body.removeEventListener('mouseout', mouseout);
        body.removeEventListener('click', onclick);
      }
    };
  }, [findIndi]);

  return (
    <Box>
      <Box>
        <Button
          onClick={() => setFindPattern(!findPattern)}
          disabled={findIndi || !loader.isSuccess || loader.isLoading}
        >
          {findPattern ? 'Finish' : 'Find pattern'}
        </Button>
        <Button
          onClick={() => setIndi(!findIndi)}
          disabled={findPattern || !loader.isSuccess || loader.isLoading}
        >
          {findIndi ? 'Finish' : 'Individual'}
        </Button>
      </Box>
      {loader.isSuccess ? (
        <iframe
          srcDoc={html}
          width="100%"
          height="800px"
          ref={ref}
          style={{ flex: 1 }}
        ></iframe>
      ) : null}
    </Box>
  );
};

const Automatic = (props: Props) => {
  return (
    <Box>
      {props.lists.map((list, index) => {
        return (
          <Box key={index} flex={1}>
            <Flex>
              <AddIcon
                cursor="pointer"
                onClick={() => props.setList((li) => [...li, ...list])}
              />
              <Box>List {index}</Box>
            </Flex>
            <List>
              {list.map((item, i) => {
                return (
                  <ListItem item={i} pl={4}>
                    <ListIcon
                      cursor="pointer"
                      as={AddIcon}
                      onClick={() => props.setList((li) => [...li, item])}
                    />
                    {item}
                  </ListItem>
                );
              })}
            </List>
            <hr />
          </Box>
        );
      })}
    </Box>
  );
};

const View = (props: Props) => {
  if (props.isLoading) {
    return <Spinner />;
  }

  return (
    <Tabs h="100%">
      <TabList>
        <Tab>Visual</Tab>
        <Tab>Automatic</Tab>
      </TabList>

      <TabPanels h="100%">
        <TabPanel>
          <Visual {...props} />
        </TabPanel>
        <TabPanel overflowY="scroll" h="100%">
          <Automatic {...props} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const ListCreator = ({ list, setList }: Props) => {
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nameValidator = useValidator(validListName);
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${createList}` }),
  );
  const guestLoader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${loginGuest}` }),
  );
  const onReset = () => {
    setList(() => []);
  };
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e: any) => {
    e.preventDefault();
    if (!name) return;
    setSubmitted(true);
  };
  const loginAsGuest = () => {
    dispatch(loginGuest());
  };
  const onShare = () => {
    const result = nameValidator.validate(name);
    if (!result.isValid) {
      return;
    }

    if (hasTokenExpired) {
      loginAsGuest();
      return;
    }

    dispatch(
      createList({
        name,
        public: true,
        items: list.join('\n'),
        plugins: [],
      }),
    );
  };

  useLoaderSuccess(guestLoader, () => {
    dispatch(
      createList({
        name,
        public: true,
        items: list.join('\n'),
        plugins: [],
      }),
    );
  });

  useCreateListToast((newList) =>
    navigate(listDetailUrl(newList.username, newList.urlName)),
  );

  return (
    <Box w="500px" bgColor="gray.100" borderRadius="5px" p={4} mr={4} mb={4}>
      {submitted ? (
        <VStack spacing={4} align="stretch">
          <Flex align="center" justify="space-between">
            <Button
              leftIcon={<LinkIcon />}
              onClick={onShare}
              disabled={list.length === 0}
              colorScheme="green"
              isLoading={loader.isLoading}
            >
              Share
            </Button>
            <Button
              variant="link"
              onClick={onReset}
              disabled={list.length === 0}
            >
              Reset list
            </Button>
          </Flex>
          <Text fontSize="lg">{name}</Text>
          <textarea
            style={{ width: 480, height: 500 }}
            value={list.join('\n')}
            onChange={(e) => setList(e.currentTarget.value.split('\n'))}
          ></textarea>
        </VStack>
      ) : (
        <Flex justify="center" align="center" h="100%" w="100%">
          <form onSubmit={onSubmit}>
            <VStack spacing={4} align="stretch">
              <p>You must enter a name before creating your list.</p>
              <FormControl
                id="name"
                isRequired
                isInvalid={!nameValidator.isValid}
              >
                <Input
                  variant="flushed"
                  size="xl"
                  bgColor="white"
                  placeholder="List name"
                  value={name}
                  px={2}
                  onChange={(e) => setName(e.currentTarget.value)}
                />
                <FormHelperText>
                  This is the name of the list. It must be unique to your other
                  lists. List name cannot exceed {NAME_CHAR_LIMIT} characters.
                </FormHelperText>
                <FormErrorMessage>{nameValidator.reason}</FormErrorMessage>
              </FormControl>
              <Button type="submit" colorScheme="green">
                Save
              </Button>
            </VStack>
          </form>
        </Flex>
      )}
    </Box>
  );
};

export default () => {
  const dispatch = useDispatch();
  const [list, setList] = useState<string[]>([]);
  const [site, setSite] = useState('https://news.ycombinator.com');
  const action = scrape({ url: site });
  const loader = useSelector((state) =>
    selectLoaderById(state, { id: `${scrape}` }),
  );
  const id = JSON.stringify(action);
  const data = useSelector((state: State) => selectDataById(state, { id }));
  const onSubmit = (e: any) => {
    e.preventDefault();
    dispatch(action);
  };

  /* useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []); */

  const props = {
    setList,
    list,
    html: data?.html || '',
    lists: data?.lists || [],
    isLoading: loader.isLoading,
  };

  return (
    <Flex h="100%" justify="space-between">
      <Box flex={1}>
        <form onSubmit={onSubmit}>
          <Flex mb={4}>
            <Input
              value={site}
              onChange={(e) => setSite(e.currentTarget.value)}
              h="42px"
              flex={1}
            />
            <Flex justify="flex-end" mr={2}>
              <Button
                type="submit"
                isLoading={loader.isLoading}
                variant="rainbow"
              >
                listifi!
              </Button>
            </Flex>
          </Flex>
        </form>
        <Flex>
          {!loader.isLoading && !loader.isSuccess ? (
            <Flex flex={1} h="100%" w="100%" align="center" justify="center">
              <VStack
                spacing={4}
                p={8}
                bgColor="gray.100"
                w="450px"
                borderRadius="5px"
              >
                <p>
                  The purpose of this feature is to make it easy to extract
                  lists from any publicly accessible website. The way it works
                  is simple: enter a website in the input box at the top of the
                  page and then press the button.
                </p>
                <p>
                  There are two methods for extracting lists from a website:
                  visually and automatically.
                </p>
                <p>
                  The visual method shows the actual website you entered and
                  allows the users to click on elements to extract the lists. We
                  try to pattern match to figure out all the other items in the
                  group you selected.
                </p>
                <p>
                  With the automatic method, we try to figure out patterns in
                  the website automatically to group text together into lists.
                  This process is not perfect but it does a fairly good job
                  grouping similar items together.
                </p>
              </VStack>
            </Flex>
          ) : (
            <Box flex={1} h="100%">
              <View {...props} />
            </Box>
          )}
        </Flex>
      </Box>
      <ListCreator {...props} />
    </Flex>
  );
};
