export interface SuccessResult<D = any> {
  success: true;
  data: D;
}

export interface ErrorResult {
  success: false;
  data: {
    status: number;
    message: string;
  };
}

export type FnResult<D = any> = SuccessResult<D> | ErrorResult;
