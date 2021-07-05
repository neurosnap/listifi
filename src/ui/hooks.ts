import { useEffect, useRef, useState } from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingState } from 'robodux';
import { selectLoaderById } from 'saga-query';
import { useToast } from '@chakra-ui/react';

import { createList, fetchStars } from '@app/lists';
import { defaultValidation, Validation } from '@app/validate';
import { selectEnv } from '@app/env';
import { State, ListClient } from '@app/types';
import { selectUser } from '@app/token';

export function useUrlPrefix() {
  const { apiUrl } = useSelector(selectEnv);
  return apiUrl;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay || 500]);

  return debouncedValue;
}

export function useValidator<Fn extends (...args: any[]) => Validation>(
  validator: Fn,
) {
  const [state, setState] = useState<Validation>(defaultValidation());
  const validate = (...args: Parameters<Fn>) => {
    const result = validator(...args);
    setState(result);
    return result;
  };
  return { ...state, validate };
}

export function useLoaderSuccess(cur: LoadingState, success: () => any) {
  const [prev, setPrev] = useState(cur);
  useEffect(() => {
    const curSuccess = !cur.isLoading && cur.isSuccess;
    if (prev.isLoading && curSuccess) success();
    setPrev(cur);
  }, [cur.isSuccess, cur.isLoading]);
}

export function useCreateListToast(
  onSuccess: (newList: ListClient) => any = () => {},
) {
  const loader = useSelector((state: State) =>
    selectLoaderById(state, { id: `${createList}` }),
  );
  const toast = useToast();

  useLoaderSuccess(loader, () => {
    const newList = loader.meta.list;
    toast({
      title: 'List has been created!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onSuccess(newList);
  });
}

export function useFetchStarsForUser() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  useEffect(() => {
    dispatch(fetchStars({ username: user.username }));
  }, [user.username]);
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const useDnD = ({
  move,
  index,
  itemId,
}: {
  move: (d: number, h: number) => any;
  index: number;
  itemId: string;
}) => {
  // drag and drop
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: 'CARD',
    hover(hitem: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = hitem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      move(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      /* eslint-disable no-param-reassign */
      hitem.index = hoverIndex;
      /* eslint-enable no-param-reassign */
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: 'CARD', id: itemId, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  return { isDragging, preview, ref };
};
