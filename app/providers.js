"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        background:
          "linear-gradient(60deg, rgba(0,0,0,1) 0%, rgba(10,0,30,1) 20%, rgba(0,0,0,1) 50%, rgba(15,0,30,1) 75%, rgba(20,0,40,1) 100%)",
      },
    },
  },
  colors: {
    brand: {
      100: "#f7fafc",
      900: "#1a202c",
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export function Providers({ children }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
