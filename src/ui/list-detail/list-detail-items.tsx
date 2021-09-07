import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { isMobile } from 'mobile-device-detect';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Box,
  Textarea,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';

import { orderListItems, createSelectItemsByList } from '@app/lists';
import { ListClient, PluginData, State } from '@app/types';
import { selectUser } from '@app/token';

import { ListItemDisplay } from './list-item';
import { ListSettings } from './list-settings';
import { ListItemCreator } from './list-item-creator';
import { ActionPlugins } from '../action-plugins';

const noop = () => {};
const selectItemsByList = createSelectItemsByList();
export const ListDetailItemsView = ({
  canEdit,
  pluginData,
  list,
}: {
  canEdit: boolean;
  pluginData: PluginData;
  list: ListClient;
}) => {
  const dispatch = useDispatch();
  const items = useSelector((state: State) =>
    selectItemsByList(state, { id: list.id }),
  );
  const user = useSelector(selectUser);
  const [nextItems, setNextItems] = useState(items);
  useEffect(() => {
    setNextItems(items);
  }, [items]);
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };
  const move = (dragIndex: number, hoverIndex: number) => {
    const nxi = [...nextItems];
    const item = nxi[dragIndex];
    nxi[dragIndex] = nxi[hoverIndex];
    nxi[hoverIndex] = item;
    setNextItems(nxi);
    dispatch(orderListItems({ listId: list.id, order: nxi.map((i) => i.id) }));
  };
  const rawValue = useMemo(
    () => nextItems.map((item) => item.text).join('\n'),
    [nextItems],
  );
  const backend = isMobile ? TouchBackend : HTML5Backend;

  const pluginTabs = useMemo(
    () => pluginData.plugins.filter((p) => p.tabMenuLabel && p.TabMenu),
    [pluginData.plugins],
  );
  const pluginActions = useMemo(
    () => pluginData.plugins.filter((p) => p.ActionItem),
    [pluginData.plugins],
  );
  const tabText = ['List', 'Raw', ...pluginTabs.map((p) => p.tabMenuLabel)];
  const tabItems = tabText.map((text) => <Tab key={text}>{text}</Tab>);
  const actionItems = (
    <Box>
      {canEdit ? <ListItemCreator listId={list.id} /> : null}
      {pluginActions.length > 0 ? (
        <Box mt={4}>
          <ActionPlugins pluginData={pluginData} list={list} />
        </Box>
      ) : null}
    </Box>
  );

  return (
    <Box>
      <Tabs index={tabIndex} onChange={handleTabsChange} id="list-detail-id">
        <TabList>
          {tabItems}
          {canEdit ? <Tab>Settings</Tab> : null}
        </TabList>

        <TabPanels>
          <TabPanel>
            <DndProvider backend={backend}>
              {nextItems.map((item, index) => (
                <ListItemDisplay
                  key={item.id}
                  item={item}
                  index={index}
                  move={move}
                  canEdit={canEdit}
                  pluginData={pluginData}
                />
              ))}
              {actionItems}
            </DndProvider>
          </TabPanel>
          <TabPanel>
            <Textarea
              h="xs"
              resize="vertical"
              variant="flushed"
              onChange={noop}
              value={rawValue}
            />
            {actionItems}
          </TabPanel>
          {pluginTabs.map((plugin) => {
            if (!plugin.TabMenu) {
              return null;
            }

            return (
              <TabPanel key={plugin.name}>
                <plugin.TabMenu userId={user.id} listId={list.id} />
              </TabPanel>
            );
          })}
          {canEdit ? (
            <TabPanel>
              <ListSettings list={list} />
            </TabPanel>
          ) : null}
        </TabPanels>
      </Tabs>
    </Box>
  );
};
