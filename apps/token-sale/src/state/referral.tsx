import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { Address } from "viem";

export const refAtom = atomWithStorage<Address>(
  "referrer",
  `0x${"0".repeat(40)}`,
);

export const referrerLoadingStateAtom = atom(true);

export const loadingRefAtom = atom(
  (get) => {
    const referrer = get(refAtom);
    const isLoading = get(referrerLoadingStateAtom);
    return { referrer, isLoading };
  },
  (_get, set, newValue: Address) => {
    set(referrerLoadingStateAtom, false);
    set(refAtom, newValue);
  },
);

export const useReferrerAtom = () => useAtom(loadingRefAtom);
export const useReferrer = () => useAtomValue(refAtom);

// TODO: added to refresh state after loading address from storage
// find a way to simplify
export const useInitializeLoadingState = () => {
  const address = useAtomValue(refAtom);
  const setIsLoading = useSetAtom(referrerLoadingStateAtom);

  useEffect(() => {
    if (address !== null) {
      setIsLoading(false);
    }
  }, [address, setIsLoading]);
};
