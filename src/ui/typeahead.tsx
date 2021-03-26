import { selectEnv } from '@app/env';
import { deserializeList } from '@app/lists';
import { listDetailUrl } from '@app/routes';
import { ListClient } from '@app/types';
import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebounce } from './hooks';

export interface TypeaheadProps {
  show: boolean;
  close: () => any;
  results: ListClient[];
  pos: number;
  getText: (l: ListClient) => string;
}

const tokenRe = new RegExp(/#[\w/-]+/);

export function useTypeahead(text: string): TypeaheadProps {
  const debounceValue = useDebounce(text, 300);
  const env = useSelector(selectEnv);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState(-1);
  const [results, setResults] = useState<ListClient[]>([]);
  const open = (p = -1) => {
    setShow(true);
    setPos(p);
  };
  const close = () => {
    setShow(false);
    setPos(-1);
  };
  const getText = (list: ListClient) => {
    const tt = text.substring(pos).replace(tokenRe, '');
    const nextText = [
      text.slice(0, pos),
      `${env.apiUrl}${listDetailUrl(list.username, list.urlName)} `,
      tt.slice(pos),
    ].join('');
    return nextText;
  };

  useEffect(() => {
    if (!show && text.slice(-1) === '#') {
      open(text.length - 1);
    }

    if (show && !text.includes('#')) {
      close();
    }
  }, [text]);

  useEffect(() => {
    const search = debounceValue.substring(pos + 1);
    if (show && search.length > 2) {
      fetch(`${env.apiUrl}/api/search/${search}`)
        .then((res) => res.json())
        .then((jso) => {
          const lists = jso.lists.map(deserializeList);
          setResults(lists);
          return jso;
        })
        .catch(console.error);
    }
  }, [debounceValue]);

  return { show, results, close, pos, getText };
}

export const Typeahead = ({
  typeahead,
  onSelect,
  refocus,
}: {
  typeahead: TypeaheadProps;
  onSelect: (t: string) => any;
  refocus: () => any;
}) => {
  if (!typeahead.show) {
    return null;
  }
  const select = (list: ListClient) => {
    const nextText = typeahead.getText(list);
    onSelect(nextText);
    typeahead.close();
    refocus();
  };

  return (
    <Box>
      <Box
        position="fixed"
        top={0}
        left={0}
        w="100vw"
        h="100vh"
        opacity={0}
        zIndex={2}
        onClick={typeahead.close}
      />
      <Box position="relative">
        <Box
          position="absolute"
          zIndex={3}
          bg="white"
          border="1px"
          borderColor="gray.200"
          w="100%"
        >
          {typeahead.results.map((list) => (
            <Box
              key={list.id}
              px={4}
              py={2}
              _hover={{ bg: 'blue.400', color: 'white', cursor: 'pointer' }}
              onClick={() => select(list)}
            >
              {list.username}/{list.urlName}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
