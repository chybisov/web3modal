import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type {
  EthereumClient,
  GetDefaultConnectorsOpts,
  GetWalletConnectProviderOpts
} from '../types/apiTypes'

// -- private ------------------------------------------------------ //
let client = undefined as EthereumClient | undefined

function getWalletConnectConnector() {
  const walletConnect = client?.connectors.find(item => item.id === 'walletConnect')
  if (!walletConnect) throw new Error('Missing WalletConnect connector')

  return walletConnect
}

// -- public ------------------------------------------------------- //
export const Web3ModalEthereum = {
  getWalletConnectProvider({ projectId }: GetWalletConnectProviderOpts) {
    return jsonRpcProvider({
      rpc: chain => ({
        http: `https://rpc.walletconnect.com/v1/?chainId=eip155:${chain.id}&projectId=${projectId}`
      })
    })
  },

  getDefaultConnectors({ appName, chains }: GetDefaultConnectorsOpts) {
    return [
      new WalletConnectConnector({ chains, options: { qrcode: false } }),
      new InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new CoinbaseWalletConnector({ chains, options: { appName } }),
      new MetaMaskConnector({ chains })
    ]
  },

  createClient(wagmiClient: EthereumClient) {
    client = wagmiClient

    return this
  },

  async getWalletConnectUri() {
    const walletConnect = getWalletConnectConnector()
    const provider = await walletConnect.getProvider()

    return provider.connector.uri
  },

  async connectWalletConnect() {
    const walletConnect = getWalletConnectConnector()

    return walletConnect.connect()
  },

  async disconnectWalletConnect() {
    const walletConnect = getWalletConnectConnector()

    return walletConnect.disconnect()
  }
}
