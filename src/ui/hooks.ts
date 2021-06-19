import { useEffect, useRef, useState } from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import { useSelector } from 'react-redux';
import { LoadingState } from 'robodux';

import { defaultValidation, Validation } from '@app/validate';
import { selectEnv } from '@app/env';

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

interface UseFetch<D extends { [key: string]: any } = { [key: string]: any }> {
  loading: boolean;
  error: boolean;
  data: D;
}

function refineData<D = any>(data: any): D {
  return data;
}

export function useFetch<D = any>(uri: string, opts: RequestInit) {
  const env = useSelector(selectEnv);
  const url = `${env.apiUrl}/api${uri}`;
  const [state, setState] = useState<UseFetch<D>>({
    loading: false,
    data: refineData<D>({}),
    error: false,
  });
  useEffect(() => {
    setState({ loading: true, error: false, data: refineData<D>({}) });
    fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setState({ loading: false, data, error: false });
        return data;
      })
      .catch((err) => {
        setState({ loading: false, error: true, data: err });
      });
  }, [url]);
  return state;
}

export function useLoaderSuccess(cur: LoadingState, success: () => any) {
  const [prev, setPrev] = useState(cur);
  useEffect(() => {
    const curSuccess = !cur.isLoading && cur.isSuccess;
    if (prev.isLoading && curSuccess) success();
    setPrev(cur);
  }, [cur]);
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
