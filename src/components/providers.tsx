"use client";
import '@rainbow-me/rainbowkit/styles.css';
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
sepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import {PrivyProvider} from '@privy-io/react-auth';

const config = getDefaultConfig({
  appName: "scw",
  projectId: `${process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}`,
  chains: [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <PrivyProvider
              appId='clxnfiyih00m1105o00qle7aa'
              config={{
                  /* Replace this with your desired login methods */
                  loginMethods: ['email', 'wallet'],
                  /* Replace this with your desired appearance configuration */
                  appearance: {
                      theme: 'light',
                      accentColor: '#676FFF',
                      logo: 'your-logo-url'
                  },
                  embeddedWallets: {
                      createOnLogin: 'users-without-wallets',
                      noPromptOnSignature: true
                  }
              }}
          >
        {children}
          </PrivyProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
