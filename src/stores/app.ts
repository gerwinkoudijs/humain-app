import { proxy } from "valtio";
import { useProxy } from "valtio/utils";

const state = proxy({});

export const useAppStore = () => {
  return useProxy(state);
};

export const appState = state;
