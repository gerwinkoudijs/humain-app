import { NextResponse as NextServerResponse } from "next/server";

export const ApiResponse = (data: any) => {
  return NextServerResponse.json(data, { status: 200 });
};

export const apiGet = async <T>(
  url: string,
  params?: { [key: string]: any },
  headers?: any
) => {
  const paramsFormatted = params
    ? Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&")
    : "";

  const call = async (
    retryCount: number,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => {
    try {
      const result = await fetch(`${url}?${paramsFormatted}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...headers,
        },
      });

      if (result?.statusText === "Too Many Requests") {
        // Try again
        if (retryCount < 3) {
          setTimeout(() => call(retryCount + 1, resolve, reject), 1000);
          return;
        }
      }

      const data = await result.json();

      if (data?.error && result.status !== 200) {
        //console.log(data);
        reject(data?.error);
        return;
      }

      resolve(data as T);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  };

  return new Promise<T>(async (resolve, reject) => {
    await call(0, resolve, reject);
  });
};

export const apiPost = async <T>(url: string, body: any, headers?: any) => {
  const call = async (
    retryCount: number,
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => {
    const result = await fetch(`${url}`, {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (result?.statusText === "Too Many Requests") {
      // Try again
      if (retryCount < 3) {
        setTimeout(() => call(retryCount + 1, resolve, reject), 1000);
        return;
      }
    }

    const data = await result.json();

    if (data?.error && result.status !== 200) {
      reject(data?.error);
      return;
    }

    resolve(data as T);
  };

  return new Promise<T>(async (resolve, reject) => {
    await call(0, resolve, reject);
  });
};
