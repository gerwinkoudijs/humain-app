import { isNonJsonSerializable } from "@trpc/client";
import { TRPCCombinedDataTransformer } from "@trpc/server";

import superjson from "superjson";

export const transformer: TRPCCombinedDataTransformer = {
  input: {
    serialize: (obj) => {
      if (isNonJsonSerializable(obj) || obj instanceof File) {
        return obj;
      } else {
        return superjson.serialize(obj);
      }
    },
    deserialize: (obj) => {
      if (isNonJsonSerializable(obj) || obj instanceof File) {
        return obj;
      } else {
        // eslint-disable-next-line
        return superjson.deserialize(obj);
      }
    },
  },
  output: superjson,
};
