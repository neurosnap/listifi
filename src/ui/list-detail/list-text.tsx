import { selectEnv } from '@app/env';
import { textParser } from '@app/text-parser';
import { listDetailUrl, USER_PREFIX } from '@app/routes';
import { Box, Link, Tag, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export function ListText({ text }: { text: string }) {
  const env = useSelector(selectEnv);
  const parsed = useMemo(
    () => textParser(text, `${env.apiUrl}${USER_PREFIX}/`),
    [text],
  );
  const navigate = useNavigate();
  const clickTag = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    str: string,
  ) => {
    e.stopPropagation();
    const [username, listname] = str.substring(1).split('/');
    navigate(listDetailUrl(username, listname));
  };

  return (
    <Box>
      {parsed.map((part) => {
        if (part.type === 'link') {
          return (
            <Link
              key={part.text}
              href={part.text}
              isExternal
              onClick={(e) => e.stopPropagation()}
            >
              {part.text}
            </Link>
          );
        }

        if (part.type === 'link-list') {
          return (
            <Tag
              key={part.text}
              cursor="pointer"
              onClick={(e) => clickTag(e, part.text)}
            >
              {part.text}
            </Tag>
          );
        }

        return (
          <Text key={part.text} display="inline" whiteSpace="pre-wrap">
            {part.text}
          </Text>
        );
      })}
    </Box>
  );
}
