export type Result<T, E> = Success<T, E> | Failure<T, E>;

export type Success<T, _> = {
  isSuccess: true;
  isFailure: false;
  value: T;
};

export type Failure<_, E> = {
  isSuccess: false;
  isFailure: true;
  value: E;
};

export const success = <T, E>(value: T): Result<T, E> => {
  return {
    isSuccess: true,
    isFailure: false,
    value,
  };
};

export const failure = <T, E>(value: E): Result<T, E> => {
  return {
    isSuccess: false,
    isFailure: true,
    value,
  };
};

export type SystemError = {
    type: 'system',
    message: string
    data: any
}

export type UserError = {
    type: 'user'
    message: string
    data: any
}