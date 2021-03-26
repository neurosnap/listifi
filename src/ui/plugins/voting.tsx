import { selectEnv } from '@app/env';
import { selectHasTokenExpired } from '@app/token';
import {
  ApiVoteResponse,
  PluginComponentProps,
  PluginModule,
  PluginOnMount,
} from '@app/types';
import { ArrowUpIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Box, HStack, Tooltip } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

async function onListMount({ list, env, save }: PluginOnMount) {
  const res = await fetch(`${env.apiUrl}/api/votes/${list.id}`);
  const jso: ApiVoteResponse = await res.json();
  save(jso);
}

const Voting = ({
  item,
  userId,
  data,
  save,
}: PluginComponentProps<ApiVoteResponse>) => {
  const tally = data.tally || {};
  const votes = tally[item.id] || 0;
  const hasUserVoted = useMemo(() => {
    const dv = data.votes || [];
    return !!dv.find((v) => v.item_id === item.id && userId === v.user_id);
  }, [data]);
  const env = useSelector(selectEnv);
  const hasTokenExpired = useSelector(selectHasTokenExpired);
  const canVote = !hasTokenExpired;

  const vote = () => {
    fetch(`${env.apiUrl}/api/votes/${item.listId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_id: item.id,
        user_id: userId,
      }),
    })
      .then((res) => res.json())
      .then(save)
      .catch(console.error);
  };

  return (
    <HStack
      spacing={0}
      justify="center"
      align="center"
      position="relative"
      h="40px"
    >
      {canVote ? (
        <ChevronUpIcon
          cursor="pointer"
          color={hasUserVoted ? 'red.500' : 'gray.500'}
          onClick={vote}
          boxSize={6}
        />
      ) : null}
      {canVote ? (
        <Box>{votes}</Box>
      ) : (
        <Tooltip label="Sign in to vote on this list item!">
          <Box cursor="pointer">{votes}</Box>
        </Tooltip>
      )}
    </HStack>
  );
};

const plugin: PluginModule = {
  name: 'voting',
  Icon: () => <ArrowUpIcon />,
  onListMount,
  PocketMenuItem: Voting,
};

export default plugin;

/*
position="absolute"
        top="-15px"
        left="-7px"
*/
