import { useTokenLists } from "@/state/tokenlist";
import { useMemo } from "react";
import { uniqBy } from "lodash";

export const useTokens = () => {
  const { lists } = useTokenLists();

  return useMemo(
    () =>
      uniqBy(
        lists.flatMap((l) => l.tokens),
        (t) => t.address + t.chainId,
      ),
    [lists],
  );
};
