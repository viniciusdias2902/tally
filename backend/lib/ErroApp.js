export class ErroApp extends Error {
  constructor(mensagem, codigoStatus) {
    super(mensagem);
    this.codigoStatus = codigoStatus;
  }
}
