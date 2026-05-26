// Chaves de localStorage do tutorial de onboarding.
// Centralizadas aqui para AuthContext e OnboardingContext não divergirem.

// Marcada no registro de uma conta nova; consumida pelo provider para
// disparar o tour automaticamente na primeira vez.
export const CHAVE_PENDENTE = "tally-onboarding-pendente";

// Marcada quando o usuário conclui ou pula o tour, para nunca repetir
// automaticamente. Por usuário, já que o localStorage é compartilhado no device.
export function chaveConcluido(usuarioId) {
  return `tally-onboarding-concluido-${usuarioId}`;
}
