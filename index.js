const url = require('url');
const { createClient } = require('ldpos-client');

const DEFAULT_API_MAX_PAGE_SIZE = 100;
const DEFAULT_API_TIMEOUT = 20000;
const DEFAULT_NETHASH = 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
const DEFAULT_SOCKET_PROTOCOL_VERSION = 1;
const DEFAULT_PEER_PROTOCOL_VERSION = '1.1';
const DEFAULT_CLIENT_VERSION = '2.0.0';

class LDPoSAdapter {
  constructor(options) {
    this.apiURL = options.apiURL;
    this.chainSymbol = options.chainSymbol;
    this.apiMaxPageSize = options.apiMaxPageSize || DEFAULT_API_MAX_PAGE_SIZE;
    this.apiTimeout = options.apiTimeout || DEFAULT_API_TIMEOUT;
    this.nethash = options.nethash || DEFAULT_NETHASH;
    this.socketProtocolVersion = options.socketProtocolVersion || DEFAULT_SOCKET_PROTOCOL_VERSION;
    this.peerProtocolVersion = options.peerProtocolVersion || DEFAULT_PEER_PROTOCOL_VERSION;
    this.clientVersion = options.clientVersion || DEFAULT_CLIENT_VERSION;

    let urlParts = url.parse(this.apiURL);

    this.client = createClient({
      networkSymbol: this.chainSymbol,
      hostname: urlParts.hostname,
      port: parseInt(urlParts.port),
      socketProtocolVersion: this.socketProtocolVersion,
      peerProtocolVersion: this.peerProtocolVersion,
      nethash: this.nethash,
      clientVersion: this.clientVersion
    });
  }

  async connect({ passphrase }) {
    await this.client.connect({ passphrase });
    try {
      await this.client.syncKeyIndex('sig');
    } catch (error) {}
  }

  async disconnect() {
    this.client.disconnect();
  }

  async createTransfer({ amount, recipientAddress, message, fee, timestamp }) {
    return this.client.prepareTransaction({
      type: 'transfer',
      recipientAddress,
      amount,
      fee,
      timestamp: timestamp == null ? Date.now() : timestamp,
      message
    });
  }

  createWallet() {
    return this.client.generateWallet();
  }

  getAddressFromPassphrase({ passphrase }) {
    return this.client.computeWalletAddressFromPassphrase(passphrase);
  }

  validatePassphrase({ passphrase }) {
    return this.client.validatePassphrase(passphrase);
  }

  async postTransaction({ transaction }) {
    await this.client.postTransaction(transaction);
  }

  async getLatestOutboundTransactions({ address, limit }) {
    return this.client.getOutboundTransactions(address, null, limit, 'desc');
  }

  async getAccountNextKeyIndex({ address }) {
    let account = await this.client.getAccount(address);
    return account.nextSigKeyIndex;
  }

  async getAccountBalance({ address }) {
    let account = await this.client.getAccount(address);
    return account.balance;
  }
}

module.exports = LDPoSAdapter;
