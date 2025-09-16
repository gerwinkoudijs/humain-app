"use client";

import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";

export const Settings = () => {
  const { isLoading: isSettingsLoading, data: settings = [] } =
    api.settings.listSettings.useQuery({ category: "ai" });
  const { isPending: isSettingUpdating, mutate: updateSetting } =
    api.settings.updateSetting.useMutation();

  if (isSettingsLoading) {
    return (
      <div className="w-full flex flex-col grow">
        <div className="flex flex-col items-center justify-center my-[100px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-end justify-center font-bold tracking-tight">
              <LoaderCircle size={64} className="animate-spin opacity-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col grow">
      <div className="flex flex-col items-start justify-center mb-[32px] gap-8">
        <div className="flex flex-col items-start justify-center mx-[32px] gap-4">
          <div className="flex flex-col gap-4">
            {settings.map((setting) => (
              <div
                key={setting.name}
                className="flex flex-col items-start justify-start gap-1"
              >
                <label className="text-sm">{setting.description}</label>
                <textarea
                  cols={80}
                  rows={5}
                  defaultValue={setting.value ?? ""}
                  onChange={(e) => {}}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
            ))}
          </div>
          <div
            className=" bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors text-white px-4 py-1 rounded-lg"
            onClick={async () => {
              //)
            }}
          >
            {false ? "Saving..." : "Save changes"}
          </div>
        </div>
      </div>
    </div>
  );
};
