export class RegraNegocioError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'RegraNegocioError';
    this.status = status;
  }
}