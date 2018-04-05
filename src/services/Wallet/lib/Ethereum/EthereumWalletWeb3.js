import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toChecksumAddress, toBigNumber } from 'Utilities/convert'

import { web3SendTx } from './util'
import EthereumWallet from './EthereumWallet'

const checkAccountAvailable = (address) => Promise.resolve(address)
  .then((resolvedAddress) => web3.eth.getAccounts()
    .then((accounts) => accounts
      .map((account) => account.toLowerCase())
      .includes(resolvedAddress.toLowerCase()))
    .then((isAvailable) => {
      if (!isAvailable) {
        throw new Error(`Could not find web3 Ethereum account ${resolvedAddress}`)
      }
    }))

export default class EthereumWalletWeb3 extends EthereumWallet {

  static type = 'EthereumWalletWeb3';

  constructor(address, providerName) {
    super()
    if (!address) {
      throw new Error('Wallet address must be provided')
    }
    this.address = address
    this.providerName = providerName || web3.providerName
  }

  getType = () => EthereumWalletWeb3.type;

  getTypeLabel = () => this.providerName === 'faast' ? 'Web3 Wallet' : this.providerName;

  getAddress = () => this.address;

  isSignTransactionSupported () {
    return web3.providerName !== 'MetaMask'
  }

  _checkAvailable = () => checkAccountAvailable(this.address);

  _signAndSendTxData (txData, options) {
    return web3SendTx(txData, false, options)
      .then((txId) => ({ id: txId }));
  }

  _signTxData (txData) {
    return Promise.resolve()
      .then(::this._assertSignTransactionSupported)
      .then(() =>
        web3.eth.signTransaction({
          ...txData,
          value: toBigNumber(txData.value),
          gas: toBigNumber(txData.gasLimit).toNumber(),
          gasPrice: toBigNumber(txData.gasPrice),
          nonce: toBigNumber(txData.nonce).toNumber()
        }));
  }

  static fromDefaultAccount = () => {
    const { defaultAccount, getAccounts } = web3.eth
    let addressPromise
    if (defaultAccount) {
      addressPromise = Promise.resolve(toChecksumAddress(defaultAccount))
    } else {
      addressPromise = getAccounts()
        .catch((err) => {
          log.error(err)
          throw new Error(`Error retrieving ${web3.providerName} account`)
        })
        .then(([address]) => {
          if (!address) {
            throw new Error(`Unable to retrieve ${web3.providerName} account. Please ensure your account is unlocked.`)
          }
          return address
        })
    }
    return addressPromise.then((address) => new EthereumWalletWeb3(address))
  };

}