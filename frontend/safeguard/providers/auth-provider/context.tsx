'use client';

import { createContext } from 'react';

export interface IUser {
  userId: number;
  accessToken: string;
  expireInSeconds: number;
}

export interface IAuthStateContext {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  user?: IUser;
}

export interface IAuthActionContext {
  login: (userNameOrEmailAddress: string, password: string) => void;
  register: (input: IRegisterInput) => void;
  logout: () => void;
}

export interface IRegisterInput {
  name: string;
  surname: string;
  userName: string;
  emailAddress: string;
  password: string;
}

export const INITIAL_STATE: IAuthStateContext = {
  isPending: false,
  isSuccess: false,
  isError: false,
  isAuthenticated: false,
};

export const AuthStateContext = createContext<IAuthStateContext>(INITIAL_STATE);
export const AuthActionContext = createContext<IAuthActionContext>({
  login: () => {},
  register: () => {},
  logout: () => {},
});
