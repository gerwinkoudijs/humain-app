import { get } from "https";
import { Readable } from "stream";

export const createUrlReadStream = (url: string): Readable => {
  const readable = new Readable({
    read() {}, // No-op
  });

  get(url, (response) => {
    response.on("data", (chunk: any) => {
      readable.push(chunk);
    });

    response.on("end", () => {
      readable.push(null); // End of stream
    });
  }).on("error", (error) => {
    readable.emit("error", error); // Forward the error to the readable stream
  });

  return readable;
};
