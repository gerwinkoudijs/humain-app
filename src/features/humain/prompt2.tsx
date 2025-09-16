"use client";

import { api } from "@/trpc/react";
import Image from "next/image";

export const PromptStep2 = (props: { base64Image: string }) => {
  return <div>..</div>;
  // const {
  //   isPending: generateVisualPending,
  //   mutate: generateVisual,
  //   data: generateVisualResult,
  // } = api.humain.generateImageStep2.useMutation();

  // return (
  //   <div className="w-full flex flex-col grow">
  //     <div className="flex flex-col items-start justify-center mb-[32px] gap-8">
  //       {/* {props.uploadUrls.map((url) => (
  //         <div key={url}>{url}</div>
  //       ))} */}

  //       <div className="flex flex-col items-start justify-center mx-[32px] gap-4">
  //         <div className="flex flex-col gap-2 items-start justify-center">
  //           <div
  //             className=" bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors text-white px-4 py-1 rounded-lg"
  //             onClick={async () =>
  //               await generateVisual(
  //                 {
  //                   imageBase64: props.base64Image,
  //                 },
  //                 {
  //                   onSuccess: (data) => {
  //                     //..
  //                   },
  //                 }
  //               )
  //             }
  //           >
  //             {generateVisualPending ? "Generating..." : "Generate step 2"}
  //           </div>
  //         </div>

  //         {generateVisualResult?.base64Image && (
  //           <div className="bg-neutral-100 w-full p-4 rounded-lg">
  //             <Image
  //               src={`data:image/png;base64,${generateVisualResult.base64Image}`}
  //               //src={generateVisualResult.base64Image}
  //               alt="Generated Visual Step 2"
  //               width={500}
  //               height={500}
  //             />
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
};
