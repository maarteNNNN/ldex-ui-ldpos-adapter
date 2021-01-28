const url = require('url');
const { createClient } = require('ldpos-client');

const DEFAULT_API_MAX_PAGE_SIZE = 100;
const DEFAULT_API_TIMEOUT = 20000;
const DEFAULT_NETHASH = 'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
const DEFAULT_PROTOCOL_VERSION = '1.1';
const DEFAULT_CLIENT_VERSION = '2.0.0';
const DEFAULT_INBOUND_PORT = 0;

class LDPoSAdapter {
  constructor(options) {
    this.apiURL = options.apiURL;
    this.apiMaxPageSize = options.apiMaxPageSize || DEFAULT_API_MAX_PAGE_SIZE;
    this.apiTimeout = options.apiTimeout || DEFAULT_API_TIMEOUT;
    this.nethash = options.nethash || DEFAULT_NETHASH;
    this.protocolVersion = options.protocolVersion || DEFAULT_PROTOCOL_VERSION;
    this.clientVersion = options.clientVersion || DEFAULT_CLIENT_VERSION;
    this.inboundPort = options.inboundPort || DEFAULT_INBOUND_PORT;

    let urlParts = url.parse(this.apiURL);

    this.client = createClient({
      hostname: urlParts.hostname,
      port: parseInt(urlParts.port),
      protocolVersion: this.protocolVersion,
      nethash: this.nethash,
      inboundPort: this.inboundPort,
      clientVersion: this.clientVersion
    });
  }

  async connect({ passphrase }) {
    await this.client.connect({ passphrase });
  }

  async disconnect() {
    this.client.disconnect();
  }

  createTransfer({ amount, recipientAddress, message, fee, timestamp }) {
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

  validatePassphrase({ passphrase }) {
    return this.client.validatePassphrase(passphrase);
  }

  async postTransaction({ transaction }) {
    await this.client.postTransaction(transaction);
  }

  async getLatestOutboundTransactions({ address, limit }) {
    return this.client.getOutboundTransactions(address, null, limit, 'desc');
  }

  async getAccountBalance({ address }) {
    let account = await this.client.getAccount(address);
    return account.balance;
  }
}

module.exports = LDPoSAdapter;
